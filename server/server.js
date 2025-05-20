// ---------------------------------------------
// File: server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/seatingchart';

// Connect
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const guestsRouter = require('./routes/guests');
app.use('/api/guests', guestsRouter);

// Seed if empty
const Guest = require('./models/Guest');
const seedNames = [
  'Alan', 'Alice', 'Bill', 'Bob', 'Charlie Carranza',
  'David', 'Eva', 'Frank', 'Grace', 'Hannah',
  'Ivan', 'Julia', 'Kyle', 'Laura', 'Mike',
  'Nina', 'Oliver', 'Paula', 'Quinn', 'Rachel',
  'Steve', 'Tracy', 'Uma', 'Victor', 'Wendy',
  'Xavier', 'Yvonne', 'Zach'
];
const tableAssignments = { Alan:1, Alice:2, Bill:2, Bob:3, Charlie:1, David:4, Eva:1, Frank:2, Grace:3, Hannah:1, Ivan:2, Julia:4, Kyle:3, Laura:4, Mike:1, Nina:2, Oliver:3, Paula:4, Quinn:1, Rachel:2, Steve:3, Tracy:2, Uma:1, Victor:3, Wendy:4, Xavier:2, Yvonne:1, Zach:3 };
Guest.countDocuments({}, async (err, count) => {
  if (!err && count === 0) {
    const seedData = seedNames.map(fullName => {
      const parts = fullName.split(' ');
      const firstName = parts.shift();
      const lastName = parts.join(' ');
      return { firstName, lastName, tableNumber: tableAssignments[firstName] || 1 };
    });
    await Guest.insertMany(seedData);
    console.log(`🌱 Seeded ${seedData.length} guests`);
  }
});

// Serve React in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../client/build/index.html')));
}

// Start
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
