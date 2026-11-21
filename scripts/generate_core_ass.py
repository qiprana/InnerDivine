#!/usr/bin/env python3
"""Generate clean, phrase-synchronized captions for the continuous Core video.

The phrase timings were originally measured on seven shorter rendered clips.
For the continuous source recording, each phrase must be rescaled back into the
source segment duration. This script performs that conversion, then adds the
three-second music-only introduction used by the final Core video.
"""

from __future__ import annotations

from pathlib import Path
import textwrap

INTRO = 3.0

CORE = [
    {
        "title": "1 · Divine Alignment",
        "start": 0.0,
        "end": 18.944,
        "clip": 17.500,
        "phrases": [
            (0.0, 2.093, "I am grateful to you"),
            (2.093, 4.290, "for the divine grace"),
            (4.290, 6.844, "and conscious awareness"),
            (6.844, 10.679, "that align my daily choices,"),
            (10.679, 12.240, "words, and actions"),
            (12.240, 13.913, "with my highest"),
            (13.913, 17.500, "spiritual purpose."),
        ],
    },
    {
        "title": "2 · An Instrument of Love",
        "start": 22.694,
        "end": 37.069,
        "clip": 15.215,
        "phrases": [
            (0.0, 2.031, "I am grateful to you"),
            (2.031, 4.563, "for making me an instrument"),
            (4.563, 7.704, "of your love and grace"),
            (7.704, 10.058, "to all the kind, caring,"),
            (10.058, 12.609, "and loving souls"),
            (12.609, 15.215, "you have surrounded me with."),
        ],
    },
    {
        "title": "3 · A Channel of Grace",
        "start": 40.580,
        "end": 55.734,
        "clip": 15.950,
        "phrases": [
            (0.0, 3.158, "I am grateful to you"),
            (3.158, 4.686, "for making me your channel"),
            (4.686, 6.826, "to stream your love"),
            (6.826, 12.887, "and blessings"),
            (12.887, 15.950, "to everyone around me."),
        ],
    },
    {
        "title": "4 · Healthy Body, Loving Mind",
        "start": 59.982,
        "end": 82.975,
        "clip": 23.815,
        "phrases": [
            (0.0, 3.824, "I am grateful to you"),
            (3.824, 7.835, "for the gift of this"),
            (7.835, 10.498, "healthy resilient body;"),
            (10.498, 12.631, "a pure loving mind"),
            (12.631, 15.268, "always aware that we are all connected;"),
            (15.268, 19.167, "and an eye that sees"),
            (19.167, 21.113, "the divinity and serenity"),
            (21.113, 23.815, "in everyone around me."),
        ],
    },
    {
        "title": "5 · Pure Thoughts, Sweet Words, Selfless Deeds",
        "start": 85.942,
        "end": 106.438,
        "clip": 19.245,
        "phrases": [
            (0.0, 1.978, "I am grateful to you"),
            (1.978, 3.955, "for shaping me such that"),
            (3.955, 8.385, "my thoughts are always pure and loving;"),
            (8.385, 10.310, "my words are always sweet,"),
            (10.310, 12.458, "polite and respectful;"),
            (12.458, 15.434, "and my deeds are always"),
            (15.434, 19.245, "selfless and noble."),
        ],
    },
    {
        "title": "6 · Love, Dignity & Respect",
        "start": 109.510,
        "end": 120.425,
        "clip": 11.690,
        "phrases": [
            (0.0, 2.229, "I am grateful to you"),
            (2.229, 4.291, "for shaping me such that"),
            (4.291, 7.172, "I respond to everyone"),
            (7.172, 8.805, "with love, dignity,"),
            (8.805, 11.690, "and respect."),
        ],
    },
    {
        "title": "7 · Radiating Love & Blessings",
        "start": 121.992,
        "end": 145.453,
        "clip": 22.910,
        "phrases": [
            (0.0, 4.603, "I am grateful to you"),
            (4.603, 10.007, "for bestowing upon me"),
            (10.007, 14.629, "the ability to radiate"),
            (14.629, 16.338, "love and blessings"),
            (16.338, 17.798, "to everyone I think about"),
            (17.798, 22.910, "and/or interact with."),
        ],
    },
]


