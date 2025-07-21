from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bson import ObjectId

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client.get_default_database()

projects_collection = db.projects
 
for project in projects_collection.find():
    print(project)
    print("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%")

print("###########################################################")
project = projects_collection.find_one({"_id": ObjectId("687e179d4f15bf49580d62fe")})

print(project)