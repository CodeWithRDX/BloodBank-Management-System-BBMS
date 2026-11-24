variable "aws_region" {
  description = "AWS region for provisioning resources"
  type        = string
  default     = "ap-south-1"
}


variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "bbms"
}

variable "environment" {
  description = "Deployment environment (e.g., production, staging, dev)"
  type        = string
  default     = "production"
}

variable "vpc_cidr" {
  description = "CIDR block for the custom VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  type        = string
  default     = "10.0.1.0/24"
}

variable "availability_zone" {
  description = "Availability zone for the subnet and EC2 instance"
  type        = string
  default     = "ap-south-1a"
}


variable "instance_type" {
  description = "EC2 instance type for BBMS host (e.g. t3.medium provides 2 vCPU, 4GB RAM)"
  type        = string
  default     = "t3.medium"
}

variable "ami_id" {
  description = "Optional specific AMI ID. If empty, the latest Ubuntu 22.04 LTS AMI is used"
  type        = string
  default     = ""
}

variable "key_name" {
  description = "Name of an existing AWS SSH Key Pair used for EC2 access"
  type        = string
}

variable "allowed_ssh_cidrs" {
  description = "List of allowed IPv4 CIDR blocks for SSH access (Restrict to trusted admin IPs in production)"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "allowed_nagios_cidrs" {
  description = "List of allowed IPv4 CIDR blocks for Nagios 4 Web UI access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "root_volume_size" {
  description = "Root EBS volume size in GB"
  type        = number
  default     = 30
}

