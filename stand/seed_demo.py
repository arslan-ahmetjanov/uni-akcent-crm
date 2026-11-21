"""Наполнение демонстрационного стенда EspoCRM вымышленными данными.

Скрипт работает через REST API EspoCRM (v1) и учётную запись администратора.
Данные полностью вымышленные: реальные клиенты ООО «Акцент Плюс» не используются.

Запуск:
    python seed_demo.py --url http://localhost:8080 --user admin --password ...

Повторный запуск безопасен: объекты ищутся по имени на стороне сервера и
не дублируются. Пароли новых пользователей генерируются случайно и
печатаются один раз в конце — в репозитории и в логах их нет.
"""
import argparse
import base64
import json
import secrets
import string
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

CASES = [
    ("Заказ документа: письмо Минфина о вычете по НДФЛ", "Question", "Normal",
     "Требуется текст письма Минфина России о порядке применения вычета по НДФЛ "
     "за 2025 год. В комплекте клиента документ отсутствует.", "В работе"),
    ("Сбой после обновления комплекта", "Incident", "High",
     "После еженедельного обновления система не запускается, выдается сообщение об "
     "ошибке базы. Работа пользователя остановлена.", "В работе"),
    ("Подключение модуля «Строительство»", "Question", "Normal",
     "Клиент просит подключить отраслевой модуль и рассчитать стоимость продления.",
     "Назначено"),
    ("Консультация: поиск по карточке документа", "Question", "Low",
     "Пользователь не находит документ по реквизитам, нужна консультация по поиску.",
     "Новое"),
    ("Запись на обучение: базовый курс", "Question", "Low",
     "Просят записать двух сотрудников на ближайший базовый курс в учебном центре.",
     "Назначено"),
    ("Восстановление доступа в личный кабинет", "Incident", "Normal",
     "Пользователь сменил почту и не может войти в личный кабинет.", "Закрыто"),
    ("Заказ архивного акта 2019 года", "Question", "Normal",
     "Нужен архивный документ, отсутствующий в информационном банке.", "Закрыто"),
    ("Ошибка при печати документа", "Incident", "Normal",
     "При печати документа из системы выводится пустая страница.", "В работе"),
    ("Продление подписки: расчет стоимости", "Question", "High",
     "Клиент просит расчет продления на 12 месяцев с учетом скидки за объем.",
     "Назначено"),
    ("Настройка обновления через интернет", "Question", "Normal",
     "Клиент перешел на обновление через интернет, нужна настройка расписания.",
     "Новое"),
    ("Перенос системы на новый компьютер", "Incident", "Normal",
     "Требуется перенос комплекта на новый рабочий компьютер с сохранением настроек.",
     "В работе"),
    ("Вопрос по применению статьи 54.1 НК РФ", "Question", "Normal",
     "Клиент просит подборку судебной практики по статье.", "В работе"),
    ("Ошибка входа: неверный пароль", "Incident", "Low",
     "Пользователь трижды ввел пароль, учетная запись заблокирована.", "Закрыто"),
    ("Заказ документа: постановление Правительства РБ", "Question", "Normal",
     "Нужен текст постановления регионального правительства.", "Закрыто"),
    ("Консультация по закупкам: 44-ФЗ", "Question", "Normal",
     "Вопрос по применению нормы закона о закупках в бюджетном учреждении.", "Назначено"),
    ("Обновление не устанавливается", "Incident", "High",
     "Обновление прерывается на середине, повторный запуск не помогает.", "В работе"),
    ("Запрос коммерческого предложения", "Question", "Normal",
     "Новая организация просит подобрать комплект для юриста и бухгалтера.",
     "Новое"),
    ("Настройка группового доступа", "Question", "Low",
     "Нужно открыть доступ к системе для второго сотрудника отдела.", "Назначено"),
    ("Повторное обращение: статус заявки", "Question", "Low",
     "Клиент уточняет срок выполнения ранее заказанного документа.", "Закрыто"),
    ("Сбой печати форм в комплекте «Кадровик»", "Incident", "Normal",
     "Формы печатаются без полей, настройки не сохраняются.", "В работе"),
    ("Обучение: профессиональный уровень", "Question", "Low",
     "Запрос на обучение по профессиональному уровню для главного бухгалтера.",
     "Новое"),
    ("Заказ судебной практики по банкротству", "Question", "Normal",
     "Нужна подборка практики арбитражных судов за последний год.", "В работе"),
    ("Восстановление базы после сбоя питания", "Incident", "High",
     "После отключения электроэнергии база не открывается.", "Назначено"),
    ("Консультация по региональному выпуску", "Question", "Low",
     "Вопрос о составе документов регионального выпуска.", "Закрыто"),
    ("Ошибка авторизации в онлайн-версии", "Incident", "Normal",
     "Онлайн-версия не принимает учетные данные, локальная работает.", "В работе"),
    ("Заказ документа: обзор изменений законодательства", "Question", "Low",
     "Просят ежемесячный обзор изменений для бухгалтерии.", "Новое"),
    ("Настройка резервного копирования базы", "Question", "Normal",
     "Клиент просит настроить автоматическое резервное копирование.", "Назначено"),
    ("Проблема с отображением таблиц", "Incident", "Normal",
     "Таблицы в документах отображаются некорректно после смены разрешения экрана.",
     "В работе"),
    ("Продление договора: согласование условий", "Question", "High",
     "Клиент согласовывает условия продления, нужен проект допсоглашения.",
     "Назначено"),
    ("Закрытие месяца: отчет по обращениям", "Question", "Low",
     "Запрос формы отчета по обращениям за квартал.", "Закрыто"),
]

