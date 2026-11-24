# ──────────────────────────────────────────────────────────────────────────────
# Master Root Terraform Configuration: BBMS Infrastructure
# Orchestrates: Networking -> Security -> EC2 Instance
# ──────────────────────────────────────────────────────────────────────────────

module "networking" {
  source             = "./modules/networking"
  project_name       = var.project_name
  environment        = var.environment
  vpc_cidr           = var.vpc_cidr
  public_subnet_cidr = var.public_subnet_cidr
  availability_zone  = var.availability_zone
}

module "security" {
  source               = "./modules/security"
  project_name         = var.project_name
  environment          = var.environment
  vpc_id               = module.networking.vpc_id
  allowed_ssh_cidrs    = var.allowed_ssh_cidrs
  allowed_nagios_cidrs = var.allowed_nagios_cidrs
}

module "ec2" {
  source            = "./modules/ec2"
  project_name      = var.project_name
  environment       = var.environment
  subnet_id         = module.networking.public_subnet_id
  security_group_id = module.security.security_group_id
  instance_type     = var.instance_type
  ami_id            = var.ami_id
  key_name          = var.key_name
  root_volume_size  = var.root_volume_size
}

