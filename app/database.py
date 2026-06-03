from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config.env import database


engine = create_engine(database)
Sessionlocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = Sessionlocal()
    try:
        yield db
    finally:
        db.close()