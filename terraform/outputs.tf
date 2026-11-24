output "ec2_instance_id" {
  description = "ID of the provisioned EC2 instance"
  value       = module.ec2.instance_id
}

output "ec2_public_ip" {
  description = "Elastic Public IP address of the BBMS EC2 instance"
  value       = module.ec2.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS name of the BBMS EC2 instance"
  value       = module.ec2.public_dns
}

output "ssh_connection_command" {
  description = "Command to connect to the EC2 instance via SSH"
  value       = "ssh -i ~/.ssh/${var.key_name}.pem ubuntu@${module.ec2.public_ip}"
}

output "application_url" {
  description = "Web address for BBMS application"
  value       = "http://${module.ec2.public_ip}"
}

output "nagios_dashboard_url" {
  description = "Web address for Nagios 4 monitoring dashboard"
  value       = "http://${module.ec2.public_ip}:8080/nagios"
}

output "ansible_inventory_entry" {
  description = "Pre-formatted Ansible inventory line to paste into inventory/hosts.ini"
  value       = "bbms-server ansible_host=${module.ec2.public_ip} ansible_user=ubuntu ansible_ssh_private_key_file=~/.ssh/${var.key_name}.pem"
}

