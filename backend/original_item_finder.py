import requests
import json
from pathlib import Path




VOLTHRESHOLD = 10000

url = "https://prices.runescape.wiki/api/v2/osrs/latest"
HEADERS = {"User-Agent": "osrs-ge-price-tracker"}
MAPPING_FILE = Path("mapping.json")
potential_items = {}
results = []

def wiki_call():
    #Default item Prices call
  try:
      response = requests.get(url,headers=HEADERS)
      response.raise_for_status()
      return response.json()["data"]
  except requests.exceptions.RequestException as err:
      print(f"An error occurred: {err}")
      return {}


def get_mapping():
  """Loads mapping from disk or fetches it if it doesn't exist."""
  if MAPPING_FILE.exists():
    with open(MAPPING_FILE, "r", encoding="utf-8") as f:
      return json.load(f)

  # Fetch mapping from API if local file is missing
  url = "https://prices.runescape.wiki/api/v2/osrs/mapping"
  response = requests.get(url, headers=HEADERS)
  response.raise_for_status()
  data = response.json()

  with open(MAPPING_FILE, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)
  return data

def check_margins(price_data):
   for item_id, price_info in price_data.items():
    low_price = price_info.get("low") or 0
    high_price = price_info.get("high") or 0
    if high_price > 0 and low_price >= 1000 and (high_price - low_price)/low_price >= .05:
       item_name = item_lookup.get(int(item_id),"Unknown Item")
       item_margin = high_price-low_price
       #print(f"Match Found! Id: {item_id} | Name: {item_name} | Margin: {item_margin} gp")
       potential_items[item_id] = [item_name,item_margin,low_price]
       
def get_volume():
  url = "https://prices.runescape.wiki/api/v2/osrs/24h"
  response = requests.get(url, headers=HEADERS)
  response.raise_for_status()
  data = response.json()["data"]
  n=0
  for item_id in data:
    item_info = data[item_id]
    high_volume = item_info.get("highPriceVolume",0)
    low_volume = item_info.get("lowPriceVolume",0)
    total_item_volume = high_volume+low_volume

    
    if item_id in potential_items:
      if total_item_volume > VOLTHRESHOLD:
        n+=1
        name = item_lookup.get(int(item_id),"Unknown Item")
        margin = potential_items[item_id][1]
        buy_price = potential_items[item_id][2]
        #print(name+" "+str(total_item_volume)+" Good Item Number: "+str(n))
        results.append({
          "name": name,
          "margin": margin,
          "volume": total_item_volume,
          "roi": (margin / buy_price) * 100,
          "ev": total_item_volume*margin
        })
  

  
  return 
       
   

if __name__ == "__main__":
  items = get_mapping()
  item_lookup = {item["id"]: item["name"] for item in items}
  prices = wiki_call()
  check_margins(prices)
  get_volume()
  # 1. Sort by Highest Margin
  sorted_by_margin = sorted(results, key=lambda x: x["margin"], reverse=True)

  # 2. Sort by Highest Volume
  sorted_by_volume = sorted(results, key=lambda x: x["volume"], reverse=True)

  # 3. Sort by Highest ROI
  sorted_by_roi = sorted(results, key=lambda x: x["roi"], reverse=True)

  for i in range(0,10):
    item = sorted_by_roi[i]
    print()
    print(f"{i + 1}. {item['name']} | Margin: {item['margin']:,} gp | Volume: {item['volume']:,} | EV: {item['ev']:,}")