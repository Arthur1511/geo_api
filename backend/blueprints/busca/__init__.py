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
    locations = conn.execute(text("""
                                		SELECT  q.place_id, q.name as nome, q.objeto,q.description as tipo, q.distancia as distancia_km, 
	(SELECT d.regiao::text FROM divisoes_mp.risp_regiao d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as risp_regiao,
	(SELECT d.aisp::text FROM divisoes_mp.risp_aisp d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as risp_aisp,
	(SELECT d.acisp::text FROM divisoes_mp.risp_acisp d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as risp_acisp,
	(SELECT d.risp::text FROM divisoes_mp.risp d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as risp,
	(SELECT d.orgaoapoio::text FROM divisoes_mp.mpmg_credca d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mpmg_credca,
	(SELECT d.crds::text FROM divisoes_mp.mpmg_crds d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mpmg_crds,
	(SELECT d.comarca::text FROM divisoes_mp.mpmg_comarca d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mpmg_comarca,
	(SELECT d.cimos_nome::text FROM divisoes_mp.mpmg_cimos d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mpmg_cimos,
	(SELECT d.bacias::text FROM divisoes_mp.mpmg_bacias d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mpmg_bacias,
	(SELECT d.nomepolo::text FROM divisoes_mp.mg_saude_polo d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mg_saude_polo,
	(SELECT d.nm_rgint::text FROM divisoes_mp.mg_regiao_geografica_intermediaria d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mg_regiao_geografica_intermediaria,
	(SELECT d.nm_rgi::text FROM divisoes_mp.mg_regiao_geografica_imediata d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mg_regiao_geografica_imediata,
	(SELECT d.nm_mun::text FROM divisoes_mp.mg_municipio_ibge_2020 d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mg_municipio_ibge_2020,
	(SELECT d.nm_micro::text FROM divisoes_mp.mg_microrregiao d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mg_microrregiao,
	(SELECT d.nm_meso::text FROM divisoes_mp.mg_mesorregiao d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mg_mesorregiao,
	(SELECT d.macroreg::text FROM divisoes_mp.mg_macrorregiao_2020 d WHERE ST_WITHIN(q.geom, d.geom) LIMIT 1) as mg_macrorregiao_2020

	FROM (SELECT p.place_id, n.name, description, 
				CASE WHEN p.point is not null THEN ST_Distance(ST_Transform(ST_SetSRID(ST_Point(:longitude, :latitude), :srid), 4674)::geography, 
													  p.point::geography)/1000
					 WHEN p.line is not null THEN ST_Distance(ST_Transform(ST_SetSRID(ST_Point(:longitude, :latitude), :srid), 4674)::geography, 
													  p.line::geography)/1000
				   END AS distancia,
			   CASE
				WHEN p.point is not null THEN ST_AsGeoJSON(ST_TRANSFORM(p.point, :srid))::json
				WHEN p.line is not null THEN ST_AsGeoJSON(ST_TRANSFORM(p.line, :srid))::json
			   END AS objeto,
		  	   CASE
				WHEN p.point is not null THEN p.point
				WHEN p.line is not null THEN p.line
			   END AS geom
	       FROM  geodata.place p, geodata.place_name pn, geodata.name n, geodata.type t
	 	   WHERE p.place_id = pn.place_place_id 
			  AND pn.name_name_id = n.name_id
			  AND n.is_alternative = false
			  AND t.type_id = p.type_type_id
	) as q
	WHERE distancia is not null
		  AND distancia <  5  
	ORDER BY distancia ASC
	LIMIT :limite;
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
        locations = conn.execute(text("""SELECT _place_id as place_id, _name as name, _nota as nota, _point as point, _line as line, _area as area
                                        FROM new_search_filtro_estado_meso_json(:nome, :estado, :meso, :exato, :srid)"""
                                        ).bindparams(nome=nome, estado=estado, meso=meso, exato=exato, srid=srid))
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
    locations = conn.execute(text("""SELECT *,ST_Transform(e.geom,:_srid)::json as geom_json,
           ST_Distance(ST_Transform(ST_SetSRID(ST_Point(:_long, :_lat), :_srid), 4674)::geography, 
               e.geom::geography)/1000 AS distancia_km,
    		(SELECT d.regiao::text FROM divisoes_mp.risp_regiao d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as risp_regiao,
			(SELECT d.aisp::text FROM divisoes_mp.risp_aisp d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as risp_aisp,
			(SELECT d.acisp::text FROM divisoes_mp.risp_acisp d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as risp_acisp,
			(SELECT d.risp::text FROM divisoes_mp.risp d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as risp,
			(SELECT d.orgaoapoio::text FROM divisoes_mp.mpmg_credca d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mpmg_credca,
			(SELECT d.crds::text FROM divisoes_mp.mpmg_crds d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mpmg_crds,
			(SELECT d.comarca::text FROM divisoes_mp.mpmg_comarca d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mpmg_comarca,
			(SELECT d.cimos_nome::text FROM divisoes_mp.mpmg_cimos d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mpmg_cimos,
			(SELECT d.bacias::text FROM divisoes_mp.mpmg_bacias d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mpmg_bacias,
			(SELECT d.nomepolo::text FROM divisoes_mp.mg_saude_polo d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mg_saude_polo,
			(SELECT d.nm_rgint::text FROM divisoes_mp.mg_regiao_geografica_intermediaria d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mg_regiao_geografica_intermediaria,
			(SELECT d.nm_rgi::text FROM divisoes_mp.mg_regiao_geografica_imediata d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mg_regiao_geografica_imediata,
			(SELECT d.nm_mun::text FROM divisoes_mp.mg_municipio_ibge_2020 d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mg_municipio_ibge_2020,
			(SELECT d.nm_micro::text FROM divisoes_mp.mg_microrregiao d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mg_microrregiao,
			(SELECT d.nm_meso::text FROM divisoes_mp.mg_mesorregiao d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mg_mesorregiao,
			(SELECT d.macroreg::text FROM divisoes_mp.mg_macrorregiao_2020 d WHERE ST_WITHIN(e.geom, d.geom) LIMIT 1) as mg_macrorregiao_2020
	FROM geodata.endereco e
    WHERE ST_Distance(ST_Transform(ST_SetSRID(ST_Point(:_long, :_lat), :_srid), 4674)::geography, 
               e.geom::geography)/1000 < 5
    ORDER BY distancia_km ASC
    limit :_limite;""").bindparams(_lat=lat, _long=long, _limite=limite, _srid=srid))
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
                            WHERE MIN(ST_Distance(ST_Transform(ST_SetSRID(ST_Point(:longitude, :latitude), :srid), 4674)::geography, 
                                                geom::geography)/1000 ) < 5
                            GROUP BY cep
                            ORDER BY Distance ASC
                            limit :limite
                                """).bindparams(latitude=lat, longitude=long, limite=limite, srid=srid))
    db.close_db()
    return jsonify([dict(row) for row in locations])


@BLUEPRINT.route('/estados', methods=['GET'])
def get_estados():
    srid = request.args.get('srid', default=4674, type=int)
    conn = db.get_db()
    estados = conn.execute(text("""SELECT id_ibge as id, sigla, name
                                    FROM backup.estados_br
                                    ORDER BY name ASC
    """))
    db.close_db()
    return jsonify([dict(row) for row in estados])

@BLUEPRINT.route('/mesos', methods=['GET'])
def get_mesos():
    srid = request.args.get('srid', default=4674, type=int)
    estado_id = request.args.get('estado_id', type=int)
    conn = db.get_db()
    mesos = conn.execute(text("""SELECT id, nomemeso
                                FROM backup.mesorregioes_br
                                WHERE uf = (:estado_id)::varchar
                                ORDER BY nomemeso ASC
    """).bindparams(estado_id=estado_id))
    db.close_db()
    return jsonify([dict(row) for row in mesos])