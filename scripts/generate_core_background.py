#!/usr/bin/env python3
"""Create a clean, text-free InnerDivine background for the continuous Core video."""

from __future__ import annotations

import argparse
import math
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

WIDTH = 1280
HEIGHT = 720


def lerp(a: int, b: int, t: float) -> int:
    return round(a + (b - a) * t)


def make_leaf(size: tuple[int, int], fill: tuple[int, int, int, int], angle: float) -> Image.Image:
    w, h = size
    leaf = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(leaf)
    draw.ellipse((1, 1, w - 2, h - 2), fill=fill)
    draw.line((w * 0.12, h * 0.5, w * 0.88, h * 0.5), fill=(181, 151, 99, min(85, fill[3] + 20)), width=1)
    return leaf.rotate(angle, expand=True, resample=Image.Resampling.BICUBIC)


def paste_center(base: Image.Image, item: Image.Image, center: tuple[int, int]) -> None:
    x = round(center[0] - item.width / 2)
    y = round(center[1] - item.height / 2)
    base.alpha_composite(item, (x, y))


def draw_branch(layer: Image.Image, points: list[tuple[int, int]], mirrored: bool = False) -> None:
    draw = ImageDraw.Draw(layer)
    stem = (172, 142, 92, 55)
    draw.line(points, fill=stem, width=3, joint="curve")

    for i in range(1, len(points) - 1):
        if i % 2 == 0:
            continue
        x, y = points[i]
        prev_x, prev_y = points[i - 1]
        next_x, next_y = points[i + 1]
        angle = math.degrees(math.atan2(next_y - prev_y, next_x - prev_x))
        side = -1 if (i // 2) % 2 == 0 else 1
        if mirrored:
            side *= -1
        leaf_angle = angle + side * 48
        offset = 17 * side
        center = (x - math.sin(math.radians(angle)) * offset, y + math.cos(math.radians(angle)) * offset)
        leaf = make_leaf((42, 18), (147, 164, 128, 36), leaf_angle)
        paste_center(layer, leaf, (round(center[0]), round(center[1])))

        if i % 4 == 1:
            blossom_draw = ImageDraw.Draw(layer)
            bx = round(x + math.cos(math.radians(angle)) * 7)
            by = round(y + math.sin(math.radians(angle)) * 7)
            for dx, dy in ((0, -5), (5, 0), (0, 5), (-5, 0)):
                blossom_draw.ellipse((bx + dx - 3, by + dy - 3, bx + dx + 3, by + dy + 3), fill=(244, 223, 207, 48))
            blossom_draw.ellipse((bx - 2, by - 2, bx + 2, by + 2), fill=(190, 153, 94, 55))


def build_background() -> Image.Image:
    img = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    px = img.load()
    top = (253, 249, 242)
    bottom = (247, 239, 227)
    for y in range(HEIGHT):
        t = y / (HEIGHT - 1)
        eased = t * t * (3 - 2 * t)
        row = tuple(lerp(top[i], bottom[i], eased) for i in range(3)) + (255,)
        for x in range(WIDTH):
            px[x, y] = row

    # Gentle central light, deliberately text-free.
    glow = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((210, 65, 1070, 675), fill=(255, 253, 248, 135))
    glow = glow.filter(ImageFilter.GaussianBlur(95))
    img = Image.alpha_composite(img, glow)

    botanical = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    left_top = [(-35, 88), (16, 112), (62, 151), (102, 195), (140, 246), (174, 302)]
    right_bottom = [(WIDTH + 28, HEIGHT - 70), (WIDTH - 22, HEIGHT - 98), (WIDTH - 70, HEIGHT - 135), (WIDTH - 112, HEIGHT - 183), (WIDTH - 145, HEIGHT - 238)]
    left_bottom = [(-24, HEIGHT - 55), (26, HEIGHT - 86), (65, HEIGHT - 126), (93, HEIGHT - 174)]
    right_top = [(WIDTH + 20, 75), (WIDTH - 26, 105), (WIDTH - 65, 147), (WIDTH - 95, 191)]
    draw_branch(botanical, left_top)
    draw_branch(botanical, right_bottom, mirrored=True)
    draw_branch(botanical, left_bottom, mirrored=True)
    draw_branch(botanical, right_top)
    botanical = botanical.filter(ImageFilter.GaussianBlur(0.35))
    img = Image.alpha_composite(img, botanical)

    border = ImageDraw.Draw(img)
    border.rectangle((28, 28, WIDTH - 29, HEIGHT - 29), outline=(188, 151, 91, 105), width=2)
    border.rectangle((34, 34, WIDTH - 35, HEIGHT - 35), outline=(231, 213, 184, 95), width=1)

    # A subtle quiet center field for captions, with no baked-in wording.
    panel = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
    pdraw = ImageDraw.Draw(panel)
    pdraw.rounded_rectangle((215, 150, 1065, 590), radius=42, fill=(255, 252, 247, 48), outline=(216, 193, 155, 34), width=1)
    panel = panel.filter(ImageFilter.GaussianBlur(0.6))
    img = Image.alpha_composite(img, panel)
    return img.convert("RGB")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="/tmp/core_clean_background.png")
    args = parser.parse_args()
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    build_background().save(output, quality=95)
    print(f"Wrote clean text-free background: {output}")


if __name__ == "__main__":
    main()
