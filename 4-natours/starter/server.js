const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log(`UNHANDLED EXCPTION ! 💥 Shutting down...`);
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const uri = process.env.DATABASE.replace(
  '<USER>:<PASSWORD>',
  `${process.env.USER}:${process.env.DB_PASSWORD}`
);
async function main() {
  try {
    await mongoose.connect(uri);
    // eslint-disable-next-line no-console
    console.log('DataBase is connect');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
  }
}

main();

const port = process.env.port || 8000;

const server = app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`App running on port ${port}...`, `\nhttp://localhost:${port}`);
});
process.on('unhandledRejection', (err) => {
  console.log(`UNHANDLED REJECTION ! 💥 Shutting down...`);
  console.log(err.name, err.message);
  server.close((err) => {
    process.exit(1);
  });
});
