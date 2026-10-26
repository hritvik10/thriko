"""Target countries and currencies, loaded from /shared/markets.json (also used by the frontend)."""

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Dict

MARKETS_FILE = Path(__file__).resolve().parents[2] / "shared" / "markets.json"
OTHER_MARKET = "OTHER"


@dataclass(frozen=True)
class Market:
    code: str
    name: str
    currency: str


@lru_cache
def get_markets(path: Path = MARKETS_FILE) -> Dict[str, Market]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    markets: Dict[str, Market] = {}
    for item in raw["markets"]:
        market = Market(
            code=item["code"],
            name=item["name"],
            currency=item["currency"],
        )
        # Fail fast at startup if the shared file is inconsistent.
        if len(market.currency) != 3:
            raise ValueError(f"{path}: invalid settings for market {market.code}")
        markets[market.code] = market
    if OTHER_MARKET not in markets:
        raise ValueError(f"{path}: an '{OTHER_MARKET}' market is required")
    return markets
