# ──────────────────────────────────────────────────────────────────────────────
# EC2 Module: Ubuntu Server Host with Elastic IP and EBS Storage
# ──────────────────────────────────────────────────────────────────────────────

# Automatically locate latest Ubuntu 22.04 LTS AMI if not explicitly specified
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

resource "aws_instance" "bbms_server" {
  ami                         = var.ami_id != "" ? var.ami_id : data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [var.security_group_id]
  key_name                    = var.key_name
  associate_public_ip_address = true

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    iops                  = 3000
    throughput            = 125
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name        = "${var.project_name}-root-volume-${var.environment}"
      Project     = var.project_name
      Environment = var.environment
    }
  }

  user_data = <<-EOF
              #!/bin/bash
              # Minimal bootstrap script for basic system readiness
              echo "BBMS Server provisioned by Terraform" > /etc/motd
              apt-get update -y
              apt-get install -y python3 python3-apt curl git
              EOF

  tags = {
    Name        = "${var.project_name}-server-${var.environment}"
    Project     = var.project_name
    Environment = var.environment
    Role        = "ApplicationHost"
  }
}

# Attach an Elastic IP to preserve a static public IP across reboots and maintenance
resource "aws_eip" "bbms_eip" {
  instance = aws_instance.bbms_server.id
  domain   = "vpc"

  tags = {
    Name        = "${var.project_name}-eip-${var.environment}"
    Project     = var.project_name
    Environment = var.environment
  }
}

