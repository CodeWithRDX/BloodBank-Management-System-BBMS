#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════════════════════
# Nagios 4 Automated Installation & Configuration Script for BBMS
# Compatible with Ubuntu 20.04, 22.04, 24.04 LTS
# ══════════════════════════════════════════════════════════════════════════════

set -euo pipefail

NAGIOS_VER="4.4.14"
PLUGINS_VER="2.4.6"
NAGIOS_USER="nagios"
NAGIOS_GROUP="nagios"
NAGCMD_GROUP="nagcmd"
NAGIOS_ADMIN_USER="nagiosadmin"
NAGIOS_ADMIN_PASS="${1:-AdminBBMS@2026}"
APACHE_PORT="8080"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================================================="
echo " Starting Nagios 4 Core and Plugins Installation for BBMS"
echo "=========================================================================="

if [ "$EUID" -ne 0 ]; then
    echo "❌ Error: This script must be run as root (use sudo ./install-nagios.sh)"
    exit 1
fi

echo "[1/8] Installing build dependencies, Apache2, and PHP..."
apt-get update -y
DEBIAN_FRONTEND=noninteractive apt-get install -y \
    autoconf \
    gcc \
    libc6 \
    make \
    apache2 \
    apache2-utils \
    php \
    libapache2-mod-php \
    libgd-dev \
    libssl-dev \
    libmcrypt-dev \
    bc \
    gawk \
    dc \
    build-essential \
    snmp \
    libnet-snmp-perl \
    gettext \
    unzip \
    curl \
    net-tools

echo "[2/8] Creating Nagios users and group permissions..."
if ! id -u "$NAGIOS_USER" >/dev/null 2>&1; then
    useradd -m -s /bin/bash "$NAGIOS_USER"
fi

if ! getent group "$NAGCMD_GROUP" >/dev/null 2>&1; then
    groupadd "$NAGCMD_GROUP"
fi

usermod -a -G "$NAGCMD_GROUP" "$NAGIOS_USER"
usermod -a -G "$NAGCMD_GROUP" www-data

echo "[3/8] Downloading and building Nagios Core ${NAGIOS_VER}..."
BUILD_DIR="/tmp/nagios-build"
rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR"
cd "$BUILD_DIR"

curl -SL "https://github.com/NagiosEnterprises/nagioscore/releases/download/nagios-${NAGIOS_VER}/nagios-${NAGIOS_VER}.tar.gz" -o nagios.tar.gz
tar -xzf nagios.tar.gz
cd "nagios-${NAGIOS_VER}"

./configure --with-httpd-conf=/etc/apache2/sites-enabled --with-command-group="$NAGCMD_GROUP"
make all
make install-groups-users
make install
make install-daemoninit
make install-commandmode
make install-config
make install-webconf

echo "[4/8] Configuring Apache2 for Nagios on dedicated Port ${APACHE_PORT}..."
# Ensure Apache does not collide with Nginx on Port 80
if ! grep -q "Listen ${APACHE_PORT}" /etc/apache2/ports.conf; then
    echo "Listen ${APACHE_PORT}" >> /etc/apache2/ports.conf
fi
# Remove default port 80 from Apache if present to prevent conflict with Nginx
sed -i "s/^Listen 80$/# Listen 80/" /etc/apache2/ports.conf || true

# Update nagios.conf Apache virtualhost to bind to APACHE_PORT
if [ -f /etc/apache2/sites-enabled/nagios.conf ]; then
    sed -i "s/<VirtualHost \*:80>/<VirtualHost \*:${APACHE_PORT}>/g" /etc/apache2/sites-enabled/nagios.conf || true
fi

a2enmod rewrite cgi
htpasswd -b -c /usr/local/nagios/etc/htpasswd.users "$NAGIOS_ADMIN_USER" "$NAGIOS_ADMIN_PASS"
chown www-data:www-data /usr/local/nagios/etc/htpasswd.users

echo "[5/8] Downloading and compiling official Nagios Plugins ${PLUGINS_VER}..."
cd "$BUILD_DIR"
curl -SL "https://github.com/nagios-plugins/nagios-plugins/releases/download/release-${PLUGINS_VER}/nagios-plugins-${PLUGINS_VER}.tar.gz" -o plugins.tar.gz
tar -xzf plugins.tar.gz
cd "nagios-plugins-${PLUGINS_VER}"

./configure --with-nagios-user="$NAGIOS_USER" --with-nagios-group="$NAGIOS_GROUP" --with-openssl
make
make install

echo "[6/8] Deploying BBMS object definitions and custom check plugins..."
mkdir -p /usr/local/nagios/etc/objects/bbms
cp "$SCRIPT_DIR"/objects/*.cfg /usr/local/nagios/etc/objects/bbms/
chown -R nagios:nagios /usr/local/nagios/etc/objects/bbms

# Install custom check plugins
cp "$SCRIPT_DIR"/plugins/*.sh /usr/local/nagios/libexec/
chmod +x /usr/local/nagios/libexec/*.sh
chown nagios:nagios /usr/local/nagios/libexec/*.sh

# Link / deploy master nagios.cfg if present
if [ -f "$SCRIPT_DIR/nagios.cfg" ]; then
    cp "$SCRIPT_DIR/nagios.cfg" /usr/local/nagios/etc/nagios.cfg
    chown nagios:nagios /usr/local/nagios/etc/nagios.cfg
fi

echo "[7/8] Validating Nagios configuration..."
/usr/local/nagios/bin/nagios -v /usr/local/nagios/etc/nagios.cfg

echo "[8/8] Starting and enabling Apache2 and Nagios services..."
systemctl restart apache2
systemctl restart nagios
systemctl enable apache2
systemctl enable nagios

PUBLIC_IP=$(curl -s https://api.ipify.org || hostname -I | awk '{print $1}')

echo "=========================================================================="
echo " 🎉 Nagios 4 Monitoring Setup Complete for BBMS!"
echo "=========================================================================="
echo " Dashboard URL : http://${PUBLIC_IP}:${APACHE_PORT}/nagios"
echo " Username      : ${NAGIOS_ADMIN_USER}"
echo " Password      : ${NAGIOS_ADMIN_PASS}"
echo " Configuration : /usr/local/nagios/etc/nagios.cfg"
echo " BBMS Objects  : /usr/local/nagios/etc/objects/bbms/"
echo " Custom Plugins: /usr/local/nagios/libexec/"
echo " Verify Command: /usr/local/nagios/bin/nagios -v /usr/local/nagios/etc/nagios.cfg"
echo "=========================================================================="

