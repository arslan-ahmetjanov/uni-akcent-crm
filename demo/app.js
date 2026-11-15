/* Демонстрационный прототип CRM обращений.
   Данные хранятся в localStorage браузера, сервер не используется. */

const STORAGE_KEY = 'ap-crm-demo-v1';

const CLIENTS = [
  'ООО «Северная логистика»',
  'АО «Уралстройпроект»',
  'ГБУЗ «Городская поликлиника № 5»',
  'ООО «БашАгроТрейд»',
  'МУП «Водоканал»',
  'ООО «Торговый дом Кама»',
  'АНО «Центр развития образования»',
  'ООО «Финанс-Аудит»',
];

const ASSIGNEES = ['Иванова А. П.', 'Сидоров М. О.', 'Козлова М. С.'];

const TYPES = ['Заказ документа', 'Консультация', 'Техническая проблема', 'Обучение',
  'Коммерческий запрос'];

const STATUSES = ['Новое', 'Назначено', 'В работе', 'Закрыто'];

const SLA_HOURS = {
  'Заказ документа': 4,
  'Консультация': 2,
  'Техническая проблема': 8,
  'Обучение': 48,
  'Коммерческий запрос': 8,
};

const SUBJECTS = [
  ['Заказ документа: письмо Минфина о вычете по НДФЛ', 'Заказ документа', 'Обычный'],
  ['Сбой после обновления комплекта', 'Техническая проблема', 'Высокий'],
  ['Подключение модуля «Строительство»', 'Коммерческий запрос', 'Обычный'],
  ['Консультация: поиск по карточке документа', 'Консультация', 'Низкий'],
  ['Запись на обучение: базовый курс', 'Обучение', 'Низкий'],
  ['Восстановление доступа в личный кабинет', 'Техническая проблема', 'Обычный'],
  ['Заказ архивного акта 2019 года', 'Заказ документа', 'Обычный'],
  ['Ошибка при печати документа', 'Техническая проблема', 'Обычный'],
  ['Продление подписки: расчёт стоимости', 'Коммерческий запрос', 'Высокий'],
  ['Настройка обновления через интернет', 'Консультация', 'Обычный'],
  ['Перенос системы на новый компьютер', 'Техническая проблема', 'Обычный'],
  ['Вопрос по применению статьи 54.1 НК РФ', 'Консультация', 'Обычный'],
  ['Ошибка входа: неверный пароль', 'Техническая проблема', 'Низкий'],
  ['Заказ документа: постановление Правительства РБ', 'Заказ документа', 'Обычный'],
  ['Консультация по закупкам: 44-ФЗ', 'Консультация', 'Обычный'],
  ['Обновление не устанавливается', 'Техническая проблема', 'Высокий'],
  ['Запрос коммерческого предложения', 'Коммерческий запрос', 'Обычный'],
  ['Настройка группового доступа', 'Консультация', 'Низкий'],
  ['Повторное обращение: статус заявки', 'Консультация', 'Низкий'],
  ['Сбой печати форм в комплекте «Кадровик»', 'Техническая проблема', 'Обычный'],
  ['Обучение: профессиональный уровень', 'Обучение', 'Низкий'],
  ['Заказ судебной практики по банкротству', 'Заказ документа', 'Обычный'],
  ['Восстановление базы после сбоя питания', 'Техническая проблема', 'Высокий'],
  ['Консультация по региональному выпуску', 'Консультация', 'Низкий'],
  ['Ошибка авторизации в онлайн-версии', 'Техническая проблема', 'Обычный'],
  ['Заказ документа: обзор изменений законодательства', 'Заказ документа', 'Низкий'],
  ['Настройка резервного копирования базы', 'Консультация', 'Обычный'],
  ['Проблема с отображением таблиц', 'Техническая проблема', 'Обычный'],
  ['Продление договора: согласование условий', 'Коммерческий запрос', 'Высокий'],
  ['Закрытие месяца: отчёт по обращениям', 'Консультация', 'Низкий'],
];

