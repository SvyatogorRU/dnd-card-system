'use strict';

module.exports = (sequelize, DataTypes) => {
  const Card = sequelize.define('Card', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('character', 'npc', 'item'),
      allowNull: false,
      defaultValue: 'character'
    },
    content: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    timestamps: true
  });

  Card.associate = function(models) {
    Card.belongsTo(models.User, { foreignKey: 'userId', as: 'owner' });
    Card.belongsToMany(models.Card, { 
      through: 'CardRelations', 
      as: 'linkedItems', 
      foreignKey: 'cardId', 
      otherKey: 'linkedCardId' 
    });
    Card.belongsToMany(models.Card, { 
      through: 'CardRelations', 
      as: 'linkedToCards', 
      foreignKey: 'linkedCardId', 
      otherKey: 'cardId' 
    });
    Card.belongsToMany(models.Group, { through: 'GroupCards', foreignKey: 'cardId', as: 'groups' });
  };

  return Card;
};