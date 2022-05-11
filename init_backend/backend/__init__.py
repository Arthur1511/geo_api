from re import template
from flask import Flask, request
from flask.json import jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, Table, text
from geoalchemy2 import Geometry
from sqlalchemy.orm.session import sessionmaker
from .blueprints import busca
from . import db
#from flask_migrate import Migrate, migrate
from flask_cors import CORS


def create_app():

    app = Flask(__name__)
    #postgres:5432 é o nome do serviço no docker-compose e a porta
    app.config['DATABASE'] = "postgresql://postgres:12345@postgres:5432/gazetteer"
    app.config['DEBUG'] = True
    CORS(app)

    app.register_blueprint(busca.BLUEPRINT)

    return app


# app = create_app()

# if __name__ == '__main__':
#         app.run(debug=True, port=5000)
