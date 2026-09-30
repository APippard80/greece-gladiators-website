"""
Sync the Sponsors / Fundraisers / Community Service cards from Google Drive.

Drive layout (folder names must match; letter case doesn't matter):

    Gladiators 12U Black Website/          <- DRIVE_ROOT_FOLDER_ID points here
        Sponsors/
            <any image here>               <- the sponsor flyer (optional)
            Smith Plumbing/                <- one folder per sponsor
                logo.png
                Details                    <- Google Doc (template below)
        Fundraisers/
            World Series Squares/
                main.jpg
                Details
        Community Service/
            Our Father's House/
                photo.jpg
                Details

"Details" template (every line optional except Description text):

    Title: World Series Squares
    Date: October 2026
    Status: Upcoming            (Upcoming / Active / Completed / Hidden)
    Link: https://...
    Description:
    Grab a square for the World Series...

Writes js/content.json and resized photos under assets/content/. Photos that are
no longer used are deleted, so assets/content/ always matches Drive.

Usage:
    python scripts/sync_content.py                     # read Google Drive
    python scripts/sync_content.py --local path/to/dir # read a local folder laid
                                                       # out the same way (testing)

Google Drive mode needs two environment variables:
    GOOGLE_SERVICE_ACCOUNT_JSON  the service account key (the JSON text itself)
    DRIVE_ROOT_FOLDER_ID         the ID of the "Gladiators 12U Black Website" folder
"""

import argparse
import hashlib
import io
import json
import os
import re
import sys
from datetime import datetime
from pathlib import Path

from PIL import Image, ImageOps

try:
    from pillow_heif import register_heif_opener  # iPhone .HEIC photos
    register_heif_opener()
except ImportError:
    pass

SITE_ROOT = Path(__file__).resolve().parent.parent
CONTENT_JSON = SITE_ROOT / "js" / "content.json"
CONTENT_ASSETS = SITE_ROOT / "assets" / "content"

# Drive folder name -> (content.json key, asset subfolder)
SECTIONS = {
    "sponsors": ("sponsors", "sponsors"),
    "fundraisers": ("fundraisers", "fundraisers"),
    "community service": ("communityService", "community-service"),
}

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif"}
STATUSES = {"upcoming": "Upcoming", "active": "Active", "completed": "Completed", "hidden": "Hidden"}
STATUS_ORDER = {"Active": 0, "Upcoming": 1, "Completed": 2}
MAX_PHOTO_PX = 1200
MAX_FLYER_PX = 1400

DATE_FORMATS = ["%B %d, %Y", "%b %d, %Y", "%B %d %Y", "%b %d %Y", "%m/%d/%Y", "%m/%d/%y",
                "%Y-%m-%d", "%B %Y", "%b %Y"]

warnings = []


def warn(msg):
    warnings.append(msg)
    print("WARNING: " + msg, file=sys.stderr)


# ---------------------------------------------------------------- sources ---

class DriveSource:
    """Reads folders/files from Google Drive with a read-only service account."""

    FOLDER = "application/vnd.google-apps.folder"
    GDOC = "application/vnd.google-apps.document"

    def __init__(self, key_json, root_id):
        from google.oauth2 import service_account
        from googleapiclient.discovery import build

        creds = service_account.Credentials.from_service_account_info(
            json.loads(key_json), scopes=["https://www.googleapis.com/auth/drive.readonly"])
        self.api = build("drive", "v3", credentials=creds, cache_discovery=False)
        self.root_id = root_id

    def _list(self, folder_id):
        items, token = [], None
        while True:
            res = self.api.files().list(
                q=f"'{folder_id}' in parents and trashed = false",
                fields="nextPageToken, files(id, name, mimeType, modifiedTime)",
                pageSize=200, pageToken=token,
                supportsAllDrives=True, includeItemsFromAllDrives=True).execute()
            items += res.get("files", [])
            token = res.get("nextPageToken")
            if not token:
                return items

    def children(self, node):
        """Returns [(name, kind, handle)], kind in {'folder', 'doc', 'text', 'image', 'other'}."""
        out = []
        for f in self._list(node or self.root_id):
            ext = Path(f["name"]).suffix.lower()
            if f["mimeType"] == self.FOLDER:
                kind = "folder"
            elif f["mimeType"] == self.GDOC:
                kind = "doc"
            elif f["mimeType"] == "text/plain" or ext == ".txt":
                kind = "text"
            elif f["mimeType"].startswith("image/") or ext in IMAGE_EXTS:
                kind = "image"
            else:
                kind = "other"
            out.append((f["name"], kind, f))
        return out

    def read_text(self, handle):
        if handle["mimeType"] == self.GDOC:
            data = self.api.files().export(fileId=handle["id"], mimeType="text/plain").execute()
        else:
            data = self.api.files().get_media(fileId=handle["id"]).execute()
        return data.decode("utf-8", errors="replace")

    def read_bytes(self, handle):
        return self.api.files().get_media(fileId=handle["id"]).execute()

    def version(self, handle):
        return handle["id"] + handle.get("modifiedTime", "")


