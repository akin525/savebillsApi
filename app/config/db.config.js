module.exports = {
  HOST: "localhost",
  USER: "savebill_app",
  PASSWORD: "@Savebills2022",
  DB: "savebill_app",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};