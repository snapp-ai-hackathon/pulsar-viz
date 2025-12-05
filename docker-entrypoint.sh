#!/bin/sh

# Always start from the default file so we don't accidentally serve 404s
if [ ! -f /usr/share/nginx/html/config.js ]; then
  echo "window.__CONFIG__ = { API_URL: \"http://pulsar.apps.private.okd4.teh-2.snappcloud.io\" };" > /usr/share/nginx/html/config.js
fi

# Static runtime config (no env override to avoid drift)
cat > /usr/share/nginx/html/config.js << EOF
window.__CONFIG__ = {
  API_URL: "http://pulsar.apps.private.okd4.teh-2.snappcloud.io"
};
EOF

# Start nginx
exec nginx -g "daemon off;"
