import requests
from bs4 import BeautifulSoup

url = "https://acrop.app/prices/orange/maharashtra/nagpur"

print(f"Fetching: {url}")
response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'})
print(f"Status: {response.status_code}")
print(f"Content length: {len(response.text)}")

soup = BeautifulSoup(response.text, 'html.parser')
tables = soup.find_all('table')
print(f"Found {len(tables)} tables")

for i, table in enumerate(tables):
    print(f"\nTable {i}:")
    rows = table.find_all('tr')
    print(f"  Rows: {len(rows)}")
    if rows:
        print(f"  First row: {rows[0].get_text(strip=True)[:100]}")
