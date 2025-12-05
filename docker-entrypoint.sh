#!/bin/sh

# Generate runtime config from environment variables
cat > /usr/share/nginx/html/config.js << EOF
window.__CONFIG__ = {
  API_URL: "${VITE_API_URL:-http://localhost:8088}"
};
EOF

# Start nginx
exec nginx -g "daemon off;"
