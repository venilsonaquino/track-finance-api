require('dotenv').config();

const baseConfig = {
  dialect: process.env.DB_DIALECT || 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  schema: process.env.SCHEMA,
  timezone: 'utc',
  logging: false,
};

module.exports = {
  development: { ...baseConfig },
  test: { ...baseConfig },
  production: { ...baseConfig },
};
