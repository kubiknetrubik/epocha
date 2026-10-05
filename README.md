# Словари архаизмов (ЛР-3)

## Запуск

```bash
npm i minio multer class-validator class-transformer
npm i -D @types/multer
npm run start:dev
```

`.env`:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=...
DB_PASSWORD=...
DB_DATABASE=...

MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=...
MINIO_SECRET_KEY=...
MINIO_BUCKET=media
MINIO_USE_SSL=false
```

## Текущий пользователь

Пользователь зафиксирован константой в функции-singleton `getCurrentUser()` (`src/common/current-user.ts`, id = 1). Она используется во всех методах, где нужен создатель.

## Таблицы БД

### users

| Поле | Тип | Описание |
|---|---|---|
| id | serial, PK | идентификатор |
| username | varchar(20), NOT NULL | логин |
| password | varchar(255), NOT NULL | пароль (строкой) |

### archaism_dicts

| Поле | Тип | Описание |
|---|---|---|
| id | serial, PK | идентификатор |
| title | varchar(50), NOT NULL | название |
| description | text, NOT NULL | описание (до публикации пустая строка) |
| imageUrl | varchar(255) | имя файла картинки в MinIO |
| videoUrl | varchar(255) | имя файла видео в MinIO |
| startDate | date, NULL | нижняя граница периода |
| endDate | date, NULL | верхняя граница периода |
| status | varchar(20), NOT NULL, default `draft` | `draft` / `published` / `deleted` |
| createdAt | timestamp | дата создания (вычисляется БД) |
| publishedAt | timestamp, NULL | дата публикации (вычисляется сервером) |
| userId | int, FK → users.id (RESTRICT) | создатель |

### dict_likes

| Поле | Тип | Описание |
|---|---|---|
| id | serial, PK | идентификатор |
| userId | int, FK → users.id (RESTRICT) | кто поставил лайк |
| dictId | int, FK → archaism_dicts.id (RESTRICT) | кому |


## HTTP-методы

### Домен «Словари» — `/api/dicts`

| Метод | URL | Тело / параметры | Ответ |
|---|---|---|---|
| GET | `/api/dicts` | `?startDate=ГГГГ-ММ-ДД` (необязательно, нижняя граница: `startDate >= значение`) | `200` массив `{id, title, imageUrl, startDate, endDate, likesCount, isMine}`; `isMine` = 1, если создатель — текущий пользователь, иначе 0 |
| GET | `/api/dicts/feed` | `?id=5` и `?next=true` (оба необязательны) | `200` карточка ленты: `{id, title, description, imageUrl, videoUrl, startDate, endDate, status, publishedAt, likesCount, liked, isMine, nextId}`. Без параметров — первая; `?id=5` — карточка 5; `?id=5&next=true` — следующая за ней (лента по кругу); `404`, если лента пуста или `id` нет среди опубликованных |
| GET | `/api/dicts/draft` | — | `200` черновик текущего пользователя; `404`, если его нет |
| POST | `/api/dicts` | `multipart/form-data`: `title` (≤ 50), файлы `image` (jpeg/png/webp/gif) и `video` (mp4/webm, ≤ 50 МБ) | `201` карточка черновика. Файлы кладутся в MinIO под латинскими именами `img-<uuid>.jpg`, `vid-<uuid>.mp4`, имена пишутся в БД. Если черновик уже есть, обновляются он и заменяемые файлы. Для нового черновика оба файла обязательны |
| PUT | `/api/dicts/:id/publish` | JSON: `title` (обязательно), `description`, `startDate`, `endDate` (необязательно) | `200` карточка. Переводит `draft → published`; `409`, если не черновик; `403`, если словарь чужой |
| DELETE | `/api/dicts/:id` | — | `200 {id, message}`. Soft delete (`status = deleted`), только свой словарь; `403` для чужого, `404` для удалённого |
| POST | `/api/dicts/:id/like` | JSON: `{ "like": 1 }` поставить, `{ "like": 0 }` снять | `200 {dictId, liked, likesCount}`. Повтор безопасен (дубликаты не создаются); `404`, если словарь не опубликован |

### Домен «Пользователь» — `/api/users`

| Метод | URL | Тело | Ответ |
|---|---|---|---|
| POST | `/api/users/register` | JSON: `username` (3–20), `password` (≥ 4) | `201 {id, username}`; `409`, если логин занят |
| POST | `/api/users/login` | — | `200` заглушка |
| POST | `/api/users/logout` | — | `200` заглушка |

Ошибки валидации — `400` с массивом сообщений.
