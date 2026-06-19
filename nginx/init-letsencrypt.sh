#!/bin/bash
# Run once on the server to obtain the initial TLS certificate.
# Usage: bash nginx/init-letsencrypt.sh
set -e

DOMAIN="altaiguide.ru"
EMAIL="${CERTBOT_EMAIL:-admin@altaiguide.ru}"

echo "==> Starting stack in HTTP mode..."
docker compose up -d

echo "==> Waiting for nginx to be ready..."
until docker compose exec nginx nginx -t 2>/dev/null; do
  sleep 2
done

echo "==> Requesting certificate from Let's Encrypt..."
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot --webroot-path /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos --no-eff-email \
  -d "$DOMAIN" -d "www.$DOMAIN"

echo "==> Restarting nginx with HTTPS config..."
docker compose restart nginx

echo ""
echo "Done! Site is live at https://$DOMAIN"
echo "Certbot will auto-renew certificates every 12 hours."
