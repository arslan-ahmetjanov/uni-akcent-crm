#!/usr/bin/env bash
# Собирает архив комплекта из каталога stand/ (без .env, локальных копий и самого архива).
# Запуск: bash stand/pack.sh [путь-к-архиву]
set -euo pipefail
cd "$(dirname "$0")"

out="${1:-../accent-crm-stand.zip}"
rm -f "$out"
zip -qr "$out" . -x '.env' 'backup/*' '*.zip' 'pack.sh'

echo "готово: $out"
