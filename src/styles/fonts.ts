import { Noto_Sans, Noto_Sans_Georgian } from "next/font/google";

// Noto Sans covers Latin + Cyrillic (uk/en) but has no Georgian glyphs.
// Noto Sans Georgian fills that gap; browsers fall back to it per-glyph
// when a character is missing from the first font in the stack.
export const notoSans = Noto_Sans({
  subsets: ["latin", "cyrillic"],
  variable: "--font-noto-sans",
  display: "swap",
});

export const notoSansGeorgian = Noto_Sans_Georgian({
  subsets: ["georgian"],
  variable: "--font-noto-sans-georgian",
  display: "swap",
});
