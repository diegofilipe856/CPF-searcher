
import os
from dotenv import load_dotenv

load_dotenv()

database = os.getenv('SSP_DATABASE_URL') or 'postgresql://user:password@localhost:5432/cpf_db'