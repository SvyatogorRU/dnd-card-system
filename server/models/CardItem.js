'use strict';

module.exports = (sequelize, DataTypes) => {
  const CardItem = sequelize.define('CardItem', {
    cardId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cards',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Cards',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    equipped: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'CardItems'
  });

  return CardItem;
};