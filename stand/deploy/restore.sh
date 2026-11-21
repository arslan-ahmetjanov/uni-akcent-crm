#!/usr/bin/env bash
# Восстановление демо-базы из дампа в чистую установку.
# Запуск из каталога deploy после docker compose up -d: ./restore.sh
set -euo pipefail
cd "$(dirname "$0")/.."

dump="${1:-dump/espocrm-demo.sql.gz}"
if [ ! -f "$dump" ]; then
  echo "не найден дамп: $dump" >&2
  exit 1
fi

ping_db() {
  # пароль root читается из окружения контейнера, а не из окружения хоста
  docker compose exec -T mysql sh -c \
    'mysqladmin ping -h localhost -uroot -p"$MYSQL_ROOT_PASSWORD" --silent' 2>/dev/null
}

echo "жду готовности базы..."
ready=""
for i in $(seq 1 60); do
  if ping_db; then
    ready="yes"
    break
  fi
  sleep 2
done
if [ -z "$ready" ]; then
  echo "база не поднялась за отведённое время, проверьте docker compose logs mysql" >&2
  exit 1
fi

echo "заливаю $dump"
gunzip -c "$dump" | docker compose exec -T mysql sh -c \
  'exec mysql -uespocrm -p"$MYSQL_PASSWORD" espocrm'

echo "перезапускаю приложение, чтобы сбросить кеш метаданных"
docker compose restart espocrm espocrm-daemon espocrm-cron >/dev/null

echo "готово: демо-данные восстановлены"
echo "учётные записи пришли из дампа, поэтому пароль администратора из .env"
echo "действует только на чистой установке без restore (см. README)"
