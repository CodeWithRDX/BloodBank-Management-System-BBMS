# ──────────────────────────────────────────────────────────────────────────────
# Terraform Remote State Configuration
# ──────────────────────────────────────────────────────────────────────────────
# By default, Terraform uses local state (`terraform.tfstate`).
# For production and multi-engineer teams, uncomment the S3 backend block below.
#
# Prerequisites for remote state:
# 1. Create an S3 bucket (e.g. `bbms-terraform-remote-state-prod`) with:
#    - Versioning enabled
#    - Server-side encryption enabled (AES256 or KMS)
#    - Public access blocked
# 2. Create a DynamoDB table (e.g. `bbms-terraform-locks`) with:
#    - Partition key: `LockID` (String)
#
# Usage:
# Run: `terraform init -migrate-state` to migrate from local to S3.
# ──────────────────────────────────────────────────────────────────────────────

# terraform {
#   backend "s3" {
#     bucket         = "bbms-terraform-remote-state-prod"
#     key            = "bbms/production/terraform.tfstate"
#     region         = "ap-south-1"
#     dynamodb_table = "bbms-terraform-locks"

#     encrypt        = true
#   }
# }