class LocalSource:
    """Reads the same layout from a folder on disk (Details as Details.txt)."""

    def __init__(self, root):
        self.root = Path(root)

    def children(self, node):
        folder = node or self.root
        out = []
        for p in sorted(folder.iterdir()):
            ext = p.suffix.lower()
            kind = ("folder" if p.is_dir() else "text" if ext == ".txt"
                    else "image" if ext in IMAGE_EXTS else "other")
            out.append((p.name, kind, p))
        return out

    def read_text(self, handle):
        return handle.read_text(encoding="utf-8", errors="replace")

    def read_bytes(self, handle):
        return handle.read_bytes()

    def version(self, handle):
        stat = handle.stat()
        return f"{handle}:{stat.st_size}:{stat.st_mtime_ns}"


# ---------------------------------------------------------------- parsing ---

FIELD_RE = re.compile(r"^\s*[*\-•]?\s*(title|date|status|link|description)\s*:\s*(.*)$", re.I)


def parse_details(text):
    """Parses the Title/Date/Status/Link/Description template."""
    fields, desc_lines, in_desc = {}, [], False
    for line in text.replace("﻿", "").replace("\r\n", "\n").split("\n"):
        if in_desc:  # everything after "Description:" is the description, as written
            desc_lines.append(line.rstrip())
            continue
        m = FIELD_RE.match(line)
        if not m:
            continue
        key, value = m.group(1).lower(), m.group(2).strip()
        if key == "description":
            in_desc = True
            if value:
                desc_lines.append(value)
        else:
            fields[key] = value
    fields["description"] = re.sub(r"\n{3,}", "\n\n", "\n".join(desc_lines)).strip()
    return fields


def parse_date(text):
    """Returns 'YYYY-MM-DD' for sorting, or '' if the date can't be read."""
    cleaned = re.sub(r"(\d)(st|nd|rd|th)\b", r"\1", text.strip(), flags=re.I)
    cleaned = re.sub(r"^(mon|tue|tues|wed|thu|thur|thurs|fri|sat|sun)[a-z]*,?\s+", "", cleaned, flags=re.I)
    cleaned = re.sub(r"\s+", " ", cleaned).rstrip(".")
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(cleaned, fmt).strftime("%Y-%m-%d")
        except ValueError:
            pass
    return ""


def normalize_status(text, section_key, folder_name):
    if not text:
        return "" if section_key == "sponsors" else "Upcoming"
    status = STATUSES.get(text.strip().lower())
    if not status:
        warn(f"'{folder_name}': unknown Status '{text}' - showing it as Upcoming")
        return "Upcoming"
    return status


def safe_link(text):
    text = (text or "").strip()
    if not text:
        return None
    if not re.match(r"^https?://", text, re.I):
        if re.match(r"^[\w.-]+\.[a-z]{2,}(/.*)?$", text, re.I):
            return "https://" + text
        warn(f"ignoring Link '{text}' (not a web address)")
        return None
    return text


def slugify(text):
    slug = re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
    return slug or "item"


# ----------------------------------------------------------------- photos ---

def save_photo(src, handle, subdir, slug, max_px, used):
    """Resizes a photo into assets/content/<subdir>/ and returns its site path."""
    digest = hashlib.sha1(src.version(handle).encode()).hexdigest()[:8]
    out_dir = CONTENT_ASSETS / subdir
    existing = list(out_dir.glob(f"{slug}-{digest}.*")) if out_dir.exists() else []
    if existing:
        path = existing[0]
    else:
        im = Image.open(io.BytesIO(src.read_bytes(handle)))
        im = ImageOps.exif_transpose(im)
        im.thumbnail((max_px, max_px))
        has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
        out_dir.mkdir(parents=True, exist_ok=True)
        if has_alpha:
            path = out_dir / f"{slug}-{digest}.png"
            im.convert("RGBA").save(path, optimize=True)
        else:
            path = out_dir / f"{slug}-{digest}.jpg"
            im.convert("RGB").save(path, quality=85, optimize=True)
    used.add(path.resolve())
    return path.relative_to(SITE_ROOT).as_posix()


