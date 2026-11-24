output "instance_id" {
  description = "ID of the EC2 instance"
  value       = aws_instance.bbms_server.id
}

output "public_ip" {
  description = "Elastic Public IP address of the EC2 instance"
  value       = aws_eip.bbms_eip.public_ip
}

output "public_dns" {
  description = "Public DNS of the Elastic IP"
  value       = aws_eip.bbms_eip.public_dns
}

