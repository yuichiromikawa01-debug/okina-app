#!/usr/bin/env python3
"""Generate demo placeholder images for Okina catalog paths.

By default, only creates files that do not already exist — never overwrites
user-dropped assets. Pass --force to regenerate everything (destructive).
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
CATALOG = ROOT / "src" / "data" / "catalog"

PNG_OPTIMIZE = True

PALETTES = {
    "heartbreak": ("#3d2c4a", "#e8b4cb"),
    "wine-deep": ("#4a1c2b", "#c9a87c"),
    "baystars-success": ("#0d2b5e", "#4a9fd8"),
    "ohtani-mind": ("#1a1a2e", "#c0d800"),
    "twenties-goals": ("#2d4a3e", "#f5d6a8"),
}

WORK_PALETTE = ("#2a2a2a", "#c0d800")


def load_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for path in (
        "/System/Library/Fonts/ヒラギノ角ゴシック W3.ttc",
        "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
        "/Library/Fonts/Arial.ttf",
    ):
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_label(
    img: Image.Image,
    title: str,
    subtitle: str | None = None,
    *,
    accent: str,
    align: str = "center",
) -> None:
    draw = ImageDraw.Draw(img)
    w, h = img.size

    title_font = load_font(max(18, w // 14))
    sub_font = load_font(max(12, w // 22))

    lines = [title]
    if subtitle:
        lines.append(subtitle)

    line_heights = []
    line_widths = []
    for i, line in enumerate(lines):
        font = title_font if i == 0 else sub_font
        bbox = draw.textbbox((0, 0), line, font=font)
        line_heights.append(bbox[3] - bbox[1])
        line_widths.append(bbox[2] - bbox[0])

    total_h = sum(line_heights) + (8 if subtitle else 0)
    pad = max(16, w // 16)

    if align == "bottom":
        y = h - pad - total_h
    else:
        y = (h - total_h) // 2

    for i, line in enumerate(lines):
        font = title_font if i == 0 else sub_font
        fill = accent if i == 0 else "#f5f1e9"
        tw = line_widths[i]
        x = (w - tw) // 2
        draw.text((x, y), line, font=font, fill=fill)
        y += line_heights[i] + (8 if i == 0 and subtitle else 0)


def save_image(
    path: Path,
    size: tuple[int, int],
    bg: str,
    title: str,
    subtitle: str | None,
    accent: str,
    *,
    align: str = "center",
    force: bool = False,
) -> str:
    """Write a placeholder image. Returns 'wrote', 'skipped', or 'forced'."""
    if path.exists() and not force:
        print(f"  skip {path.relative_to(ROOT)} (already exists)")
        return "skipped"

    path.parent.mkdir(parents=True, exist_ok=True)
    existed = path.exists()
    img = Image.new("RGB", size, bg)
    draw_label(img, title, subtitle, accent=accent, align=align)
    img.save(path, "PNG", optimize=PNG_OPTIMIZE)
    action = "forced" if existed and force else "wrote"
    print(f"  {action} {path.relative_to(ROOT)} ({size[0]}x{size[1]})")
    return action


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Generate missing demo placeholder images for Okina catalog paths."
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite existing image files (destructive — do not use on real assets).",
    )
    parser.add_argument(
        "--with-detail",
        action="store_true",
        help="Also generate detail.png placeholders (off by default — add detail images manually).",
    )
    args = parser.parse_args()

    stats = {"wrote": 0, "skipped": 0, "forced": 0}

    for catalog_file in sorted(CATALOG.glob("*.json")):
        if catalog_file.name == "collections.json":
            continue
        data = json.loads(catalog_file.read_text(encoding="utf-8"))
        slug = data["slug"]
        bg, accent = PALETTES.get(slug, ("#1a1a1a", "#c0d800"))

        # detail.png is intentionally omitted — catalog JSON may reference the path,
        # but users add detail images manually. Pass --with-detail to generate placeholders.
        collection_images = (
            (
                PUBLIC / "collections" / slug / "hero.png",
                (1200, 1600),
                data["title"],
                data["category"],
                "center",
            ),
            (
                PUBLIC / "collections" / slug / "square.png",
                (800, 800),
                data["title"],
                None,
                "bottom",
            ),
        )
        if args.with_detail:
            collection_images += (
                (
                    PUBLIC / "collections" / slug / "detail.png",
                    (1200, 680),
                    data["title"],
                    None,
                    "center",
                ),
            )

        for path, size, title, subtitle, align in collection_images:
            action = save_image(
                path,
                size,
                bg,
                title,
                subtitle,
                accent,
                align=align,
                force=args.force,
            )
            stats[action] += 1

        for work in data.get("works", []):
            work_slug = work["slug"]
            action = save_image(
                PUBLIC / "works" / work_slug / "cover.png",
                (600, 900),
                WORK_PALETTE[0],
                work["title"],
                work["author"],
                WORK_PALETTE[1],
                align="center",
                force=args.force,
            )
            stats[action] += 1

    print(
        f"Done. wrote={stats['wrote']} skipped={stats['skipped']} forced={stats['forced']}"
    )


if __name__ == "__main__":
    main()
