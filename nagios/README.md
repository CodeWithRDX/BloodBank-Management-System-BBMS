# 📊 Nagios 4 Infrastructure & Application Monitoring for BBMS

This directory contains the production-grade Nagios 4 Core monitoring architecture for the Blood Bank Management System (BBMS).

---

## 🏗️ Architecture & Monitored Services

Nagios 4 operates on port **8080** (to avoid port collision with Nginx on port 80) and performs continuous health checks across two tiers:

### 1. Infrastructure & Server Layer
- **Host Reachability**: ICMP Ping, round-trip packet latency and packet loss.
- **CPU System Load**: 1-minute, 5-minute, and 15-minute load averages (`check_load`).
- **Memory Utilization**: Real-time RAM consumption % using `/proc/meminfo` (`check_mem.sh`).
- **Disk Utilization**: Root EBS gp3 partition usage % (`check_disk`).
- **SSH Connectivity**: Port 22 availability.

### 2. Application & Runtime Layer
- **Nginx Web Server**: HTTP Port 80 availability (`check_http_port`).
- **Nginx Internal Health Endpoint**: Checks `GET /nginx-health` returning HTTP 200 `healthy`.
- **React Frontend Application**: Probes `GET /` verifying HTTP 200 response.
- **Backend Node.js API Health**: Probes `GET /api/health` verifying `"success":true` and JSON uptime.
- **PM2 Node.js Process**: Audits PM2 daemon to ensure `bbms-backend` is in `online` status (`check_pm2.sh`).
- **MongoDB Database**: Verifies local daemon is listening on `127.0.0.1:27017` without public exposure (`check_mongo.sh`).

---

## 📁 Directory Structure

```
nagios/
├── install-nagios.sh           # Automated compiler & setup script for Ubuntu
├── nagios.cfg                  # Master Nagios Core configuration
├── objects/
│   ├── hosts.cfg               # BBMS server host definition & hostgroups
│   ├── services.cfg            # Infrastructure & application service checks
│   ├── commands.cfg            # Custom Nagios check commands & notification commands
│   └── contacts.cfg            # Alert contacts (email & notification schedules)
├── plugins/
│   ├── check_mem.sh            # Memory utilization check plugin
│   ├── check_pm2.sh            # PM2 Node.js process monitor plugin
│   └── check_mongo.sh          # MongoDB port/service availability plugin
└── README.md                   # This documentation file
```

---

## 🚀 Quick Setup & Installation

To install Nagios 4 Core, Nagios Plugins, and BBMS service checks on your Ubuntu EC2 instance:

```bash
# 1. Make the installer executable
chmod +x nagios/install-nagios.sh nagios/plugins/*.sh

# 2. Run the automated installer as root (pass custom admin password if desired)
sudo ./nagios/install-nagios.sh "YourStrongPasswordHere"
```

### Accessing the Web Dashboard
- **URL**: `http://<EC2_PUBLIC_IP>:8080/nagios`
- **Username**: `nagiosadmin`
- **Password**: Provided during installation (default: `AdminBBMS@2026`)

---

## ⚙️ Configuration Validation & Troubleshooting

### Validate Nagios Configurations
Always test configuration syntax before restarting the daemon:
```bash
sudo /usr/local/nagios/bin/nagios -v /usr/local/nagios/etc/nagios.cfg
```

### Restart Services
```bash
sudo systemctl restart nagios
sudo systemctl restart apache2
```

### View Live Nagios Logs
```bash
tail -f /usr/local/nagios/var/nagios.log
```

---

## 🔔 Alert Thresholds Reference

| Metric | Warning Threshold | Critical Threshold | Check Interval |
|---|---|---|---|
| **CPU Load** | 5.0, 4.0, 3.0 | 10.0, 8.0, 6.0 | 1 min |
| **RAM Usage** | 80% | 90% | 2 min |
| **Disk Space** | 20% free remaining | 10% free remaining | 5 min |
| **API Health** | Response != 200 | No response / timeout | 1 min |
| **PM2 Process** | Status != online | Process missing/stopped | 1 min |
| **MongoDB** | TCP timeout > 3s | Connection refused | 2 min |

