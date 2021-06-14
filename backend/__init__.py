from re import template
from flask import Flask, request
from flask.json import jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine, MetaData, Table, text
from geoalchemy2 import Geometry
from sqlalchemy.orm.session import sessionmaker
from . import db
from flask_migrate import Migrate, migrate
from flask_cors import CORS


def create_app():

    app = Flask(__name__)

    app.config['DATABASE'] = "postgresql://postgres:7532159@localhost/geolocation"
    CORS(app)

    @app.route("/coord_estado", methods=['GET', 'Post'])
    def teste():

        conn = db.get_db()
        # db.session.execute(
        # text('select e.name, (ST_area(e.geom::geography)/1000000) area from geodata.estados_br e ')).fetchall()

        # estados = conn.execute(
        #     text('select e.name, (ST_area(e.geom::geography)/1000000) area from geodata.estados_br e ')).fetchall()
        # estados = conn.execute(
        #     text('select e.name, (ST_y(st_centroid(e.geom))) lat, (ST_x(st_centroid(e.geom))) long from geodata.estados_br e ')).fetchall()
        # ST_Point(-43.172537, -19.807854)

        request_data = request.get_json()
        latitude = request_data['latitude']
        longitude = request_data['longitude']

        locations = conn.execute(text("""SELECT loc.place_id, loc.name, loc.lat, loc.long, ST_Distance(ST_Point(loc.long,loc.lat)::geography, ST_Point(:longitude, :latitude)::geography)/1000 AS Distance
                                FROM (SELECT p.place_id, n.name,
                                        CASE
                                        WHEN p.point is not null THEN ST_Y(p.point)
                                        WHEN p.area is not null THEN ST_Y(ST_Centroid(p.area))
                                        WHEN p.line is not null THEN ST_Y(ST_Centroid(p.line))
                                        END as lat,
                                        CASE
                                        WHEN p.point is not null THEN ST_X(p.point)
                                        WHEN p.area is not null THEN ST_X(ST_Centroid(p.area))
                                        WHEN p.line is not null THEN ST_X(ST_Centroid(p.line))
                                        END as long
                                    FROM geodata.name as n, geodata.place as p, geodata.place_name as pn
                                    WHERE p.place_id = pn.place_place_id and pn.name_name_id = n.name_id and n.is_alternative = false) AS loc
                                WHERE ST_Distance(ST_Point(loc.long,loc.lat)::geography, ST_Point(:longitude, :latitude)::geography) < 500000
                                limit 100
                                    """).bindparams(latitude=latitude, longitude=longitude))

        return jsonify([dict(row) for row in locations])

    return app
