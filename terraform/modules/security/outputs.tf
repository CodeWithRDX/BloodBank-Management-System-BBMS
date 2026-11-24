output "security_group_id" {
  description = "ID of the BBMS Security Group"
  value       = aws_security_group.bbms_sg.id
}

