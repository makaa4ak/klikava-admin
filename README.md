# Klikava Admin Panel

Адмін-панель та seller-кабінет для маркетплейсу Klikava.

## Стек

- **React** — бібліотека для побудови UI
- **Vite** — інструмент збірки
- **Ant Design** — UI-компоненти
- **React Router** — маршрутизація
- **Axios** — HTTP-запити до API

## Запуск проекту

```bash
npm install
npm run dev
```

## Збірка для продакшену

```bash
npm run build
```

## Структура

- `/src/pages/SellerPanel` — seller-кабінет (продукти, замовлення, статистика, профіль)
- `/src/pages/Users`, `/Admins`, `/Products`, `/Categories` — адмін-панель
- `/src/layouts` — layout-и з сайдбарами
- `/src/api/axios.js` — axios з JWT interceptor

## Авторизація

Після логіну токен зберігається в `localStorage` під ключем `token`.  
`ADMIN/MODERATOR` → адмін-панель, `SELLER` → seller-кабінет.

## API

Бекенд: FastAPI на `http://3.65.169.203:7777`