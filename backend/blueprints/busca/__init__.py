from flask import Blueprint, jsonify, request
import backend.db as db
from sqlalchemy import text

BLUEPRINT = Blueprint('busca', __name__)


@BLUEPRINT.route('/busca/lugares/geocodificacao_reversa', methods=['GET'])
def geocodificacao_reversa_lugares():
    # srid: 4674 = SIRGAS 2000, padrão usado pelo governo brasileiro
    # srid: 4626 = WGS84, mais usado fora do brasil, GPS
    lat = request.args.get('lat', type=float)
    long = request.args.get('long', type=float)
    limite = request.args.get('limite', default=10, type=int)
    srid = request.args.get('srid', default=4674, type=int)
    conn = db.get_db()
    locations = conn.execute(text("""SELECT * FROM geodata.place_reverse_geocoding(:latitude, :longitude, :limite, :srid);
                                """).bindparams(latitude=lat, longitude=long, limite=limite, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


# busca de lugares, filtrando-os por estado, mesoregião ou por id de um polígono qualquer na tabela "place" para reduzir desambiguação
# o estado pode ser informado por seu nome ou sua sigla, caso não haja um match, desconsidera o filtro
@BLUEPRINT.route('/busca/lugares', methods=['GET'])
def geocodificacao_lugares_filtro():
    nome = request.args.get('nome', default='',type=str)
    estado = request.args.get('estado', default='', type=str)
    meso = request.args.get('meso', default='', type=str)
    exato = request.args.get('exato', default=False, type=lambda v: v.lower() == 'true' or v.lower() == 't')
    srid = request.args.get('srid', default=4674, type=int)
    poligono_id = request.args.get('poligono_id', default=-1, type=int)
    conn = db.get_db()
    if poligono_id != -1:
        locations = conn.execute(text("SELECT * FROM new_search_filtro_id_json(:nome, :poligono_id, :exato, :srid)").bindparams(nome=nome, poligono_id=poligono_id, exato=exato, srid=srid))
    elif meso!='' or estado != '':
        locations = conn.execute(text("SELECT * FROM new_search_filtro_estado_meso_json(:nome, :estado, :meso, :exato, :srid)").bindparams(nome=nome, estado=estado, meso=meso, exato=exato, srid=srid))
    else:
        locations = conn.execute(text("SELECT * FROM new_search_json(:nome, :exato, :srid)").bindparams(nome=nome, exato=exato, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])

# busca de endereços de forma estruturada
@BLUEPRINT.route('/busca/enderecos/estruturado', methods=['GET'])
def geocodificacao_enderecos_estruturado():
    nome = request.args.get('nome', type=str)
    numero = request.args.get('numero', type=str)
    cidade = request.args.get('cidade', type=str)
    estado = request.args.get('estado', type=str)
    exato = request.args.get('exato', default=False, type=lambda v: v.lower() == 'true' or v.lower() == 't')
    threshold = request.args.get('threshold', default=0.85, type=float)
    srid = request.args.get('srid', default=4674, type=int)
    conn = db.get_db()
    locations = conn.execute(text("""SELECT *, ST_Transform(geom,:srid)::json as geom_json 
                                    FROM search_addresses(:nome, :numero, :cidade, :estado, :exato, :threshold)
                                    """).bindparams(nome=nome, numero=numero, cidade=cidade, estado=estado, exato=exato, threshold=threshold, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


# retorna endereços que possuem o cep informado
@BLUEPRINT.route('/busca/enderecos/cep', methods=['GET'])
def geocodificacao_cep():
    cep = request.args.get('cep', type=str)
    srid = request.args.get('srid', default=4674, type=int)
    conn = db.get_db()
    locations = conn.execute(text("""SELECT * FROM search_addresses_cep_json(:cep, :srid)
                                    """).bindparams(cep=cep, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


# retorna endereços que estão contindos no polígono com id informado da tabela "place"
@BLUEPRINT.route('/busca/enderecos/poligono_id', methods=['GET'])
def geocodificacao_id():
    id = request.args.get('id', type=str)
    srid = request.args.get('srid', default=4674, type=int)
    conn = db.get_db()
    locations = conn.execute(text("""SELECT * FROM search_addresses_id_json(:id, :srid)
                                    """).bindparams(id=id, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


# busca não estruturada de endereços
@BLUEPRINT.route('/busca/enderecos', methods=['GET'])
def geocodificacao_enderecos():
    # adicionar busca não exata
    # adicionar -1 retorna todos
    end = request.args.get('end', type=str)
    exato = request.args.get('exato', default=False, type=lambda v: v.lower() == 'true' or v.lower() == 't')
    threshold = request.args.get('threshold', default=0.85, type=float)
    srid = request.args.get('srid', default=4674, type=int)
    conn = db.get_db()
    locations = conn.execute(text("""SELECT *, ST_Transform(geom,:srid)::json as geom_json FROM backup.parsing(:end, :exato, :threshold)
                                    """).bindparams(end=end, srid=srid, exato=exato, threshold=threshold))
    db.close_db()
    return jsonify([dict(row) for row in locations])


@BLUEPRINT.route('/busca/enderecos/geocodificacao_reversa', methods=['GET'])
def geocodificacao_reversa_enderecos():
    lat = request.args.get('lat', type=float)
    long = request.args.get('long', type=float)
    limite = request.args.get('limite', default=10, type=int)
    srid = request.args.get('srid', default=4674, type=int)
    conn = db.get_db()
    locations = conn.execute(text("""SELECT * FROM geodata.address_reverse_geocoding(:lat, :long, :limite, :srid)
                                """).bindparams(lat=lat, long=long, limite=limite, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


# recebe como entrada um ponto e retorna os ceps mais próximos
@BLUEPRINT.route('/busca/enderecos/geocodificacao_reversa/cep', methods=['GET'])
def geocodificacao_reversa_enderecos_cep():
    lat = request.args.get('lat', type=float)
    long = request.args.get('long', type=float)
    limite = request.args.get('limite', default=10, type=int)
    srid = request.args.get('srid', default=4674, type=int)
    conn = db.get_db()
    locations = conn.execute(text("""SELECT cep, ST_asGeoJson(ST_asText(MIN(ST_Transform(geom,:srid))))::json as geom_json,
                                    MIN(ST_Distance(ST_Transform(ST_SetSRID(ST_Point(:longitude, :latitude), :srid), 4674)::geography, 
                                                geom::geography)/1000 ) AS Distance
                            FROM geodata.endereco
                            GROUP BY cep
                            ORDER BY Distance ASC
                            limit :limite
                                """).bindparams(latitude=lat, longitude=long, limite=limite, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])