const DESCRIPTIONS = [
  'Требуется текст документа, в комплекте клиента его нет. Нужна проверка по информационному банку.',
  'После еженедельного обновления система не запускается, работа пользователя остановлена.',
  'Клиент просит подключить модуль и рассчитать стоимость продления.',
  'Пользователь не находит документ по реквизитам, нужна консультация по поиску.',
  'Просят записать двух сотрудников на ближайший курс в учебном центре.',
  'Пользователь сменил почту и не может войти в личный кабинет.',
  'Нужен архивный документ, отсутствующий в информационном банке.',
  'При печати документа выводится пустая страница.',
  'Клиент просит расчёт продления на 12 месяцев с учётом скидки за объём.',
  'Клиент перешёл на обновление через интернет, нужна настройка расписания.',
  'Требуется перенос комплекта на новый компьютер с сохранением настроек.',
  'Клиент просит подборку судебной практики по статье.',
  'Пользователь трижды ввёл пароль, учётная запись заблокирована.',
  'Нужен текст постановления регионального правительства.',
  'Вопрос по применению нормы закона о закупках в бюджетном учреждении.',
  'Обновление прерывается на середине, повторный запуск не помогает.',
  'Новая организация просит подобрать комплект для юриста и бухгалтера.',
  'Нужно открыть доступ к системе для второго сотрудника отдела.',
  'Клиент уточняет срок выполнения ранее заказанного документа.',
  'Формы печатаются без полей, настройки не сохраняются.',
  'Запрос на обучение по профессиональному уровню для главного бухгалтера.',
  'Нужна подборка практики арбитражных судов за последний год.',
  'После отключения электроэнергии база не открывается.',
  'Вопрос о составе документов регионального выпуска.',
  'Онлайн-версия не принимает учётные данные, локальная работает.',
  'Просят ежемесячный обзор изменений для бухгалтерии.',
  'Клиент просит настроить автоматическое резервное копирование.',
  'Таблицы в документах отображаются некорректно после смены разрешения экрана.',
  'Клиент согласовывает условия продления, нужен проект допсоглашения.',
  'Запрос формы отчёта по обращениям за квартал.',
];

function seed() {
  const now = Date.now();
  const HOUR = 3600 * 1000;
  return SUBJECTS.map(([subject, type, priority], i) => {
    const created = now - (i * 7 + 3) * HOUR;
    const status = STATUSES[i % 4];
    const open = status !== 'Закрыто';
    // каждый пятый открытый — просрочен, остальные со сроком в будущем
    const due = open
      ? (i % 5 === 0 ? now - 2 * HOUR : now + SLA_HOURS[type] * (1 + (i % 3)) * HOUR)
      : now - 2 * HOUR;
    return {
      id: i + 1,
      subject,
      type,
      priority,
      status,
      client: CLIENTS[i % CLIENTS.length],
      contact: 'Демо Клиент ' + ((i % 8) + 1),
      assignee: ASSIGNEES[i % ASSIGNEES.length],
      description: DESCRIPTIONS[i % DESCRIPTIONS.length],
      created,
      due,
      history: [{ at: created, text: 'Обращение зарегистрировано' }],
    };
  });
}

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    /* игнорируем повреждённые данные */
  }
  return seed();
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    /* приватный режим — просто не сохраняем */
  }
}

const $ = (id) => document.getElementById(id);

function statusClass(status) {
  return { 'Новое': 's-new', 'Назначено': 's-assigned', 'В работе': 's-work',
    'Закрыто': 's-closed' }[status] || '';
}

function priorityClass(priority) {
  return { 'Высокий': 'b-high', 'Обычный': 'b-normal', 'Низкий': 'b-low' }[priority] || '';
}

function fmtDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function isOverdue(item) {
  return item.status !== 'Закрыто' && Date.now() > item.due;
}

function currentRole() {
  return $('role').value;
}

