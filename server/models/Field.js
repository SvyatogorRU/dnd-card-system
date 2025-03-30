const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FieldSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  key: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['text', 'number', 'select', 'checkbox', 'textarea'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  order: {
    type: Number,
    default: 0
  },
  options: [String], // Для типа 'select'
  defaultValue: Schema.Types.Mixed,
  required: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Field', FieldSchema);