def ass_time(seconds: float) -> str:
    seconds = max(0.0, float(seconds))
    hours = int(seconds // 3600)
    minutes = int(seconds // 60) % 60
    secs = int(seconds) % 60
    centis = int(round((seconds - int(seconds)) * 100))
    if centis >= 100:
        secs += 1
        centis = 0
    return f"{hours}:{minutes:02d}:{secs:02d}.{centis:02d}"


def safe(text: str) -> str:
    return text.replace("\\", r"\\").replace("{", r"\{").replace("}", r"\}")


def wrapped(text: str, width: int = 34) -> str:
    return r"\N".join(textwrap.wrap(text, width=width, break_long_words=False, break_on_hyphens=False))


def event(style: str, start: float, end: float, text: str, fade: int = 120) -> str:
    if end <= start:
        raise ValueError(f"Invalid caption timing: {start} to {end} for {text!r}")
    return f"Dialogue: 0,{ass_time(start)},{ass_time(end)},{style},,0,0,0,,{{\\fad({fade},{fade})}}{safe(text)}"


def source_time(item: dict, clip_relative: float) -> float:
    """Convert a daily-clip timestamp back to the original continuous source."""
    source_duration = item["end"] - item["start"]
    return item["start"] + clip_relative * (source_duration / item["clip"])


def main() -> None:
    lines = [
        "[Script Info]",
        "Title: Inner Divine Continuous Core Affirmations",
        "ScriptType: v4.00+",
        "PlayResX: 1280",
        "PlayResY: 720",
        "ScaledBorderAndShadow: yes",
        "WrapStyle: 2",
        "",
        "[V4+ Styles]",
        "Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding",
        "Style: Title,DejaVu Sans,30,&H0058445B,&H000000FF,&H22FFF9F1,&H00000000,-1,0,0,0,100,100,0,0,1,3,1,8,80,80,54,1",
        "Style: Phrase,DejaVu Sans,50,&H0058445B,&H000000FF,&H18FFF9F1,&H00000000,-1,0,0,0,100,100,0,0,1,4,1,5,115,115,82,1",
        "Style: Intro,DejaVu Sans,44,&H006A526D,&H000000FF,&H18FFF9F1,&H00000000,-1,0,0,0,100,100,0,0,1,4,1,5,120,120,82,1",
        "",
        "[Events]",
        "Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text",
        event("Intro", 0.25, INTRO - 0.15, "Daily Morning Affirmations", fade=180),
    ]

    previous_end = 0.0
    for item in CORE:
        title_start = item["start"] + INTRO
        title_end = item["end"] + INTRO
        lines.append(event("Title", title_start, title_end, item["title"]))

        for rel_start, rel_end, phrase in item["phrases"]:
            start = source_time(item, rel_start) + INTRO
            end = source_time(item, rel_end) + INTRO
            if start < previous_end - 0.04:
                raise ValueError(f"Overlapping captions near {phrase!r}: {start} < {previous_end}")
            lines.append(event("Phrase", start, end, wrapped(phrase)))
            previous_end = end

    final_voice_end = CORE[-1]["end"] + INTRO
    lines.append(event("Intro", final_voice_end + 0.35, final_voice_end + 3.0, "With love and gratitude", fade=180))

    destination = Path("/tmp/core_continuous.ass")
    destination.write_text("\n".join(lines) + "\n", encoding="utf-8")
    print(f"Wrote corrected captions: {destination}")

    # Log the converted cue boundaries so the workflow provides auditable timing evidence.
    for item in CORE:
        first = source_time(item, item["phrases"][0][0]) + INTRO
        last = source_time(item, item["phrases"][-1][1]) + INTRO
        print(f"{item['title']}: {first:.3f}s to {last:.3f}s")


if __name__ == "__main__":
    main()
