/* eslint-disable no-console */
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('../../models/tourModel');

dotenv.config({ path: './config.env' });

const uri = process.env.DATABASE.replace(
  '<USER>:<PASSWORD>',
  `${process.env.USER}:${process.env.DB_PASSWORD}`
);

async function main() {
  await mongoose.connect(uri);
  console.log('DataBase is connected');
}
// import ALL DATA From tours

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8')
);

Object.keys(tours).map((key) => delete tours[key].id);

async function importData() {
  try {
    await main();
    await Tour.create(tours);
    console.log('Data successfully loaded !');
  } catch (err) {
    console.log(err);
  } finally {
    process.exit();
  }
}

// DELETE ALL DATA

async function deleteData() {
  try {
    await main();
    await Tour.deleteMany();
    console.log('Data successfully deleted !');
  } catch (error) {
    console.log(error);
  } finally {
    process.exit();
  }
}

if (process.argv[2] === '--import') importData();
if (process.argv[2] === '--delete') deleteData();
