"""Collect PRIMARY-SOURCE market data with timestamps. Run where the network allows it.

Writes research/data/<UTC date>.json. The research doc may only cite numbers found there.
Sources (public endpoints; verify they are still current before relying on them):
  CoinGecko /simple/price, /global (dominance)   DefiLlama /protocols, /stablecoins (TVL, fees via /overview/fees)
  Exchange public REST: funding + open interest (e.g. Binance/Bybit futures public endpoints)
"""
import json, sys, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

SOURCES = {
    "coingecko_global": "https://api.coingecko.com/api/v3/global",
    "coingecko_btc_eth": "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true",
    "defillama_stablecoins": "https://stablecoins.llama.fi/stablecoins",
    "defillama_fees": "https://api.llama.fi/overview/fees",
    "defillama_protocols": "https://api.llama.fi/protocols",
}

def main():
    out = {"fetched_utc": datetime.now(timezone.utc).isoformat(), "sources": {}}
    for name, url in SOURCES.items():
        try:
            with urllib.request.urlopen(url, timeout=20) as r:
                out["sources"][name] = {"url": url, "ok": True, "data": json.loads(r.read())}
        except Exception as e:  # record failures; never fill gaps with guesses
            out["sources"][name] = {"url": url, "ok": False, "error": repr(e)}
        time.sleep(1.5)
    d = Path(__file__).parent / "data"; d.mkdir(exist_ok=True)
    p = d / f"{datetime.now(timezone.utc):%Y-%m-%d}.json"
    p.write_text(json.dumps(out)); print("wrote", p)

if __name__ == "__main__":
    sys.exit(main())