ACCOUNTS = [
    "ООО «Северная логистика»",
    "АО «Уралстройпроект»",
    "ГБУЗ «Городская поликлиника № 5»",
    "ООО «БашАгроТрейд»",
    "МУП «Водоканал»",
    "ООО «Торговый дом Кама»",
    "АНО «Центр развития образования»",
    "ООО «Финанс-Аудит»",
]

STATUS_KEYS = {
    "Новое": "New",
    "Назначено": "Assigned",
    "В работе": "Pending",
    "Закрыто": "Closed",
}

USERS = [
    ("ivanova", "Иванова", "Анна", "Петровна", "Оператор приема"),
    ("sidorov", "Сидоров", "Максим", "Олегович", "Исполнитель"),
    ("kozlova", "Козлова", "Марина", "Сергеевна", "Исполнитель"),
    ("petrov", "Петров", "Игорь", "Викторович", "Руководитель сервисного отдела"),
]

REQUEST_TIMEOUT = 30
REQUEST_ATTEMPTS = 3
PASSWORD_ALPHABET = string.ascii_letters + string.digits


def generate_password(length=16):
    """Случайный пароль: одинаковые пароли на разных стендах недопустимы."""
    return ''.join(secrets.choice(PASSWORD_ALPHABET) for _ in range(length))


