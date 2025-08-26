import os
import json
import hashlib
from typing import Any, Optional
from redis import Redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:63790/0")
SEARCH_CACHE_TTL = int(os.getenv("SEARCH_CACHE_TTL", "300"))  # seconds

redis_client = Redis.from_url(REDIS_URL, decode_responses=True)


def _stable_json(obj: Any) -> str:
    return json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def make_search_cache_key(payload: Any) -> str:
    try:
        if hasattr(payload, "model_dump"):
            data = payload.model_dump(exclude_none=True)
        else:
            data = payload
        raw = _stable_json(data)
    except Exception:
        raw = str(payload)
    digest = hashlib.sha1(raw.encode("utf-8")).hexdigest()
    return f"search:{digest}"


def cache_get(key: str) -> Optional[str]:
    return redis_client.get(key)


def cache_set(key: str, value: str, ttl: Optional[int] = None) -> None:
    redis_client.set(key, value, ex=ttl or SEARCH_CACHE_TTL)
