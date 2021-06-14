from flask_sqlalchemy import SQLAlchemy
import geoalchemy2
import sqlalchemy
from flask import current_app, g
from flask.cli import with_appcontext
from sqlalchemy import engine


def get_db():
    if 'db' not in g:
        engine = sqlalchemy.create_engine(
            current_app.config['DATABASE'], echo=True, encoding='utf-8')
        g.db = engine.connect()
        # g.db.row_factory = sqlalchemy.row
    return g.db


def close_db(e=None):
    db = g.pop('db', None)

    if db is not None:
        db.close()


def init_app(app):
    app.teardown_appcontext(close_db)
