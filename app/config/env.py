
import os
from dotenv import load_dotenv

load_dotenv()

database = os.getenv('SSP_DATABASE_URL') or 'postgresql://user:password@localhost:5432/cpf_db'
squid_url = os.getenv('SQUID_URL') or 'http://localhost:8000'