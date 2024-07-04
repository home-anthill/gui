#!/bin/sh
set -e

# Default nginx.conf location loaded by nginx
# nginx_conf_file=/etc/nginx/nginx.conf

nginx -s quit
sleep 2
nginx -g "daemon off;"