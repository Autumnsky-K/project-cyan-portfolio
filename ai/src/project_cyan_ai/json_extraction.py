import json


def strip_code_fence(raw_text: str) -> str:
    candidate = raw_text.strip()
    if candidate.startswith("```"):
        first_newline = candidate.find("\n")
        last_fence = candidate.rfind("```")
        if first_newline >= 0 and last_fence > first_newline:
            candidate = candidate[first_newline + 1:last_fence].strip()
    return candidate


def decode_json_object(candidate: str) -> dict | None:
    try:
        payload = json.loads(candidate)
        return payload if isinstance(payload, dict) else None
    except (json.JSONDecodeError, TypeError):
        pass

    decoder = json.JSONDecoder()
    for index, character in enumerate(candidate):
        if character != "{":
            continue
        try:
            payload, _ = decoder.raw_decode(candidate[index:])
        except json.JSONDecodeError:
            continue
        if isinstance(payload, dict):
            return payload
    return None


def bounded_text(value: object, max_length: int) -> str | None:
    if not isinstance(value, str) or not value.strip():
        return None
    return value.strip()[:max_length]
