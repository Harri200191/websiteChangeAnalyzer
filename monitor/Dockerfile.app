FROM ghcr.io/harri200191/monitor-base:latest

COPY monitor.py /app/

# Default run command
CMD ["python", "monitor.py"]
