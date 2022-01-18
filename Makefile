deploy:
	cd web
	yarn start
	cd -
	python3 run_backend.py