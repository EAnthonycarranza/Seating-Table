// File: models/Guest.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Updated Guest schema: firstName and lastName are optional with default empty string
const GuestSchema = new Schema({
  firstName: { type: String, default: '' },
  lastName:  { type: String, default: '' },
  tableNumber: { type: Number, default: 1 },
}, { timestamps: true });

module.exports = mongoose.model('Guest', GuestSchema);