#!/bin/sh
set -e

echo "Semillitas - iniciando..."

if [ ! -f /app/public/levels/.initialized ]; then
  echo "Primer deploy: copiando imagenes base a /app/public/levels/..."
  cp -rn /app/public/levels-seed/* /app/public/levels/ 2>/dev/null || true
  touch /app/public/levels/.initialized
  echo "Imagenes base copiadas"
fi

echo "Aplicando migraciones de base de datos..."
npx prisma migrate deploy
echo "Migraciones aplicadas"

echo "Iniciando servidor en puerto ${PORT:-3000}..."
exec node server.js
