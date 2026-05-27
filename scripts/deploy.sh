#!/bin/bash
set -e

echo "Semillitas - Deploy"
echo "======================"

if [ ! -f .env.production ]; then
  echo "Falta el archivo .env.production"
  echo "Copia .env.production.example a .env.production y completa los valores."
  exit 1
fi

export $(grep -v '^#' .env.production | xargs)

echo "Construyendo contenedores..."
docker compose -f docker-compose.production.yml build

echo "Levantando servicios..."
docker compose -f docker-compose.production.yml up -d

echo ""
echo "Deploy completado"
echo "  App: https://juegos.datacense.tech (configurado via Nginx del host)"
echo "  Para ver logs: docker compose -f docker-compose.production.yml logs -f app"
echo "  Seed inicial (solo primer deploy, si aplica): docker compose -f docker-compose.production.yml exec app npx prisma db seed"
