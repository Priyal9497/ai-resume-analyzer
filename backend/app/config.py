import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./resume.db")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "secret-key-default")
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "./uploads")
    ALLOWED_EXTENSIONS: list = ['.pdf', '.docx', '.txt']
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB

    def __init__(self):
        os.makedirs(self.UPLOAD_DIR, exist_ok=True)

settings = Settings()