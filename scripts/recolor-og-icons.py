#!/usr/bin/env python3
"""
Tint OG-card icons from C's PAL Icons master set into the colors the
card systems need, and write them to public/icons/og/.

C exports each icon once (single-color silhouette, transparent
background) from her Canva PAL Icons design. This script reads those
PNGs and writes per-color variants (currently light-coral #FFBABD for
coral/seafoam/navy cards, navy-mid #1B2D4C for yellow cards).

The companion runtime loader is `loadPngIcon(name, hexColor)` in
`src/lib/brandedOG.tsx`. It resolves <name>-<HEX>.png based on the
card system's iconColor token, so a single source icon ends up
correctly tinted for whatever card it appears on.

Usage:
    python3 scripts/recolor-og-icons.py [source_folder]

Default source folder: ~/Desktop/PAL Icons
"""
from PIL import Image
import os
import sys

DEFAULT_SRC = os.path.expanduser("~/Desktop/PAL Icons")
DEST = os.path.join(
    os.path.dirname(__file__), "..", "public", "icons", "og"
)

# Source filename → web-safe icon name (shape-named, not category-named).
# Add entries here when C drops new icons.
NAME_MAP = {
    "13.png": "golf-cart",
    "23.png": "palm",
    "Art.png": "art",
    "Beach.png": "beach-umbrella",
    "Birding.png": "bird",
    "Book.png": "book",
    "Do.png": "do",
    "Drink.png": "drink",
    "Drive.png": "drive",
    "Driver.png": "driver",
    "Eat.png": "eat",
    "Events.png": "calendar",
    "Fish.png": "fish",
    "Housekeeping.png": "mop",
    "Location Heart.png": "location-heart",
    "Maintenance.png": "tools",
    "Music.png": "music",
    "Shell.png": "shell",
    "Shop.png": "shop",
    "Stay.png": "house",
    "Surfboard.png": "surfboard",
    "Taco.png": "taco",
    "Tarpon.png": "tarpon",
}

# Output tints — must match iconColor values in CARD_SYSTEMS (brandedOG.tsx)
COLORS = {
    "FFBABD": (0xFF, 0xBA, 0xBD),  # light coral — coral/seafoam/navy cards
    "1B2D4C": (0x1B, 0x2D, 0x4C),  # navy mid    — yellow cards
}


def recolor(src_path: str, dest_path: str, rgb: tuple[int, int, int]) -> None:
    """Replace all non-transparent pixels with `rgb`, preserving alpha."""
    img = Image.open(src_path).convert("RGBA")
    alpha = img.split()[3]
    solid = Image.new("RGBA", img.size, rgb + (0,))
    solid.putalpha(alpha)
    solid.save(dest_path, optimize=True)


def main() -> int:
    src_folder = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_SRC
    if not os.path.isdir(src_folder):
        print(f"Source folder not found: {src_folder}")
        return 1

    os.makedirs(DEST, exist_ok=True)
    written = 0
    for src_name, web_name in NAME_MAP.items():
        src_path = os.path.join(src_folder, src_name)
        if not os.path.exists(src_path):
            print(f"SKIP: {src_name} not found in {src_folder}")
            continue
        for hex_label, rgb in COLORS.items():
            out_path = os.path.join(DEST, f"{web_name}-{hex_label}.png")
            recolor(src_path, out_path, rgb)
            written += 1
    print(f"Wrote {written} tinted icons to {DEST}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
