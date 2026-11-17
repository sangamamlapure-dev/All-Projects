
import os
import json
import re
from dataclasses import dataclass
from urllib.parse import urlsplit, urlunsplit, parse_qsl, urlencode

import httpx
from dotenv import load_dotenv

load_dotenv()

TAVILY_SEARCH_URL = "https://api.tavily.com/search"
SEARCH_TIMEOUT_SECONDS = 25.0
MAX_RESULTS = 8
MAX_SNIPPET_CHARS = 1800


@dataclass(frozen=True)
class RetrievedSource:
    title: str
    url: str
    snippet: str | None = None
    published_date: str | None = None


class SourceRetrievalError(Exception):
    def __init__(self, error_code: str, user_message: str):
        super().__init__(user_message)
        self.error_code = error_code
        self.user_message = user_message


def _valid_http_url(value: object) -> str | None:
    if not isinstance(value, str) or len(value) > 2048:
        return None

    try:
        parts = urlsplit(value.strip())
        hostname = parts.hostname
        parts.port
    except ValueError:
        return None

    if (
        parts.scheme not in {"http", "https"}
        or not hostname
        or parts.username
        or parts.password
    ):
        return None

    # Remove tracking parameters to identify duplicate article URLs.
    tracking_prefixes = ("utm_",)
    tracking_names = {
        "fbclid", "gclid", "ref", "source"
    }

    clean_query = [
        (key, val)
        for key, val in parse_qsl(parts.query, keep_blank_values=True)
        if key.lower() not in tracking_names
        and not key.lower().startswith(tracking_prefixes)
    ]

    return urlunsplit((
        parts.scheme.lower(),
        parts.netloc.lower(),
        parts.path.rstrip("/"),
        urlencode(clean_query),
        "",
    ))


def _normalize_text(value: str) -> str:
    value = value.lower()
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return " ".join(value.split())


class TavilySearchRetriever:
    """Retrieve and filter relevant source snippets from Tavily."""

    def retrieve(
        self,
        question: str,
        description: str | None = None
    ) -> list[RetrievedSource]:

        api_key = os.getenv("TAVILY_API_KEY", "").strip()

        if not api_key or api_key == "your_tavily_api_key_here":
            raise SourceRetrievalError(
                "retrieval_not_configured",
                "Source search is not configured. Add TAVILY_API_KEY to backend/.env and restart the backend.",
            )

        query = question.strip()

        if description and description.strip():
            query = f"{query}. Focus: {description.strip()}"

        body = {
            "query": query,
            "topic": "general",
            "search_depth": "advanced",
            "max_results": MAX_RESULTS,
            "include_answer": False,
            "include_raw_content": False,
            "include_published_date": True,
        }

        try:
            with httpx.Client(timeout=SEARCH_TIMEOUT_SECONDS) as client:
                response = client.post(
                    TAVILY_SEARCH_URL,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json=body,
                )

            if response.status_code in {401, 403}:
                raise SourceRetrievalError(
                    "retrieval_authentication_error",
                    "The search provider rejected its API key. Check TAVILY_API_KEY.",
                )

            if response.status_code == 429:
                raise SourceRetrievalError(
                    "retrieval_rate_limited",
                    "The search provider is rate-limiting requests. Please try again later.",
                )

            if response.status_code >= 500:
                raise SourceRetrievalError(
                    "retrieval_provider_error",
                    "The search provider is temporarily unavailable. Please try again later.",
                )

            response.raise_for_status()

        except SourceRetrievalError:
            raise
        except httpx.TimeoutException as exc:
            raise SourceRetrievalError(
                "retrieval_timeout",
                "Source search timed out. Please try again later.",
            ) from exc
        except httpx.HTTPStatusError as exc:
            raise SourceRetrievalError(
                "retrieval_provider_error",
                "The search provider rejected the request. Check its settings and try again.",
            ) from exc
        except httpx.RequestError as exc:
            raise SourceRetrievalError(
                "retrieval_connection_error",
                "The search provider could not be reached. Please try again later.",
            ) from exc

        try:
            payload = response.json()
        except (ValueError, json.JSONDecodeError) as exc:
            raise SourceRetrievalError(
                "retrieval_invalid_response",
                "The search provider returned an invalid response. Please try again.",
            ) from exc

        raw_results = payload.get("results") if isinstance(payload, dict) else None

        if not isinstance(raw_results, list):
            raise SourceRetrievalError(
                "retrieval_invalid_response",
                "The search provider returned an invalid response. Please try again.",
            )

        sources: list[RetrievedSource] = []
        seen_urls: set[str] = set()
        seen_titles: set[str] = set()

        for item in raw_results:
            if not isinstance(item, dict):
                continue

            title = item.get("title")
            url = _valid_http_url(item.get("url"))

            if not isinstance(title, str) or not title.strip() or not url:
                continue

            clean_title = title.strip()[:500]
            normalized_title = _normalize_text(clean_title)
            duplicate_key = url.lower()

            if duplicate_key in seen_urls:
                continue

            if normalized_title and normalized_title in seen_titles:
                continue

            seen_urls.add(duplicate_key)

            if normalized_title:
                seen_titles.add(normalized_title)

            snippet_value = item.get("content")

            snippet = (
                snippet_value.strip()[:MAX_SNIPPET_CHARS]
                if isinstance(snippet_value, str)
                and snippet_value.strip()
                else None
            )

            published = item.get("published_date")

            if not isinstance(published, str) or not published.strip():
                published = None
            else:
                published = published.strip()[:100]

            sources.append(
                RetrievedSource(
                    title=clean_title,
                    url=url,
                    snippet=snippet,
                    published_date=published,
                )
            )

            if len(sources) >= MAX_RESULTS:
                break

        if not sources:
            raise SourceRetrievalError(
                "retrieval_no_results",
                "No usable sources were returned for this question. Try a more specific query.",
            )

        return sources
