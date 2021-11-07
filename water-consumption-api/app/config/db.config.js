module.exports = {
  HOST: "localhost",
  USER: "root",
  PASSWORD: "Why-s0-s3r10us",
  DB: "bdarduino",
  dialect: "mysql",
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};
