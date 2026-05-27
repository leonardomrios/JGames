# Semillitas 🌱

Portal web de juegos educativos cristianos para niños. Primer juego: memoria de parejas
con niveles configurables y dashboard de progreso para profesores.

## Stack

- Next.js 15 (App Router) + TypeScript estricto
- Tailwind CSS v4
- Prisma ORM + PostgreSQL 16
- Auth.js (NextAuth v5)
- Framer Motion

## Requisitos

- Node 20 LTS o superior
- pnpm
- PostgreSQL 16 local (o Docker, ver más abajo)

## Arranque local (modo desarrollo)

1. Copiar `.env.example` a `.env` y ajustar `DATABASE_URL` a tu Postgres local.
2. Instalar dependencias:
   ```
   pnpm install
   ```
3. Aplicar migraciones:
   ```
   pnpm db:generate
   pnpm db:migrate
   ```
4. Arrancar el servidor de desarrollo:
   ```
   pnpm dev
   ```
5. Abrir http://localhost:3000
6. Verificar conexión a BD: http://localhost:3000/api/health

## Postgres en Docker (opcional)

El `docker-compose.yml` está configurado con las mismas credenciales que el `.env` de
desarrollo, así que es un reemplazo directo: detén tu Postgres local y arranca el
contenedor con `pnpm db:up`. La app se conecta sin cambios.

## Scripts

| Comando | Acción |
|---|---|
| `pnpm dev` | Servidor de desarrollo en :3000 |
| `pnpm build` | Build de producción |
| `pnpm start` | Servir build de producción |
| `pnpm db:up` | Arrancar Postgres en Docker |
| `pnpm db:down` | Detener Postgres en Docker |
| `pnpm db:migrate` | Aplicar migraciones Prisma |
| `pnpm db:studio` | Abrir Prisma Studio |
| `pnpm db:generate` | Regenerar cliente Prisma |

## Estructura del proyecto

```text
src/
├── app/
│   ├── (auth)/      # login (niños y profesores)
│   ├── (game)/      # juegos
│   ├── (teacher)/   # dashboard de profesor
│   ├── (admin)/     # gestión de niveles
│   └── api/         # endpoints (health, auth)
├── components/      # game, teacher, ui
├── lib/             # db, auth, utilidades
└── server/          # actions y queries
prisma/              # schema y migraciones
public/
├── avatars/         # avatares de niños
└── levels/          # imágenes de niveles (subcarpetas por temática)
```

## Estado del desarrollo

Fase 0 completa: esqueleto Next.js + Prisma + Postgres operativo.
Próximas fases: MVP jugable -> autenticación real -> dashboard -> admin.

## Despliegue en producción (Docker)

### Requisitos del servidor

- Ubuntu 22.04 (o similar)
- Docker Engine 24+
- Docker Compose v2
- 2 vCPU / 2 GB RAM mínimo

### Pasos

1. Clonar/copiar el proyecto al servidor:
   ```
   git clone <url-del-repo> semillitas
   cd semillitas
   ```

2. Crear archivo de configuración:
   ```
   cp .env.production.example .env.production
   nano .env.production
   ```
   Completar `AUTH_SECRET` (generar con `openssl rand -base64 32`) y `POSTGRES_PASSWORD`.

3. Desplegar:
   ```
   bash scripts/deploy.sh
   ```

4. Seed inicial (solo la primera vez):
   ```
   docker compose -f docker-compose.production.yml exec app npx prisma db seed
   ```

5. La app estará disponible en `http://<ip-del-servidor>`.

### HTTPS (opcional, requiere dominio)

Para habilitar HTTPS con Let's Encrypt, instalar Certbot en el host:
```
sudo apt install certbot
sudo certbot certonly --standalone -d tu-dominio.com
```
Luego actualizar `nginx/default.conf` con la configuración SSL y los paths
a los certificados, y añadir el puerto 443 en `docker-compose.production.yml`.

### Comandos útiles

| Comando | Acción |
|---|---|
| `docker compose -f docker-compose.production.yml logs -f` | Ver logs en vivo |
| `docker compose -f docker-compose.production.yml restart app` | Reiniciar la app |
| `docker compose -f docker-compose.production.yml down` | Detener todo |
| `docker compose -f docker-compose.production.yml exec app npx prisma studio` | Prisma Studio en prod |
