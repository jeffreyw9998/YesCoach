from typing import List

from fastapi import FastAPI, Depends, HTTPException
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

SECRET_KEY="tXYHB0kSzU7fxaadhNBNYv9N5ygkVZTU-OZ-GnCC"
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

config = Config('.env')
oauth = OAuth(config)

CONF_URL = 'https://accounts.google.com/.well-known/openid-configuration'
oauth.register(
    name='google',
    server_metadata_url=CONF_URL,
    client_kwargs={
        'scope': 'openid email profile'
    }
)




def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()



#FastAPI Functions
@app.route('/login')
async def login(request: Request):
    # absolute url for callback
    # we will define it below
    redirect_uri = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.route('/auth')
async def auth(request: Request):
    try:
        access_token = await oauth.google.authorize_access_token(request)
    except OAuthError:
        return RedirectResponse(url='/')
    user_data = await oauth.google.parse_id_token(request, access_token)
    request.session['user'] = dict(user_data)
    return RedirectResponse(url='/')

@app.get('/')
def public(request: Request):
    user = request.session.get('user')
    if user:
        name = user.get('name')
        return HTMLResponse(f'<p>Hello {name}!</p><a href=/logout>Logout</a>')
    return HTMLResponse('<a href=/login>Login</a>')


@app.route('/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url='/')