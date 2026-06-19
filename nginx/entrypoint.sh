#!/bin/sh
# Selects HTTP or HTTPS config based on whether certificates exist.
CERT="/etc/letsencrypt/live/altaiguide.ru/fullchain.pem"

if [ -f "$CERT" ]; then
  echo "[nginx] Certificates found — starting with HTTPS"
  exec nginx -c /etc/nginx/nginx-ssl.conf -g "daemon off;"
else
  echo "[nginx] No certificates yet — starting with HTTP only"
  exec nginx -g "daemon off;"
fi
