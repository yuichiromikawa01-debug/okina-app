#!/usr/bin/env python3
"""Generate demo placeholder images for Okina catalog paths."""

from __future__ import annotations

import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
CATALOG = ROOT / "src" / "data" / "catalog"

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
) -> None:
    draw = ImageDraw.Draw(img)
    w, h = img.size
    draw.rectangle((0, 0, w, h), fill=(0, 0, 0, 40))

    title_font = load_font(max(18, w // 14))
    sub_font = load_font(max(12, w // 22))

    lines = [title]
    if subtitle:
        lines.append(subtitle)

    line_heights = []
    for i, line in enumerate(lines):
        font = title_font if i == 0 else sub_font
        bbox = draw.textbbox((0, 0), line, font=font)
        line_heights.append(bbox[3] - bbox[1])

    total_h = sum(line_heights) + (8 if subtitle else 0)
    y = (h - total_h) // 2

    for i, line in enumerate(lines):
        font = title_font if i == 0 else sub_font
        fill = accent if i == 0 else "#f5f1e9"
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        draw.text(((w - tw) // 2, y), line, font=font, fill=fill)
        y += line_heights[i] + (8 if i == 0 and subtitle else 0)


def save_image(path: Path, size: tuple[int, int], bg: str, title: str, subtitle: str | None, accent: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    img = Image.new("RGB", size, bg)
    draw_label(img, title, subtitle, accent=accent)
    img.save(path, "PNG")
    print(f"  wrote {path.relative_to(ROOT)}")


def main() -> None:
    for catalog_file in sorted(CATALOG.glob("*.json")):
        if catalog_file.name == "collections.json":
            continue
        data = json.loads(catalog_file.read_text(encoding="utf-8"))
        slug = data["slug"]
        bg, accent = PALETTES.get(slug, ("#1a1a1a", "#c0d800"))

        save_image(
            PUBLIC / "collections" / slug / "hero.png",
            (1200, 1600),
            bg,
            data["title"],
            data["category"],
            accent,
        )
        save_image(
            PUBLIC / "collections" / slug / "square.png",
            (800, 800),
            bg,
            data["title"],
            None,
            accent,
        )

        for work in data.get("works", []):
            work_slug = work["slug"]
            save_image(
                PUBLIC / "works" / work_slug / "cover.png",
                (600, 900),
                WORK_PALETTE[0],
                work["title"],
                work["author"],
                WORK_PALETTE[1],
            )

    print("Done.")


if __name__ == "__main__":
    main()
