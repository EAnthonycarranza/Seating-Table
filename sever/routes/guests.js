// File: routes/guests.js
const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const multer = require('multer');
const csvParser = require('csv-parser');
const { Parser: Json2csvParser } = require('json2csv');
const fs = require('fs');
const path = require('path');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config for CSV uploads
const upload = multer({ dest: uploadDir });

// --- CSV Export (must come before '/:id' route) ---
router.get('/export-csv', async (req, res) => {
  try {
    const guests = await Guest.find().lean();
    const fields = [
      { label: 'First name', value: 'firstName' },
      { label: 'Last name',  value: 'lastName'  },
      { label: 'Table number', value: 'tableNumber' }
    ];
    const parser = new Json2csvParser({ fields });
    const csv = parser.parse(guests);
    res.header('Content-Type', 'text/csv');
    res.attachment('guests.csv');
    res.send(csv);
  } catch (err) {
    console.error('Error in GET /export-csv:', err);
    res.status(500).json({ error: err.message });
  }
});

// --- Bulk CSV Import ---
router.post('/import-csv', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  const rows = [];
  fs.createReadStream(req.file.path)
    .pipe(csvParser())
    .on('data', row => {
      const firstName = (row['First name'] || row.firstName || '').trim();
      const lastName  = (row['Last name']  || row.lastName  || '').trim();
      const rawTable   = row['Table number'] || row.tableNumber;
      const tableNumber = parseInt(rawTable, 10) || 1;
      if (firstName && lastName) rows.push({ firstName, lastName, tableNumber });
    })
    .on('end', async () => {
      try {
        console.log(`Importing ${rows.length} rows (unordered)`);
        await Guest.insertMany(rows, { ordered: false });
        fs.unlinkSync(req.file.path);
        res.json({ message: 'CSV imported', count: rows.length });
      } catch (err) {
        console.error('Error during bulk insert:', err);
        const insertedCount = err.insertedDocs ? err.insertedDocs.length : 0;
        res.json({ message: 'Imported with some duplicates skipped', count: insertedCount });
      }
    })
    .on('error', err => {
      console.error('Error parsing CSV:', err);
      res.status(500).json({ error: err.message });
    });
});

// --- CRUD Endpoints ---

// GET all guests
router.get('/', async (req, res) => {
  try {
    const guests = await Guest.find();
    res.json(guests);
  } catch (err) {
    console.error('Error in GET /api/guests:', err);
    res.status(500).json({ error: 'Failed to load guests' });
  }
});

// GET one guest by ID
router.get('/:id', async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ error: 'Guest not found' });
    res.json(guest);
  } catch (err) {
    console.error('Error in GET /api/guests/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// CREATE a new guest
router.post('/', async (req, res) => {
  try {
    const { firstName, lastName, tableNumber } = req.body;
    const newGuest = await Guest.create({ firstName, lastName, tableNumber });
    res.status(201).json(newGuest);
  } catch (err) {
    console.error('Error in POST /api/guests:', err);
    res.status(400).json({ error: err.message });
  }
});

// UPDATE a guest by ID
router.put('/:id', async (req, res) => {
  try {
    const { firstName, lastName, tableNumber } = req.body;
    const updated = await Guest.findByIdAndUpdate(
      req.params.id,
      { firstName, lastName, tableNumber },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Guest not found' });
    res.json(updated);
  } catch (err) {
    console.error('Error in PUT /api/guests/:id:', err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE a guest by ID
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Guest.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Guest not found' });
    res.json({ message: 'Guest deleted' });
  } catch (err) {
    console.error('Error in DELETE /api/guests/:id:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;