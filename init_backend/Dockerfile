FROM python:3.8

WORKDIR /backend 

COPY ./requirements.txt .

RUN pip3 install -r requirements.txt

COPY . .

EXPOSE 5003

CMD ["python3", "run_backend.py"]

