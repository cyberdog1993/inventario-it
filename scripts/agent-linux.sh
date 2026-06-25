#!/bin/bash
# ============================================================
# IT Inventory Agent - Linux / macOS (bash)
# Reporta automáticamente la información del equipo al servidor
#
# Uso:
#   1. Edita las variables API_KEY y SERVER_URL
#   2. chmod +x agent-linux.sh
#   3. Ejecuta manualmente o agrega a cron:
#      crontab -e  →  0 * * * * /opt/scripts/agent-linux.sh
# ============================================================

API_KEY="inv_75a38dd87e1e496f9a381c0e4a5dd89d"
SERVER_URL="https://inventario-it-self.vercel.app/api/report"

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
  OS_NAME="macOS"
  OS_VERSION=$(sw_vers -productVersion)
  HOSTNAME=$(hostname)
  BRAND=$(system_profiler SPHardwareDataType | awk '/Model Name/{print $NF}')
  MODEL=$(system_profiler SPHardwareDataType | grep "Model Identifier" | awk '{print $NF}')
  SERIAL=$(system_profiler SPHardwareDataType | awk '/Serial Number/{print $NF}')
  CPU=$(sysctl -n machdep.cpu.brand_string 2>/dev/null || echo "")
  RAM_BYTES=$(sysctl -n hw.memsize)
  RAM_GB=$(echo "$RAM_BYTES / 1024 / 1024 / 1024" | bc)
  STORAGE_GB=$(df -k / | awk 'NR==2 {printf "%d", $2/1024/1024}')
  IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "")
  MAC=$(ifconfig en0 2>/dev/null | awk '/ether/{print $2}' || echo "")
  DEVICE_TYPE="desktop"
else
  OS_NAME="Linux"
  OS_VERSION=$(uname -r)
  HOSTNAME=$(hostname)
  BRAND=$(cat /sys/class/dmi/id/sys_vendor 2>/dev/null || echo "")
  MODEL=$(cat /sys/class/dmi/id/product_name 2>/dev/null || echo "")
  SERIAL=$(cat /sys/class/dmi/id/product_serial 2>/dev/null || echo "")
  CPU=$(grep "model name" /proc/cpuinfo | head -1 | cut -d: -f2 | xargs)
  RAM_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
  RAM_GB=$(echo "$RAM_KB / 1024 / 1024" | bc)
  STORAGE_GB=$(df -k / | awk 'NR==2 {printf "%d", $2/1024/1024}')
  IP=$(hostname -I | awk '{print $1}')
  MAC=$(ip link show | awk '/ether/{print $2}' | head -1)
  DEVICE_TYPE="desktop"
fi

JSON=$(cat <<EOF
{
  "api_key":    "$API_KEY",
  "hostname":   "$HOSTNAME",
  "type":       "$DEVICE_TYPE",
  "serial":     "$SERIAL",
  "brand":      "$BRAND",
  "model":      "$MODEL",
  "ip_address": "$IP",
  "mac_address":"$MAC",
  "os":         "$OS_NAME",
  "os_version": "$OS_VERSION",
  "cpu":        "$CPU",
  "ram_gb":     $RAM_GB,
  "storage_gb": $STORAGE_GB
}
EOF
)

RESPONSE=$(curl -s -o /tmp/inv_response.json -w "%{http_code}" \
  -X POST "$SERVER_URL" \
  -H "Content-Type: application/json" \
  -d "$JSON")

if [ "$RESPONSE" -eq 200 ] || [ "$RESPONSE" -eq 201 ]; then
  echo "[OK] Reporte enviado (HTTP $RESPONSE)"
  cat /tmp/inv_response.json
else
  echo "[ERROR] HTTP $RESPONSE"
  cat /tmp/inv_response.json
  exit 1
fi
