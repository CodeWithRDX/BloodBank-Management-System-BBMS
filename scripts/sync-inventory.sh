#!/usr/bin/env bash
# ==============================================================================
# Script: sync-inventory.sh
# Purpose: Extract Terraform outputs and automatically update Ansible hosts.ini
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/terraform"
ANSIBLE_DIR="$ROOT_DIR/ansible"
INVENTORY_FILE="$ANSIBLE_DIR/inventory/hosts.ini"

echo "🔄 Synchronizing Terraform outputs with Ansible inventory..."

if [ ! -d "$TERRAFORM_DIR/.terraform" ]; then
    echo "❌ Error: Terraform is not initialized. Run 'terraform init' in $TERRAFORM_DIR"
    exit 1
fi

# Fetch Public IP from Terraform outputs
PUBLIC_IP=$(cd "$TERRAFORM_DIR" && terraform output -raw ec2_public_ip 2>/dev/null || true)

if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" = "None" ]; then
    echo "⚠️ Warning: Could not retrieve ec2_public_ip from Terraform. Ensure 'terraform apply' has run."
    exit 1
fi

# Attempt to locate SSH key name from tfvars or use default
KEY_NAME="bbms-keypair"
if [ -f "$TERRAFORM_DIR/terraform.tfvars" ]; then
    KEY_EXTRACTED=$(grep '^key_name' "$TERRAFORM_DIR/terraform.tfvars" | cut -d'=' -f2 | tr -d ' "' | tr -d "'" || true)
    if [ -n "$KEY_EXTRACTED" ]; then
        KEY_NAME="$KEY_EXTRACTED"
    fi
fi

KEY_PATH="~/.ssh/${KEY_NAME}.pem"

# Generate new Ansible inventory file
cat <<EOF > "$INVENTORY_FILE"
# ──────────────────────────────────────────────────────────────────────────────
# Automated Ansible Inventory for BBMS
# Generated automatically by scripts/sync-inventory.sh
# Generated on: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# ──────────────────────────────────────────────────────────────────────────────

[bbms_servers]
bbms-node-01 ansible_host=${PUBLIC_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${KEY_PATH}

[monitoring_servers]
bbms-node-01 ansible_host=${PUBLIC_IP} ansible_user=ubuntu ansible_ssh_private_key_file=${KEY_PATH}

[all:children]
bbms_servers
monitoring_servers
EOF

echo "✅ Successfully updated Ansible inventory ($INVENTORY_FILE) with IP: $PUBLIC_IP"

