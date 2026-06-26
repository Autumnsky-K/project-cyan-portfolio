import json
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

FAVORITE_ARTISTS_TIMEOUT_SECONDS = 2.0


class FavoriteArtistClient:
    def __init__(
        self,
        spring_api_url: str,
        timeout_seconds: float = FAVORITE_ARTISTS_TIMEOUT_SECONDS,
    ):
        self.base_url = spring_api_url.rstrip("/")
        self.timeout_seconds = timeout_seconds

    def fetch_favorite_artists(self, access_token: str | None) -> list[dict[str, Any]]:
        if not access_token:
            return []

        request = Request(
            f"{self.base_url}/members/me/favorite-artists",
            headers={
                "Accept": "application/json",
                "Authorization": f"Bearer {access_token}",
            },
            method="GET",
        )
        try:
            with urlopen(request, timeout=self.timeout_seconds) as response:
                payload = json.loads(response.read().decode("utf-8"))
        except (HTTPError, URLError, TimeoutError, OSError, ValueError):
            return []

        if not isinstance(payload, list):
            return []
        return [artist for artist in payload if valid_favorite_artist(artist)]


class CachedFavoriteArtistProvider:
    def __init__(
        self,
        client: FavoriteArtistClient,
        cache_ttl_seconds: int = 300,
    ):
        self.client = client
        self.cache_ttl_seconds = max(0, cache_ttl_seconds)
        self._cached_artists: list[dict[str, Any]] | None = None
        self._cache_expires_at = 0.0

    def favorite_artists(self, access_token: str | None) -> list[dict[str, Any]]:
        if not access_token:
            return []

        now = time.monotonic()
        if self._cached_artists is not None and now < self._cache_expires_at:
            return self._cached_artists

        artists = self.client.fetch_favorite_artists(access_token)
        self._cached_artists = artists
        self._cache_expires_at = now + self.cache_ttl_seconds
        return artists

    def clear(self) -> None:
        self._cached_artists = None
        self._cache_expires_at = 0.0


def favorite_artist_ids(favorite_artists: list[dict[str, Any]] | None) -> list[int]:
    if not favorite_artists:
        return []

    ids: list[int] = []
    for artist in favorite_artists:
        if not isinstance(artist, dict):
            continue
        artist_id = parse_positive_int(artist.get("artistId"))
        if artist_id is not None:
            ids.append(artist_id)
    return ids


def valid_favorite_artist(value: object) -> bool:
    if not isinstance(value, dict):
        return False
    return parse_positive_int(value.get("artistId")) is not None


def parse_positive_int(value: object) -> int | None:
    try:
        parsed_value = int(value)
    except (TypeError, ValueError):
        return None

    return parsed_value if parsed_value > 0 else None
