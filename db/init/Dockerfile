FROM postgis/postgis:12-3.2 
#-alpine

RUN apt-get update && apt-get install -y python3-pip
RUN pip install Unidecode
#CMD ["pip", "install", "Unidecode"]

#CMD ["apt-get", "update"]
RUN apt-get update && apt-get -y install python3 postgresql-plpython3-12

# RUN set -ex \
#     && apk add --no-cache --virtual .plpython3-deps --repository http://nl.alpinelinux.org/alpine/edge/testing \
#     postgresql12-plpython3 \

#RUN pip install Unidecode