function visibleItems() {
  const q = $('search').value.trim().toLowerCase();
  const st = $('fstatus').value;
  const pr = $('fpriority').value;
  const as = $('fassignee').value;
  const role = currentRole();

  return state.filter((item) => {
    if (st && item.status !== st) return false;
    if (pr && item.priority !== pr) return false;
    if (as && item.assignee !== as) return false;
    if (role === 'executor' && item.assignee !== as && as === '') {
      // исполнитель видит только свои, если не выбран конкретный
      return false;
    }
    if (q) {
      const hay = `${item.id} ${item.subject} ${item.client} ${item.description}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function renderStats() {
  const open = state.filter((i) => i.status !== 'Закрыто').length;
  const overdue = state.filter(isOverdue).length;
  const closed = state.filter((i) => i.status === 'Закрыто').length;
  const high = state.filter((i) => i.priority === 'Высокий' && i.status !== 'Закрыто').length;

  $('stats').innerHTML = `
    <div class="stat"><div class="stat-value">${state.length}</div>
      <div class="stat-label">всего обращений</div></div>
    <div class="stat"><div class="stat-value">${open}</div>
      <div class="stat-label">в работе и новых</div></div>
    <div class="stat alert"><div class="stat-value">${overdue}</div>
      <div class="stat-label">просрочено</div></div>
    <div class="stat"><div class="stat-value">${closed}</div>
      <div class="stat-label">закрыто · высокий приоритет: ${high}</div></div>`;
}

function renderAssignees() {
  const sel = $('fassignee');
  const value = sel.value;
  sel.innerHTML = '<option value="">Все исполнители</option>' +
    ASSIGNEES.map((a) => `<option value="${a}">${a}</option>`).join('');
  sel.value = value;
}

function renderTable() {
  const items = visibleItems();
  const tbody = document.querySelector('#table tbody');
  tbody.innerHTML = items.map((item) => `
    <tr data-id="${item.id}">
      <td class="num">${item.id}</td>
      <td>${item.subject}</td>
      <td>${item.client}</td>
      <td>${item.type}</td>
      <td><span class="badge ${priorityClass(item.priority)}">${item.priority}</span></td>
      <td><span class="badge ${statusClass(item.status)}">${item.status}</span></td>
      <td>${item.assignee}</td>
      <td>${fmtDate(item.created)}</td>
    </tr>`).join('');

  $('empty').hidden = items.length > 0;
  $('counter').textContent = `показано ${items.length} из ${state.length}`;

  tbody.querySelectorAll('tr').forEach((row) => {
    row.addEventListener('click', () => openCard(Number(row.dataset.id)));
  });
}

function openCard(id) {
  const item = state.find((i) => i.id === id);
  if (!item) return;

  $('m-title').textContent = `Обращение № ${item.id}`;
  $('m-sub').textContent = item.subject;
  $('m-client').textContent = item.client;
  $('m-contact').textContent = item.contact;
  $('m-type').textContent = item.type;
  $('m-priority').innerHTML = `<span class="badge ${priorityClass(item.priority)}">${item.priority}</span>`;
  $('m-status').innerHTML = `<span class="badge ${statusClass(item.status)}">${item.status}</span>`;
  $('m-assignee').textContent = item.assignee;
  $('m-due').textContent = `${fmtDate(item.due)}${isOverdue(item) ? ' · просрочено' : ''}`;
  $('m-created').textContent = fmtDate(item.created);
  $('m-desc').textContent = item.description;

  const role = currentRole();
  const actions = [];
  if (role !== 'executor' || true) {
    if (item.status !== 'Закрыто') {
      STATUSES.filter((s) => s !== item.status).forEach((s) => {
        actions.push(`<button data-status="${s}">Перевести в «${s}»</button>`);
      });
    } else {
      actions.push('<button data-reopen="1">Переоткрыть</button>');
    }
  }
  $('m-actions').innerHTML = actions.join('');

  $('m-actions').querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (btn.dataset.reopen) {
        setStatus(item, 'Назначено');
      } else {
        setStatus(item, btn.dataset.status);
      }
      openCard(item.id);
      renderAll();
    });
  });

  $('m-history').innerHTML = item.history
    .slice()
    .reverse()
    .map((h) => `<li>${fmtDate(h.at)} — ${h.text}</li>`)
    .join('');

  $('modal').hidden = false;
}

function setStatus(item, status) {
  item.status = status;
  item.history.push({ at: Date.now(), text: `Статус изменён на «${status}»` });
  save();
}

function renderAll() {
  renderStats();
  renderTable();
}

$('search').addEventListener('input', renderTable);
$('fstatus').addEventListener('change', renderTable);
$('fpriority').addEventListener('change', renderTable);
$('fassignee').addEventListener('change', renderTable);
$('role').addEventListener('change', () => {
  renderAssignees();
  renderAll();
});

$('reset').addEventListener('click', () => {
  localStorage.removeItem(STORAGE_KEY);
  state = seed();
  renderAll();
});

$('m-close').addEventListener('click', () => { $('modal').hidden = true; });
$('modal').addEventListener('click', (e) => {
  if (e.target.id === 'modal') $('modal').hidden = true;
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') $('modal').hidden = true;
});

renderAssignees();
renderAll();
