from __future__ import annotations

import hashlib
import threading
import time
from typing import Any


class TTLCache:
    def __init__(self, default_ttl_seconds: int = 600, max_entries: int = 512) -> None:
        self._default_ttl = default_ttl_seconds
        self._max = max_entries
        self._data: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()

    def _evict_expired(self) -> None:
        now = time.time()
        expired = [k for k, (exp, _) in self._data.items() if exp <= now]
        for k in expired:
            self._data.pop(k, None)
        if len(self._data) > self._max:
            for k in list(self._data.keys())[: len(self._data) - self._max]:
                self._data.pop(k, None)

    def get(self, key: str) -> Any | None:
        with self._lock:
            self._evict_expired()
            item = self._data.get(key)
            if not item:
                return None
            exp, val = item
            if exp <= time.time():
                self._data.pop(key, None)
                return None
            return val

    def set(self, key: str, value: Any, ttl_seconds: int | None = None) -> None:
        ttl = ttl_seconds if ttl_seconds is not None else self._default_ttl
        with self._lock:
            self._evict_expired()
            self._data[key] = (time.time() + ttl, value)
            if len(self._data) > self._max:
                oldest = next(iter(self._data))
                self._data.pop(oldest, None)


def stable_hash(parts: list[str]) -> str:
    joined = "|".join(parts)
    return hashlib.sha256(joined.encode("utf-8")).hexdigest()


ai_response_cache = TTLCache(default_ttl_seconds=900, max_entries=256)
