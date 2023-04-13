from dotenv import load_dotenv, find_dotenv

load_dotenv(find_dotenv())

from typing import List
from sqlalchemy.orm import session
from . import models, crud, schemas
from .database import SessionLocal, engine

import os
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth, OAuthError
from starlette.responses import RedirectResponse, HTMLResponse
from starlette.config import Config
from starlette.requests import Request




models.Base.metadata.create_all(bind=engine)



app = FastAPI()





def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



#FastAPI Function
@app.get('/')
def public(request: Request):
    user = request.session.get('user')
    if user:
        name = user.get('name')
        return HTMLResponse(f'<p>Hello {name}!</p><a href=/logout>Logout</a>')
    return HTMLResponse('<a href=/login>Login</a>')

