import sys
from loguru import logger

logger.remove()

logger.level("SUCCESS", color="<green>")
logger.level("INFO", color="<blue>")
logger.level("ERROR", color="<red>")
 
logger.add(
    sys.stderr,
    format="<level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
    level="INFO" # Set the minimum level to log
)

__all__ = ["logger"] 