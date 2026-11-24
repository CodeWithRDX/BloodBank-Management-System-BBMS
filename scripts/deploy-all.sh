#!/usr/bin/env bash
# ==============================================================================
# Script: deploy-all.sh
# Purpose: Master End-to-End BBMS Provisioning, Deployment & Monitoring Orchestration
# Workflow:
#   1. Terraform Init & Validate
#   2. Terraform Apply (Infrastructure Provisioning)
#   3. Sync Inventory (Terraform IP -> Ansible hosts.ini)
#   4. Wait for SSH availability
#   5. Ansible Site Playbook (Base, Node, Mongo, Nginx, BBMS App)
#   6. Ansible Nagios Playbook (Nagios 4 Core, Objects, Custom Plugins)
#   7. Live Health Endpoint Verification
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
TERRAFORM_DIR="$ROOT_DIR/terraform"
ANSIBLE_DIR="$ROOT_DIR/ansible"

echo "=========================================================================="
echo " 🩸 BBMS End-to-End DevOps Automation Deployment Pipeline"
echo "=========================================================================="

# Check Prerequisites
echo "[Step 1/7] Checking local prerequisite tools..."
for cmd in terraform ansible-playbook ssh curl; do
    if ! command -v "$cmd" >/dev/null 2>&1; then
        echo "⚠️ Missing CLI tool: $cmd"
        if [ "$cmd" = "ansible-playbook" ]; then
            echo "   Please install Ansible: pip install ansible or brew install ansible"
        elif [ "$cmd" = "terraform" ]; then
            echo "   Please install Terraform: brew install terraform"
        fi
        exit 1
    fi
done

# Step 2: Validate Terraform
echo "[Step 2/7] Initializing and validating Terraform..."
cd "$TERRAFORM_DIR"
terraform init -backend=false
terraform validate

# Step 3: Terraform Plan & Apply Confirmation
echo "[Step 3/7] Provisioning AWS Cloud Infrastructure..."
if [ ! -f "terraform.tfvars" ]; then
    echo "❌ Error: terraform/terraform.tfvars not found!"
    echo "   Please copy terraform.tfvars.example to terraform.tfvars and specify your AWS key_name."
    exit 1
fi

terraform plan -out=tfplan
echo "Infrastructure plan generated. Applying changes..."
terraform apply -auto-approve tfplan

# Step 4: Sync Inventory
echo "[Step 4/7] Updating Ansible Inventory from Terraform Output..."
cd "$ROOT_DIR"
bash "$SCRIPT_DIR/sync-inventory.sh"

PUBLIC_IP=$(cd "$TERRAFORM_DIR" && terraform output -raw ec2_public_ip)
echo "Target Host Public IP: $PUBLIC_IP"

# Step 5: Wait for SSH Reachability
echo "[Step 5/7] Waiting for SSH daemon to become reachable on ${PUBLIC_IP}:22..."
MAX_ATTEMPTS=30
ATTEMPT=1
while [ $ATTEMPT -le $MAX_ATTEMPTS ]; do
    if nc -z -w 3 "$PUBLIC_IP" 22 >/dev/null 2>&1; then
        echo "✅ SSH port 22 is open on $PUBLIC_IP!"
        break
    fi
    echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS: Waiting for SSH... (sleeping 5s)"
    sleep 5
    ATTEMPT=$((ATTEMPT + 1))
done

# Sleep an extra 10 seconds to allow cloud-init to finish
sleep 10

# Step 6: Execute Ansible Configuration Management & Server Bootstrap
echo "[Step 6/7] Running Ansible Configuration Management on $PUBLIC_IP..."
cd "$ANSIBLE_DIR"
ansible-playbook -i inventory/hosts.ini playbooks/site.yml
ansible-playbook -i inventory/hosts.ini playbooks/install-nagios.yml

echo "💡 Note: Server environment and initial services are configured by Ansible."
echo "   Subsequent application code changes are deployed automatically via GitHub Actions CI/CD."


# Step 7: Live Health Check Verifications
echo "[Step 7/7] Verifying live application and monitoring endpoints..."
sleep 5

echo "Checking Frontend SPA..."
curl -Is "http://${PUBLIC_IP}/" | head -n 1 || true

echo "Checking Backend API Health (/api/health)..."
curl -s "http://${PUBLIC_IP}/api/health" || true
echo ""

echo "Checking Nginx Health (/nginx-health)..."
curl -s "http://${PUBLIC_IP}/nginx-health" || true

echo "=========================================================================="
echo " 🎉 BBMS Deployment & Monitoring Successfully Orchestrated!"
echo "=========================================================================="
echo " Application URL    : http://${PUBLIC_IP}"
echo " API Health Check   : http://${PUBLIC_IP}/api/health"
echo " Nagios Dashboard   : http://${PUBLIC_IP}:8080/nagios"
echo " Nagios Credentials : User: nagiosadmin | Pass: AdminBBMS@2026 (or custom vault)"
echo "=========================================================================="

