require("dotenv").config();

module.exports = {
  development: {
    username: "user",
    password: "password",
    database: "app",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  test: {
    username: "user",
    password: "password",
    database: "app",
    host: "127.0.0.1",
    dialect: "postgres",
  },
  dockerLocal: {
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    host: process.env.DATABASE_HOST,
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
