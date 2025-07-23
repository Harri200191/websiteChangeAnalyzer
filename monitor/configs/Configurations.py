import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
SENDER_EMAIL = os.getenv("SENDER_EMAIL")
SENDER_PASSWORD = os.getenv("SENDER_PASSWORD")
CHECK_INTERVAL = int(os.getenv("CHECK_INTERVAL_SECONDS", 1800)) 
FRONTEND_TAG = os.getenv("FRONTEND_TAG")