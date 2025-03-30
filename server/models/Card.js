const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CardSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  fields: [{
    fieldId: {
      type: Schema.Types.ObjectId,
      ref: 'Field'
    },
    value: Schema.Types.Mixed
  }],
  public: {
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

module.exports = mongoose.model('Card', CardSchema);