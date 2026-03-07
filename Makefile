.PHONY: build up down dev logs restart clean

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

dev:
	RUN_NOW=true docker compose up --build

logs:
	docker exec stock-scraper cat /var/log/scraper.log

logs-follow:
	docker exec stock-scraper tail -f /var/log/scraper.log

restart:
	docker compose restart

clean:
	docker compose down --rmi local --volumes
