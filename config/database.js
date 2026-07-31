module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: env('DATABASE_URL')
      ? {
          connectionString: env('DATABASE_URL'),
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
});