require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_USERNAME  || "postgres",
    "password": process.env.DB_PASSWORD  || "password",
    "database": process.env.DB_DATABASE  || "helpdesk_db",
    "host": process.env.DB_HOST || "localhost",
    "dialect": process.env.DB_DIALECT || "postgres",
    "port": process.env.DB_PORT || 5432
  },
  "test": {
    "username": process.env.DB_USERNAME || "postgres",
    "password": process.env.DB_PASSWORD || "password",
    "database": "itam_db_test",
    "host": process.env.DB_HOST || "localhost",
    "dialect": process.env.DB_DIALECT || "postgres",
    "port": process.env.DB_PORT || 5432
  },
  "production": {
    "username": process.env.DB_USERNAME || "postgres",
    "password": process.env.DB_PASSWORD || "password",
    "database": "itam_db_production",
    "host": process.env.DB_HOST || "localhost",
    "dialect": process.env.DB_DIALECT || "postgres",
    "port": process.env.DB_PORT || 5432
  }
}