class Api:
    def __init__(self, url, user, password):
        self.url = url.rstrip('/')
        token = base64.b64encode(f'{user}:{password}'.encode()).decode()
        self.headers = {
            'Authorization': 'Basic ' + token,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        }

    def request(self, method, path, payload=None):
        data = json.dumps(payload).encode('utf-8') if payload is not None else None
        last_error = None
        for attempt in range(1, REQUEST_ATTEMPTS + 1):
            req = urllib.request.Request(self.url + path, data=data,
                                         headers=self.headers, method=method)
            try:
                # Таймаут обязателен: без него скрипт висит на мёртвом стенде.
                with urllib.request.urlopen(req, timeout=REQUEST_TIMEOUT) as resp:
                    body = resp.read().decode('utf-8')
                    return json.loads(body) if body else {}
            except urllib.error.HTTPError as e:
                detail = e.read().decode('utf-8', 'replace')
                # Повторяем только серверные ошибки: 4xx не изменится от повтора.
                if e.code >= 500 and attempt < REQUEST_ATTEMPTS:
                    last_error = f'{method} {path} -> {e.code}'
                    time.sleep(attempt)
                    continue
                raise RuntimeError(
                    f'{method} {path} -> {e.code}: {detail[:400]}') from None
            except (urllib.error.URLError, TimeoutError) as e:
                last_error = f'{method} {path} -> {e}'
                if attempt < REQUEST_ATTEMPTS:
                    time.sleep(attempt)
                    continue
                raise RuntimeError(f'нет связи со стендом: {last_error}') from None
        raise RuntimeError(last_error or 'неизвестная ошибка запроса')

    def find_by_field(self, entity, field, value):
        """Поиск на стороне сервера: клиентская выборка обрезается по maxSize."""
        query = urllib.parse.urlencode({
            'maxSize': 1,
            'select': 'id',
            'where[0][type]': 'equals',
            'where[0][attribute]': field,
            'where[0][value]': value,
        })
        res = self.request('GET', f'/api/v1/{entity}?{query}')
        items = res.get('list', [])
        return items[0]['id'] if items else None

    def create(self, entity, payload):
        return self.request('POST', f'/api/v1/{entity}', payload)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--url', default='http://localhost:8080')
    ap.add_argument('--user', default='admin')
    ap.add_argument('--password', required=True)
    args = ap.parse_args()

    api = Api(args.url, args.user, args.password)

    users = {}
    created_passwords = {}
    for login, last, first, middle, position in USERS:
        existing = api.find_by_field('User', 'userName', login)
        if existing:
            users[login] = existing
            print('пользователь есть:', login)
            continue
        password = generate_password()
        res = api.create('User', {
            'userName': login,
            'firstName': first,
            'lastName': last,
            'middleName': middle,
            'title': position,
            'password': password,
            'passwordConfirm': password,
            'type': 'regular',
            'isActive': True,
            'emailAddress': f'{login}@demo.akcentplus.ru',
        })
        users[login] = res['id']
        created_passwords[login] = password
        print('пользователь создан:', login)

    accounts = []
    for name in ACCOUNTS:
        existing = api.find_by_field('Account', 'name', name)
        if existing:
            accounts.append(existing)
            continue
        res = api.create('Account', {'name': name, 'type': 'Customer',
                                     'description': 'Демонстрационный клиент'})
        accounts.append(res['id'])
        print('клиент создан:', name)

    contacts = []
    for i, account in enumerate(accounts):
        last_name = f'Клиент {i + 1}'
        existing = api.find_by_field('Contact', 'lastName', last_name)
        if existing:
            contacts.append(existing)
            continue
        res = api.create('Contact', {
            'firstName': 'Демо',
            'lastName': last_name,
            'emailAddress': f'client{i + 1}@demo.akcentplus.ru',
            'accountId': account,
        })
        contacts.append(res['id'])

    executors = [users['sidorov'], users['kozlova'], users['ivanova']]
    created_cases = 0
    skipped_cases = 0
    for i, (name, ctype, priority, description, status) in enumerate(CASES):
        if api.find_by_field('Case', 'name', name):
            skipped_cases += 1
            continue
        api.create('Case', {
            'name': name,
            'type': ctype,
            'priority': priority,
            'description': description,
            'status': STATUS_KEYS[status],
            'accountId': accounts[i % len(accounts)],
            'contactId': contacts[i % len(contacts)],
            'assignedUserId': executors[i % len(executors)],
        })
        created_cases += 1

    print(f'обращений создано: {created_cases}, уже было: {skipped_cases}')
    if created_passwords:
        print('пароли новых пользователей (сохраните, повторно не выводятся):')
        for login, password in created_passwords.items():
            print(f'  {login}: {password}')
    print('готово')
    return 0


if __name__ == '__main__':
    sys.exit(main())
