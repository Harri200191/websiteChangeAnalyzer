import time
import threading
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uvicorn
from bson import ObjectId

from configs.Configurations import FRONTEND_TAG, CHECK_INTERVAL
from utilities.utils import Utils
from database.schema import projects_collection
from utilities.logger import logger

app = FastAPI()

render_host = FRONTEND_TAG 

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://0.0.0.0:4173",
        "http://0.0.0.0:5000",
        "http://0.0.0.0:5173",
        "http://127.0.0.1:5173",
        render_host
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

MAX_THREADS = 10
monitor_threads = {}
monitor_threads_lock = threading.Lock()

class MonitorRequest(BaseModel):
    url: str
    emails: List[str]
    project_id: str

def monitor_project_thread(project_id, url, emails):
    logger.info(f"[Thread] Started monitoring {url} for project {project_id}")

    while True:
        project = projects_collection.find_one({"_id": ObjectId(project_id)})
        if not project:
            logger.info(f"[Thread] Project {project_id} deleted. Stopping thread.")
            break

        old_hash = project.get("lastHash")
        html = Utils.fetch_page(url)

        if not html:
            time.sleep(CHECK_INTERVAL)
            continue

        new_hash = Utils.get_hash(html)

        if not old_hash:
            logger.success(f"Monitoring started for {url}!")
            Utils.send_email(emails, url, started=True)
            projects_collection.update_one(
                {"_id": ObjectId(project_id)},
                {"$set": {"lastHash": new_hash, "lastChecked": time.time()}}
            )
        elif new_hash != old_hash:
            logger.success(f"Change detected for {url}!")
            Utils.send_email(emails, url, started=False)
            projects_collection.update_one(
                {"_id": ObjectId(project_id)},
                {"$set": {"lastHash": new_hash, "lastChecked": time.time()}}
            )
        else:
            logger.info(f"No change for {url}.")

        time.sleep(CHECK_INTERVAL)

    logger.info(f"[Thread] Stopped monitoring {url} for project {project_id}")
    with monitor_threads_lock:
        monitor_threads.pop(project_id, None)

@app.post("/monitor/start")
def start_monitoring(req: MonitorRequest):
    with monitor_threads_lock:
        if len(monitor_threads) >= MAX_THREADS:
            logger.error("Max monitoring threads reached.")
            raise HTTPException(status_code=429, detail="Max monitoring threads reached.")
        if req.project_id in monitor_threads:
            logger.warning(f"Monitoring already started for project {req.project_id}.")
            raise HTTPException(status_code=400, detail="Monitoring already started for this project.")
        t = threading.Thread(target=monitor_project_thread, args=(req.project_id, req.url, req.emails), daemon=True)
        monitor_threads[req.project_id] = t
        t.start()
        logger.success(f"Started monitoring thread for project {req.project_id}")
    return {"status": "monitoring started", "project_id": req.project_id}

if __name__ == "__main__":
    logger.info("Starting FastAPI server for monitor service...")
    uvicorn.run("monitor.monitor:app", host="0.0.0.0", port=8000, reload=False)
