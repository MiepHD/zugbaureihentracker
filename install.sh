#!/bin/bash

set -e

echo "====================================="
echo " Server automatische Installation"
echo "====================================="

echo ""
echo "1. LoginDaten..."
DB_NAME="appdb"
DB_USER="appuser"
DB_PASSWORD="secret123"

echo ""
echo "2. MariaDB installieren..."
sudo apt install -y mariadb-server

echo ""
echo "3. Node.js installieren..."
sudo apt install nodejs

echo ""
echo "4. NPM installeren"
sudo apt install npm

echo ""
echo "5. Abhängigkeiten installieren..."
npm i

echo ""
echo "6. Source-code kompilieren..."
tsc

echo ""
echo "7. MariaDB starten..."
sudo systemctl start mariadb

echo ""
echo "8. Autostart aktivieren..."
sudo systemctl enable mariadb

echo ""
echo "9. Datenbank einrichten..."

sudo mariadb <<EOF

CREATE DATABASE IF NOT EXISTS ${DB_NAME};

CREATE USER IF NOT EXISTS '${DB_USER}'@'localhost'
IDENTIFIED BY '${DB_PASSWORD}';

GRANT ALL PRIVILEGES ON ${DB_NAME}.* TO '${DB_USER}'@'localhost';

FLUSH PRIVILEGES;

EOF

echo ""
echo "====================================="
echo " Datenbank Installation abgeschlossen"
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

echo ""
echo "Server starten... (mit node backend/Server.js)"
node backend/Server.js