# Cake Bakery - Deployment Guide

## Проект успешно собран и готов к деплою!

### Что сделано:
- ✅ Frontend собран (React + Vite) - размер: ~3MB
- ✅ Backend подготовлен (Express.js + MongoDB)
- ✅ Frontend задеплоен на GitHub Pages
- ✅ Созданы Docker файлы для контейнеризации
- ✅ Подготовлен Procfile для Heroku

### Способы деплоя:

#### 1. GitHub Pages (Frontend уже задеплоен)
Frontend доступен по адресу из package.json: https://zarinaerkinova.github.io/zarinka-final

#### 2. Docker деплой (полное приложение)
```bash
# Собрать и запустить с Docker Compose
npm run deploy

# Или вручную:
docker-compose up --build -d
```

#### 3. Heroku деплой
```bash
# Установить Heroku CLI, затем:
heroku create your-app-name
git push heroku main
```

#### 4. Vercel/Netlify (только frontend)
- Подключить репозиторий к Vercel/Netlify
- Указать build command: `cd frontend && npm run build`
- Указать output directory: `frontend/dist`

### Переменные окружения для production:
- `NODE_ENV=production`
- `PORT=5000` (или порт, предоставляемый платформой)
- MongoDB connection string
- JWT secret

### Структура проекта:
- `/backend` - Express.js API
- `/frontend` - React приложение (собрано в `/frontend/dist`)
- `/uploads` - загруженные файлы
- `Dockerfile` - для контейнеризации
- `docker-compose.yml` - для локального деплоя
- `Procfile` - для Heroku

Frontend уже успешно задеплоен на GitHub Pages!
Backend готов для деплоя на любую облачную платформу.