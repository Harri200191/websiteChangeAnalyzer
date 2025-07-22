import requests
import hashlib
import smtplib
import time
from bs4 import BeautifulSoup
from email.message import EmailMessage
from configs.Configurations import SENDER_EMAIL, SENDER_PASSWORD
from database.schema import projects_collection
from utilities.logger import logger

class Utils:
    @staticmethod
    def fetch_page(url):
        headers = {"User-Agent": "Mozilla/5.0"}
        try:
            res = requests.get(url, headers=headers, timeout=10)
            res.raise_for_status()
            return res.text
        except requests.RequestException as e:
            logger.error(f"Error fetching {url}: {e}")
            return None

    @staticmethod
    def get_hash(content):
        soup = BeautifulSoup(content, "html.parser")
        text = soup.get_text(strip=True)
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    @staticmethod
    def send_email(recipients, url, started=False):
        if not SENDER_EMAIL or not SENDER_PASSWORD:
            logger.info("Sender email or password not configured. Skipping email.")
            return
        if not recipients:
            logger.info(f"No recipients for {url}. Skipping email.")
            return

        msg = EmailMessage()
        if started:
            msg["Subject"] = "🔎 Monitoring Started!"
            msg.set_content(f"Monitoring has started for: {url}")
        else:
            msg["Subject"] = "🎬 Page Updated!"
            msg.set_content(f"The page has changed: {url}")
        msg["From"] = SENDER_EMAIL
        msg["To"] = ", ".join(recipients)
        
        try:
            with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
                smtp.login(SENDER_EMAIL, SENDER_PASSWORD)
                smtp.send_message(msg)
                logger.success(f"Email sent to {', '.join(recipients)} for {url}")
        except Exception as e:
            logger.error(f"Failed to send email: {e}")

    @classmethod
    def monitor_projects(cls, single_project=None):
        if single_project is not None:
            projects = [single_project]
        else:
            logger.info("Starting monitoring cycle for all projects...")
            projects = projects_collection.find()

        for project in projects:
            url = project.get("url")
            if not url:
                continue
            
            logger.info(f"Checking {url}...")
            html = cls.fetch_page(url)
            if not html:
                continue

            new_hash = cls.get_hash(html)
            old_hash = project.get("lastHash")

            if new_hash != old_hash:
                logger.success(f"Change detected for {url}!")
                recipients = project.get("emails", [])
                cls.send_email(recipients, url, started=False)
                projects_collection.update_one(
                    {"_id": project["_id"]},
                    {"$set": {"lastHash": new_hash, "lastChecked": time.time()}}
                )
            else:
                logger.info(f"No change for {url}.")
