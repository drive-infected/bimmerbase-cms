module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', '127.0.0.1'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'bmw_database'),
      user: env('DATABASE_USERNAME', 'janpodvoyski'),
      password: env('DATABASE_PASSWORD'),
      ssl: false,
    },
  },
});