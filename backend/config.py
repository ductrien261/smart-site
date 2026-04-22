import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

BASE_DIR   = Path(__file__).parent.parent
DATA_DIR   = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

PROCESSED_DIR = DATA_DIR / "processed"
OUTPUTS_DIR   = DATA_DIR / "outputs"
RAW_DIR       = DATA_DIR / "raw"