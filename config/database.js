module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: env('DATABASE_URL') // 1. Проверяем: есть ли переменная DATABASE_URL?
      ? {
          // ЕСЛИ ДА (это сработает на Render):
          connectionString: env('DATABASE_URL'), // Используем живую строку Neon
          ssl: { rejectUnauthorized: false },
        }
      : {
          // ЕСЛИ НЕТ (это сработает дома, если в .env удалить DATABASE_URL):
          host: env('DATABASE_HOST', '127.0.0.1'), // Берем локальный IP
          port: env('DATABASE_PORT', 5432),
          database: env('DATABASE_NAME', 'strapi'),
          user: env('DATABASE_USERNAME', 'postgres'),
          password: env('DATABASE_PASSWORD', ''),
          ssl: false,
        },
  },
});
