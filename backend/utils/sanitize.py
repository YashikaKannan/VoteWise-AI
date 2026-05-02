from __future__ import annotations

import html
import re

_TAG_RE = re.compile(r"<[^>]+>")


def sanitize_text(text: str, max_length: int = 8000) -> str:
    if not text:
        return ""
    cleaned = _TAG_RE.sub(" ", text)
    cleaned = html.unescape(cleaned)
    cleaned = " ".join(cleaned.split())
    return cleaned[:max_length]
