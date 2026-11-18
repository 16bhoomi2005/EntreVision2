import sys
sys.path.insert(0, r'c:\Users\Bhoomi Vaishya\EntreVision2\backend')
from app.data_collection.parser import print_summary, parse_requirements

datasets = parse_requirements()
print_summary(datasets)
