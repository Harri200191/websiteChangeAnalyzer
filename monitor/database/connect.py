from pymongo import MongoClient
from configs.Configurations import MONGO_URI

client = MongoClient(MONGO_URI)
db = client.get_default_database()
