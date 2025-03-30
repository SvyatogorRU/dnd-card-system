'use strict';

module.exports = (sequelize, DataTypes) => {
  const Field = sequelize.define('Field', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    type: {
      type: DataTypes.ENUM('text', 'number', 'select', 'checkbox', 'textarea'),
      allowNull: false
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false
    },
    options: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    defaultValue: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    required: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    order: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    cardType: {
      type: DataTypes.ENUM('character', 'npc', 'item', 'all'),
      defaultValue: 'all'
    }
  }, {
    timestamps: true
  });

  return Field;
};