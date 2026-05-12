#!/bin/bash

set -e

echo "====================================="
echo " MariaDB automatische Installation"
echo "====================================="

DB_NAME="appdb"
DB_USER="appuser"
DB_PASSWORD="secret123"

echo ""
echo "1. Pakete aktualisieren..."
sudo apt update

echo ""
echo "2. MariaDB installieren..."
sudo apt install -y mariadb-server

echo ""
echo "3. MariaDB starten..."
sudo systemctl start mariadb

echo ""
echo "4. Autostart aktivieren..."
sudo systemctl enable mariadb

echo ""
echo "5. Datenbank einrichten..."

sudo mariadb <<EOF

CREATE DATABASE IF NOT EXISTS ${DB_NAME};

CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'
IDENTIFIED BY '${DB_PASSWORD}';

GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

FLUSH PRIVILEGES;

EOF

echo ""
echo "====================================="
echo " Installation abgeschlossen"
echo "====================================="
echo ""
echo "Datenbank:"
echo "  ${DB_NAME}"
echo ""
echo "Benutzer:"
echo "  ${DB_USER}"
echo ""
echo "Passwort:"
echo "  ${DB_PASSWORD}"
echo ""
echo "Verbindung:"
echo "  host=localhost"
echo "  port=3306"
echo ""
echo "Test:"
echo "  mariadb -u ${DB_USER} -p ${DB_NAME}"
echo ""