#!/usr/bin/env python3
"""Download book cover images for demo works (Open Library + LoremFlickr + Picsum)."""

from __future__ import annotations

import ssl
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORKS_DIR = ROOT / "public" / "works"

# slug -> (source, value)  source: "ol" | "flickr" | "picsum"
COVER_SOURCES: dict[str, tuple[str, str]] = {
    # heartbreak
    "until-dawn": ("flickr", "night,book,sad"),
    "grammar-of-parting": ("ol", "2237620"),  # Murakami — Norwegian Wood
    "chemistry-of-tears": ("ol", "409670"),  # Yoshimoto — Kitchen
    "ex-bookshelf": ("flickr", "bookshelf,books"),
    "seventy-two-hours": ("flickr", "journal,notebook,writing"),
    # wine-deep
    "terroir-notes": ("flickr", "vineyard,wine"),
    "glass-and-pour": ("flickr", "wine,glass"),
    "burgundy-walk": ("flickr", "wine,bottle,cellar"),
    "pairing-at-home": ("flickr", "wine,food,dinner"),
    "natural-wine-era": ("flickr", "wine,winery"),
    # baystars-success
    "stadium-experience": ("flickr", "baseball,stadium"),
    "community-blue": ("flickr", "baseball,team,fans"),
    "data-and-emotion": ("flickr", "analytics,data,chart"),
    "sponsor-value": ("flickr", "business,meeting,office"),
    "youth-pipeline": ("flickr", "baseball,youth,sports"),
    # ohtani-mind
    "dual-discipline": ("flickr", "baseball,pitcher"),
    "quiet-ambition": ("flickr", "baseball,training"),
    "recovery-science": ("flickr", "sports,fitness,recovery"),
    "focus-protocol": ("flickr", "meditation,focus,running"),
    "team-leadership": ("flickr", "teamwork,leadership,sports"),
    # twenties-goals
    "twenty-design": ("flickr", "planner,notebook,goals"),
    "solo-living": ("flickr", "apartment,home,alone"),
    "adventure-budget": ("flickr", "travel,mountain,adventure"),
    "weak-ties": ("flickr", "networking,people,coffee"),
    "health-capital": ("flickr", "health,fitness,yoga"),
}


def build_url(source: str, value: str, slug: str) -> str:
    if source == "ol":
        return f"https://covers.openlibrary.org/b/id/{value}-L.jpg"
    if source == "flickr":
        tags = value.replace(" ", "")
        return f"https://loremflickr.com/600/900/{tags}/all?lock={slug}"
    if source == "picsum":
        return f"https://picsum.photos/seed/{slug}-{value}/600/900"
    raise ValueError(f"Unknown source: {source}")


def download(url: str) -> bytes:
    ctx = ssl.create_default_context()
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "okina-app-cover-fetch/1.0"},
    )
    with urllib.request.urlopen(req, context=ctx, timeout=45) as resp:
        data = resp.read()
    if len(data) < 8000:
        raise ValueError(f"Response too small ({len(data)} bytes)")
    return data


def save_as_png(data: bytes, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    tmp = dest.with_suffix(".jpg.tmp")
    tmp.write_bytes(data)
    result = subprocess.run(
        ["sips", "-s", "format", "png", str(tmp), "--out", str(dest)],
        capture_output=True,
        text=True,
    )
    tmp.unlink(missing_ok=True)
    if result.returncode != 0:
        dest.write_bytes(data)
        raise RuntimeError(f"sips failed: {result.stderr}")


def main() -> int:
    ok, fail = 0, 0
    for slug, (source, value) in COVER_SOURCES.items():
        dest = WORKS_DIR / slug / "cover.png"
        url = build_url(source, value, slug)
        try:
            data = download(url)
            save_as_png(data, dest)
            size_kb = dest.stat().st_size // 1024
            print(f"OK  {slug}/cover.png ({size_kb} KB) [{source}]")
            ok += 1
        except (urllib.error.URLError, ValueError, OSError, RuntimeError) as e:
            # fallback to picsum
            try:
                fb = build_url("picsum", "cover", slug)
                data = download(fb)
                save_as_png(data, dest)
                size_kb = dest.stat().st_size // 1024
                print(f"OK  {slug}/cover.png ({size_kb} KB) [picsum fallback]")
                ok += 1
            except Exception as e2:
                print(f"FAIL {slug}: {e} / fallback: {e2}", file=sys.stderr)
                fail += 1
    print(f"\nDone: {ok} ok, {fail} failed")
    return 1 if fail else 0


if __name__ == "__main__":
    raise SystemExit(main())
