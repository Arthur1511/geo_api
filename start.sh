docker-compose up --build -d \
&& docker exec -it postgres sh -c "psql -U postgres -d gazetteer --command 'refresh materialized view geodata.municipio_mg;'" \
&& docker exec -it postgres sh -c "psql -U postgres -d gazetteer --command 'refresh materialized view geodata.bairro_bh;'" \
&& docker exec -it postgres sh -c "psql -U postgres -d gazetteer --command 'refresh materialized view geodata.logradouro_mg;'" \
&& docker exec -it postgres sh -c "psql -U postgres -d gazetteer --command '\q;'" 

exit