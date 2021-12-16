module.exports = {
  HOST: "localhost",
  USER: "isabella",
  PASSWORD: "123456",
  DB: "bdarduino",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
