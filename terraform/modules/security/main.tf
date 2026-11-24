# ──────────────────────────────────────────────────────────────────────────────
# Security Module: EC2 Security Groups with Least Privilege Access
# ──────────────────────────────────────────────────────────────────────────────
# Ports Allowed:
#   - 22   : SSH (restricted to admin CIDR)
#   - 80   : HTTP (public web access to Nginx)
#   - 443  : HTTPS (SSL/TLS access to Nginx)
#   - 8080 : Nagios 4 Monitoring Web Dashboard (restricted to admin CIDR)
#
# Ports Blocked from Public:
#   - 27017: MongoDB is strictly kept internal/local to the EC2 host.
#   - 5000 : Node.js API is proxied behind Nginx locally (127.0.0.1:5000).
# ──────────────────────────────────────────────────────────────────────────────

resource "aws_security_group" "bbms_sg" {
  name        = "${var.project_name}-sg-${var.environment}"
  description = "Security group for BBMS EC2 instance and Nagios monitoring"
  vpc_id      = var.vpc_id

  # Inbound Rule: SSH (Port 22)
  ingress {
    description = "Secure SSH access"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.allowed_ssh_cidrs
  }

  # Inbound Rule: HTTP (Port 80)
  ingress {
    description = "Public HTTP web traffic to Nginx reverse proxy"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Inbound Rule: HTTPS (Port 443)
  ingress {
    description = "Secure HTTPS web traffic to Nginx"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Inbound Rule: Nagios 4 Dashboard (Port 8080)
  ingress {
    description = "Nagios 4 web monitoring dashboard access"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = var.allowed_nagios_cidrs
  }

  # Outbound Rule: Unrestricted egress for package updates, npm builds, email SMTP
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name        = "${var.project_name}-sg-${var.environment}"
    Project     = var.project_name
    Environment = var.environment
  }
}