def pick_photo(images):
    """Prefers a file named 'main.*'; otherwise the first photo by name."""
    images = sorted(images, key=lambda x: x[0].lower())
    for name, handle in images:
        if Path(name).stem.lower() == "main":
            return handle
    return images[0][1] if images else None


# ------------------------------------------------------------------- sync ---

def sort_items(items):
    """Active, then Upcoming (soonest first), then Completed (most recent first).
    Cards without a readable date go at the end of their group."""
    ordered = []
    for group in (0, 1, 2):
        members = [i for i in items if STATUS_ORDER.get(i["status"], 1) == group]
        dated = sorted((i for i in members if i["dateSort"]), key=lambda i: i["dateSort"], reverse=group == 2)
        ordered += dated + [i for i in members if not i["dateSort"]]
    return ordered


def build_item(src, section_key, subdir, folder_name, folder_handle, used):
    kids = src.children(folder_handle)
    docs = [(n, h) for n, k, h in kids if k in ("doc", "text")]
    images = [(n, h) for n, k, h in kids if k == "image"]

    details_handle = next((h for n, h in docs if Path(n).stem.strip().lower() == "details"), None)
    if details_handle is None and docs:
        details_handle = docs[0][1]
    if details_handle is None:
        warn(f"'{folder_name}' has no Details doc - showing the folder name only")
        fields = {}
    else:
        fields = parse_details(src.read_text(details_handle))

    title = fields.get("title") or folder_name
    status = normalize_status(fields.get("status", ""), section_key, folder_name)
    if status == "Hidden":
        return None
    date = fields.get("date", "")
    date_sort = parse_date(date) if date else ""
    if date and not date_sort:
        warn(f"'{folder_name}': couldn't read Date '{date}' for sorting (it still shows as typed)")

    image = None
    photo = pick_photo(images)
    if photo is not None:
        try:
            image = save_photo(src, photo, subdir, slugify(folder_name), MAX_PHOTO_PX, used)
        except Exception as e:  # a bad photo shouldn't take the whole card down
            warn(f"'{folder_name}': couldn't process the photo ({e})")

    return {
        "date": date,
        "dateSort": date_sort,
        "description": fields.get("description", ""),
        "image": image,
        "link": safe_link(fields.get("link")),
        "status": status,
        "title": title,
    }


def sync(src):
    top = {name.strip().lower(): handle for name, kind, handle in src.children(None) if kind == "folder"}
    found = [name for name in SECTIONS if name in top]
    if not found:
        raise SystemExit("ERROR: none of the Sponsors / Fundraisers / Community Service folders were found "
                         "in the Drive folder - is DRIVE_ROOT_FOLDER_ID right, and is the folder shared "
                         "with the service account? Leaving the site unchanged.")

    content = {"sponsorFlyer": None}
    used = set()
    for name, (key, subdir) in SECTIONS.items():
        items = []
        if name not in top:
            warn(f"no '{name.title()}' folder in Drive - that page will show as empty")
        else:
            for child_name, kind, handle in src.children(top[name]):
                if kind == "folder":
                    try:
                        item = build_item(src, key, subdir, child_name.strip(), handle, used)
                    except Exception as e:
                        warn(f"skipping '{child_name}' in {name.title()} ({e})")
                        continue
                    if item:
                        items.append(item)
                elif kind == "image" and key == "sponsors" and content["sponsorFlyer"] is None:
                    content["sponsorFlyer"] = {
                        "image": save_photo(src, handle, subdir, "sponsor-flyer", MAX_FLYER_PX, used)}
        content[key] = sort_items(items)
        print(f"{name.title()}: {len(items)} card(s)")

    CONTENT_JSON.write_text(json.dumps(content, indent=2, sort_keys=True, ensure_ascii=False) + "\n",
                            encoding="utf-8")

    # Remove photos from folders that were deleted or replaced in Drive.
    if CONTENT_ASSETS.exists():
        for f in CONTENT_ASSETS.rglob("*"):
            if f.is_file() and f.resolve() not in used:
                f.unlink()
                print(f"removed old photo {f.relative_to(SITE_ROOT).as_posix()}")


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--local", help="read from a local folder instead of Google Drive")
    args = parser.parse_args()

    if args.local:
        src = LocalSource(args.local)
    else:
        key_json = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "").strip()
        root_id = os.environ.get("DRIVE_ROOT_FOLDER_ID", "").strip()
        if not key_json or not root_id:
            raise SystemExit("ERROR: set GOOGLE_SERVICE_ACCOUNT_JSON and DRIVE_ROOT_FOLDER_ID (or use --local).")
        src = DriveSource(key_json, root_id)

    sync(src)
    if warnings:
        print(f"\n{len(warnings)} warning(s) - see above.")


if __name__ == "__main__":
    main()
