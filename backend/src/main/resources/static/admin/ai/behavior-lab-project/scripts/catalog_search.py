from __future__ import annotations

import argparse
import csv
import json
import re
import sys
from collections import Counter
from pathlib import Path
from typing import Any


MARKED_KEYWORD_RE = re.compile(r"《([^》]+)》")
WORD_RE = re.compile(r"[\w가-힣]+", re.UNICODE)


def normalize(value: Any) -> str:
    return re.sub(r"[^\w가-힣]+", " ", str(value or "").lower()).strip()


def extract_keywords(text: str) -> list[str]:
    marked = [match.group(1).strip() for match in MARKED_KEYWORD_RE.finditer(text) if match.group(1).strip()]
    if marked:
        return marked[:5]
    return [match.group(0) for match in WORD_RE.finditer(text) if len(match.group(0)) > 1][:5]


def column_weight(column: str) -> float:
    key = column.lower()
    if "artist" in key:
        return 4.0
    if "goods" in key or "name" in key:
        return 3.0
    if "category" in key or "alias" in key:
        return 2.4
    if "group" in key or "tag" in key:
        return 1.8
    if "description" in key or "hint" in key:
        return 1.0
    return 0.7


def compact(value: Any, limit: int = 140) -> str:
    text = str(value or "").replace("\t", " ")
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def row_value(row: dict[str, Any], key: str) -> Any:
    return row.get(key) if row.get(key) not in (None, "") else None


def read_rows(path: Path) -> list[dict[str, Any]]:
    if path.suffix.lower() == ".json":
        payload = json.loads(path.read_text(encoding="utf-8-sig"))
        if isinstance(payload, list):
            return [dict(row) for row in payload]
        if isinstance(payload, dict):
            rows = payload.get("goods") or payload.get("rows") or []
            return [dict(row) for row in rows]
        return []

    with path.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file, delimiter="\t")
        rows: list[dict[str, Any]] = []
        for row_index, row in enumerate(reader, start=2):
            normalized_row: dict[str, Any] = {key: value for key, value in row.items()}
            normalized_row["_rowIndex"] = row_index
            rows.append(normalized_row)
        return rows


def build_facets(rows: list[dict[str, Any]]) -> dict[str, dict[str, int]]:
    facet_keys = [
        "groupName",
        "group_name",
        "artistName",
        "artist_name",
        "categoryName",
        "category_name",
        "availability",
    ]
    facets: dict[str, dict[str, int]] = {}
    for key in facet_keys:
        counts: Counter[str] = Counter()
        for row in rows:
            value = row_value(row, key)
            if value:
                counts[str(value)] += 1
        if counts:
            facets[key] = dict(counts.most_common())
    return facets


def search_rows(rows: list[dict[str, Any]], query: str, limit: int) -> dict[str, Any]:
    keywords = extract_keywords(query)
    scored: list[dict[str, Any]] = []

    for index, row in enumerate(rows, start=1):
        row_index = int(row.get("_rowIndex") or row.get("rowIndex") or row.get("order") or index)
        matched_cells: list[dict[str, Any]] = []
        matched_keywords: set[str] = set()
        score = 0.0

        for keyword in keywords:
            normalized_keyword = normalize(keyword)
            if not normalized_keyword:
                continue
            for column, value in row.items():
                if str(column).startswith("_"):
                    continue
                cell_text = " ".join(str(part) for part in value) if isinstance(value, list) else str(value or "")
                if normalized_keyword not in normalize(cell_text):
                    continue
                weight = column_weight(str(column))
                score += weight
                matched_keywords.add(keyword)
                matched_cells.append(
                    {
                        "x": column,
                        "y": row_index,
                        "keyword": keyword,
                        "value": compact(cell_text),
                        "weight": weight,
                    }
                )

        if score > 0 or not keywords:
            scored.append(
                {
                    "rowIndex": row_index,
                    "score": round(score, 2),
                    "matchedKeywordCount": len(matched_keywords),
                    "matchedCells": matched_cells,
                    "row": row,
                }
            )

    if len(keywords) > 1:
        full_matches = [item for item in scored if item["matchedKeywordCount"] == len(keywords)]
        if full_matches:
            scored = full_matches

    scored.sort(key=lambda item: (-float(item["score"]), int(item["rowIndex"])))
    top_rows = scored[:limit]
    coordinate_context: list[dict[str, Any]] = []
    for item in top_rows:
        row = item["row"]
        columns = {key: value for key, value in row.items() if not str(key).startswith("_")}
        coordinate_context.append(
            {
                "axis": "row",
                "rowIndex": item["rowIndex"],
                "matchedCells": item["matchedCells"],
                "row": row,
            }
        )
        coordinate_context.append(
            {
                "axis": "columns",
                "rowIndex": item["rowIndex"],
                "matchedCells": item["matchedCells"],
                "columns": columns,
            }
        )

    return {
        "query": query,
        "keywords": keywords,
        "matchedRowCount": len(scored),
        "matchedCellCount": sum(len(item["matchedCells"]) for item in scored),
        "broad": len(scored) > limit,
        "facets": build_facets([item["row"] for item in scored]),
        "results": top_rows,
        "crosshairJsonl": "\n".join(json.dumps(item, ensure_ascii=False) for item in coordinate_context),
    }


def parse_args(argv: list[str]) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Search TSV/JSON catalog rows and return row/cell crosshair context.")
    parser.add_argument("input", type=Path)
    parser.add_argument("--query", required=True)
    parser.add_argument("--limit", type=int, default=8)
    parser.add_argument("--jsonl-out", type=Path)
    return parser.parse_args(argv)


def main(argv: list[str]) -> int:
    args = parse_args(argv)
    rows = read_rows(args.input)
    result = search_rows(rows, args.query, max(1, args.limit))
    if args.jsonl_out:
        args.jsonl_out.parent.mkdir(parents=True, exist_ok=True)
        args.jsonl_out.write_text(result["crosshairJsonl"] + "\n", encoding="utf-8", newline="\n")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
