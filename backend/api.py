import requests
import json
from pathlib import Path

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows your Next.js frontend to connect
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VOLTHRESHOLD = 10000
url = "https://prices.runescape.wiki/api/v2/osrs/latest"
HEADERS = {"User-Agent": "osrs-ge-price-tracker"}
MAPPING_FILE = Path("mapping.json")

def wiki_call():
    try:
        response = requests.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json()["data"]
    except requests.exceptions.RequestException as err:
        print(f"An error occurred: {err}")
        return {}

def get_mapping():
    if MAPPING_FILE.exists():
        with open(MAPPING_FILE, "r", encoding="utf-8") as f:
            return json.load(f)

    mapping_url = "https://prices.runescape.wiki/api/v2/osrs/mapping"
    response = requests.get(mapping_url, headers=HEADERS)
    response.raise_for_status()
    data = response.json()

    with open(MAPPING_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
    return data

def check_margins(price_data, item_lookup, potential_items):
    for item_id, price_info in price_data.items():
        low_price = price_info.get("low") or 0
        high_price = price_info.get("high") or 0
        if high_price > 0 and low_price >= 1000 and (high_price - low_price) / low_price >= 0.05:
            item_name = item_lookup.get(int(item_id), "Unknown Item")
            item_margin = high_price - low_price
            potential_items[item_id] = [item_name, item_margin, low_price]
       
def get_volume(potential_items, results, item_lookup):
    vol_url = "https://prices.runescape.wiki/api/v2/osrs/24h"
    response = requests.get(vol_url, headers=HEADERS)
    response.raise_for_status()
    data = response.json()["data"]
    
    n = 0
    for item_id in data:
        item_info = data[item_id]
        high_volume = item_info.get("highPriceVolume", 0)
        low_volume = item_info.get("lowPriceVolume", 0)
        total_item_volume = high_volume + low_volume

        if item_id in potential_items:
            if total_item_volume > VOLTHRESHOLD:
                n += 1
                name = item_lookup.get(int(item_id), "Unknown Item")
                margin = potential_items[item_id][1]
                buy_price = potential_items[item_id][2]
                
                results.append({
                    "name": name,
                    "margin": margin,
                    "volume": total_item_volume,
                    "roi": (margin / buy_price) * 100,
                    "ev": total_item_volume * margin
                })

@app.get("/api/flips/roi")
def get_flips(
    sort_by: str = Query("roi", description="Field to sort by: roi, margin, volume, or ev"),
    min_margin: int = Query(0, description="Minimum margin in gp"),
    min_volume: int = Query(10000, description="Minimum daily volume floor"),
    min_roi: float = Query(5.0, description="Minimum ROI percentage")
):
    # 1. Fetch raw mapping data and convert to item lookup dictionary
    mapping_data = get_mapping()
    item_lookup = {item["id"]: item["name"] for item in mapping_data}

    # 2. Fetch latest prices and evaluate margins
    price_data = wiki_call()
    potential_items = {}
    check_margins(price_data, item_lookup, potential_items)

    # 3. Fetch 24h volumes and build final raw results list
    results = []
    get_volume(potential_items, results, item_lookup)

    # 4. Apply filtering logic based on query parameters
    filtered_items = [
        item for item in results 
        if item["margin"] >= min_margin 
        and item["volume"] >= min_volume 
        and item["roi"] >= min_roi
    ]

    # 5. Sort dynamically based on the sort_by parameter
    reverse_sort = True
    if sort_by == "margin":
        filtered_items.sort(key=lambda x: x["margin"], reverse=reverse_sort)
    elif sort_by == "volume":
        filtered_items.sort(key=lambda x: x["volume"], reverse=reverse_sort)
    elif sort_by == "ev":
        filtered_items.sort(key=lambda x: x["ev"], reverse=reverse_sort)
    else:  # Default to roi
        filtered_items.sort(key=lambda x: x["roi"], reverse=reverse_sort)

    return filtered_items