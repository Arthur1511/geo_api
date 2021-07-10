from flask import Blueprint, jsonify
import backend.db as db
from sqlalchemy import text

BLUEPRINT = Blueprint('busca', __name__)


@BLUEPRINT.route('/busca/lugares/geocodificacao_reversa/<float:lat>/<float:long>', methods=['GET'])
@BLUEPRINT.route('/busca/lugares/geocodificacao_reversa/<float:lat>/<float:long>/<int:srid>', methods=['GET'])
def geocodificacao_reversa(lat, long, limite=10, srid=4674):
    # srid: 4674 = SIRGAS 2000, padrão usado pelo governo brasileiro
    # srid: 4626 = WGS84, mais usado fora do brasil, GPS
    conn = db.get_db()
    locations = conn.execute(text("""SELECT loc.place_id, loc.name, loc.lat, loc.long, 
                                    ST_Distance(ST_Transform(ST_SetSRID(ST_Point(:longitude, :latitude), :srid), 4674)::geography, 
                                                ST_Point(loc.long, loc.lac)::geography)/1000 AS Distance
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
                            ORDER BY Distance ASC
                            limit :limite
                                """).bindparams(latitude=lat, longitude=long, limite=limite, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


@BLUEPRINT.route('/busca/lugares/<string:nome>/', methods=['GET'])
@BLUEPRINT.route('/busca/lugares/<string:nome>/<int:srid>', methods=['GET'])
def geocodificacao_lugares(nome, srid=4674):
    conn = db.get_db()
    locations = conn.execute(text("SELECT * FROM search_json(:nome)").bindparams(nome=nome))
    db.close_db()
    return jsonify([dict(row) for row in locations])

# busca de lugares, filtrando-os por estado para reduzir desambiguação
# o estado pode ser informado por seu nome ou sua sigla, caso não haja um match, desconsidera o filtro
@BLUEPRINT.route('/busca/lugares/<string:nome>/<string:estado>', methods=['GET'])
@BLUEPRINT.route('/busca/lugares/<string:nome>/<string:estado>/<int:srid>', methods=['GET'])
def geocodificacao_lugares_filtro(nome, estado, srid=4674):
    conn = db.get_db()
    locations = conn.execute(text("SELECT * FROM search_filtro_json(:nome, :estado)").bindparams(nome=nome, estado=estado))
    db.close_db()
    return jsonify([dict(row) for row in locations])

# busca de endereços de forma estruturada, nomes devem bater de forma exata
@BLUEPRINT.route('/busca/enderecos/<string:nome>/<string:numero>/<string:cidade>/<string:estado>', methods=['GET'])
@BLUEPRINT.route('/busca/enderecos/<string:nome>/<string:numero>/<string:cidade>/<string:estado>/<int:srid>', methods=['GET'])
def geocodificacao_enderecos(nome, numero, cidade, estado, srid=4674):
    conn = db.get_db()
    # equivalente a:
    # SELECT * FROM search_addresses_json(:nome, :numero, :cidade, :estado, :srid)
    locations = conn.execute(text("""SELECT * FROM search_addresses_json(:nome, :numero, :cidade, :estado, :srid)
                                    """).bindparams(nome=nome, numero=numero, cidade=cidade, estado=estado, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


# retorna endereços que possuem o cep informado
@BLUEPRINT.route('/busca/enderecos/<string:cep>', methods=['GET'])
@BLUEPRINT.route('/busca/enderecos/<string:cep>/<int:srid>', methods=['GET'])
def geocodificacao_cep(cep, srid=4674):
    conn = db.get_db()
    locations = conn.execute(text("""SELECT * FROM search_addresses_cep_json(:cep, :srid)
                                    """).bindparams(cep=cep, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


# busca não estruturada de endereços
@BLUEPRINT.route('/busca/enderecos/<string:end>', methods=['GET'])
@BLUEPRINT.route('/busca/enderecos/<string:end>/<int:srid>', methods=['GET'])
def geocodificacao_cep(end, srid=4674):
    conn = db.get_db()
    locations = conn.execute(text("""SELECT *, ST_Transform(geom,:srid)::json FROM backup.parsing(:end)
                                    """).bindparams(end=end, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


@BLUEPRINT.route('/busca/enderecos/geocodificacao_reversa/<float:lat>/<float:long>', methods=['GET'])
@BLUEPRINT.route('/busca/enderecos/geocodificacao_reversa/<float:lat>/<float:long>/<int:srid>', methods=['GET'])
def geocodificacao_reversa(lat, long, limite=10, srid=4674):
    conn = db.get_db()
    locations = conn.execute(text("""SELECT *,ST_Transform(geom,:srid)::json,
                                    ST_Distance(ST_Transform(ST_SetSRID(ST_Point(:longitude, :latitude), :srid), 4674)::geography, 
                                                geom::geography)/1000 AS Distance
                            FROM geodata.endereco
                            ORDER BY Distance ASC
                            limit :limite
                                """).bindparams(latitude=lat, longitude=long, limite=limite, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])