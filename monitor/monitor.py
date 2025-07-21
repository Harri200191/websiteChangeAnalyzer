import requests
import hashlib
import smtplib
import os
from bs4 import BeautifulSoup
from email.message import EmailMessage
from dotenv import load_dotenv

load_dotenv()

URL = os.getenv("URL_TO_USE")
if not URL:
    print("URL_TO_USE is not set in the environment variables.")
    exit(1)

HASH_FILE = "last_hash.txt"
RECIPIENTS = os.getenv("RECIPIENTS")
if RECIPIENTS:
    RECIPIENTS = [email.strip() for email in RECIPIENTS.split(",")]
else:
    print("RECIPIENTS is not set in the environment variables.")
    exit(1)

SENDER_EMAIL = os.environ["SENDER_EMAIL"]
SENDER_PASSWORD = os.environ["SENDER_PASSWORD"]

def fetch_page():
    headers = {"User-Agent": "Mozilla/5.0"}
    res = requests.get(URL, headers=headers, timeout=10)
    res.raise_for_status()
    return res.text

def get_hash(content):
    soup = BeautifulSoup(content, "html.parser")
    text = soup.get_text(strip=True)
    return hashlib.sha256(text.encode("utf-8")).hexdigest()

def load_last_hash():
    return open(HASH_FILE).read() if os.path.exists(HASH_FILE) else ""

def save_hash(new_hash):
    with open(HASH_FILE, "w") as f:
        f.write(new_hash)

def send_email():
    msg = EmailMessage()
    msg["Subject"] = "🎬 Page Updated!"
    msg["From"] = SENDER_EMAIL
    msg["To"] = ", ".join(RECIPIENTS)
    msg.set_content(f"The page has changed: {URL}")
    
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
        smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
        smtp.send_message(msg)

def main():
    html = fetch_page()
    new_hash = get_hash(html)
    old_hash = load_last_hash()

    if new_hash != old_hash:
        print("Change detected! Sending alert.")
        send_email()
        save_hash(new_hash)
    else:
        print("No change.")

if __name__ == "__main__":
    main()
