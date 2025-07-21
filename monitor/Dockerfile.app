FROM ghcr.io/harri200191/websitechangeanalyzer/monitor-base:1.0.0

WORKDIR /app 

COPY . .

CMD ["uvicorn", "monitor.monitor:app", "--host", "0.0.0.0", "--port", "8000"]
