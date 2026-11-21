#!/usr/bin/env bash
# Резервная копия стенда: дамп базы и каталог данных EspoCRM.
# Запуск из каталога deploy: ./backup.sh
# Внимание: копия каталога данных содержит config-internal.php (пароль БД и
# cryptKey). Хранить такие копии только локально или в защищённом хранилище.
set -euo pipefail
cd "$(dirname "$0")/.."

stamp=$(date +%Y%m%d-%H%M)
mkdir -p backup

# сессии и журнал входов в резервную копию не попадают
docker compose exec -T mysql sh -c \
  'exec mysqldump -uespocrm -p"$MYSQL_PASSWORD" --no-tablespaces --single-transaction --quick \
     --ignore-table=espocrm.auth_token --ignore-table=espocrm.auth_log_record espocrm' \
  | gzip > "backup/db-$stamp.sql.gz"

data_volume=$(docker volume ls -q --filter name=espocrm-data | head -n 1)
if [ -z "$data_volume" ]; then
  echo "не найден том espocrm-data: стенд не запущен?" >&2
  exit 1
fi

docker run --rm \
  -v "$data_volume:/data:ro" \
  -v "$PWD/backup:/backup" \
  alpine tar czf "/backup/data-$stamp.tar.gz" -C /data .

find backup -name '*.gz' -mtime +14 -delete
echo "backup: backup/db-$stamp.sql.gz, backup/data-$stamp.tar.gz"
