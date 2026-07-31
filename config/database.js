module.exports = ({ env }) => {
  const url = env('DATABASE_URL');
  console.log('🟢 Проверяем DATABASE_URL:', url ? 'задана' : 'НЕ ЗАДАНА');

  if (url) {
    // Проверяем соединение явно
    const { Client } = require('pg');
    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
    client.connect()
      .then(() => {
        console.log('✅ Подключение к Neon успешно');
        client.end();
      })
      .catch(err => {
        console.error('❌ Ошибка подключения к Neon:', err.message);
        console.error('   Код ошибки:', err.code);
        console.error('   Детали:', err.stack);
        client.end();
      });
  }

  return {
    connection: {
      client: 'postgres',
      connection: url
        ? {
            connectionString: url,
            ssl: { rejectUnauthorized: false },
          }
        : {
            host: env('DATABASE_HOST', '127.0.0.1'),
            port: env('DATABASE_PORT', 5432),
            database: env('DATABASE_NAME', 'strapi'),
            user: env('DATABASE_USERNAME', 'postgres'),
            password: env('DATABASE_PASSWORD', ''),
            ssl: false,
          },
    },
  };
};