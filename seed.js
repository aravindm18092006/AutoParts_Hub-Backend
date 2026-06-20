const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const Part = require('./models/Part');
const User = require('./models/User');

// Load environment variables
dotenv.config({ path: './Config.env' });

const mongoUrl = process.env.MONGODB_URL;
if (!mongoUrl) {
  console.error('Error: MONGODB_URL is not defined in Config.env');
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB at:', mongoUrl);
    await mongoose.connect(mongoUrl);
    console.log('MongoDB connected successfully!');

    // Read Data.json
    const dataPath = path.join(__dirname, 'Data.json');
    if (!fs.existsSync(dataPath)) {
      console.error('Error: Data.json not found at', dataPath);
      process.exit(1);
    }

    const categories = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const partsToInsert = [];

    // Extract parts from categories in Data.json
    categories.forEach(categoryObj => {
      const itemCards = categoryObj.card?.card?.itemCards || [];
      itemCards.forEach(itemCard => {
        const info = itemCard.card?.info;
        if (info) {
          partsToInsert.push({
            name: info.name,
            category: info.category || 'Engine',
            description: info.description || 'High-quality automotive part.',
            imgName: info.imgName || 'download.png',
            inStock: info.inStock !== undefined ? info.inStock : 10,
            defaultPrice: info.defaultPrice || info.price || 500,
            rating: info.rating || '4.5',
            ratingCount: info.ratingCount || '10 ratings',
            specifications: info.specifications || {}
          });
        }
      });
    });

    console.log(`Extracted ${partsToInsert.length} parts from Data.json.`);

    // Clear existing parts
    console.log('Clearing existing parts...');
    await Part.deleteMany({});
    console.log('Existing parts cleared.');

    // Insert new parts
    console.log('Inserting seed parts...');
    const insertedParts = await Part.insertMany(partsToInsert);
    console.log(`Successfully seeded ${insertedParts.length} parts into MongoDB!`);

    // Seed users from users.json
    const usersPath = path.join(__dirname, 'users.json');
    if (fs.existsSync(usersPath)) {
      const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
      console.log('Clearing existing users...');
      await User.deleteMany({});
      console.log('Inserting seed users...');
      for (const user of usersData) {
        await User.create({
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role || 'user'
        });
      }
      console.log(`Successfully seeded ${usersData.length} users into MongoDB!`);
    }

    mongoose.connection.close();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
