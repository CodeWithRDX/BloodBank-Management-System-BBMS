variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID where the security group will be created"
  type        = string
}

variable "allowed_ssh_cidrs" {
  description = "List of allowed CIDRs for SSH access"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

variable "allowed_nagios_cidrs" {
  description = "List of allowed CIDRs for Nagios web dashboard"
  type        = list(string)
  default     = ["0.0.0.0/0"]
}

