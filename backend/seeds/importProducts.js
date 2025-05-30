const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Load env vars
dotenv.config({ path: '../.env' });

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Read JSON file
const products = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, '../../frontend/src/data/product/product.json'),
    'utf-8'
  )
);

// Import into DB
const importData = async () => {
  try {
    await Product.deleteMany();
    await Product.create(products);
    console.log('Data Imported...');
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await Product.deleteMany();
    console.log('Data Destroyed...');
    process.exit();
  } catch (error) {
    console.error(error);
  }
};

if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
}
