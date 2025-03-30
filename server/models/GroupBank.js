'use strict';

module.exports = (sequelize, DataTypes) => {
  const GroupBank = sequelize.define('GroupBank', {
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    amount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  GroupBank.associate = function(models) {
    GroupBank.belongsTo(models.Group, { foreignKey: 'groupId', as: 'group' });
    GroupBank.belongsTo(models.User, { foreignKey: 'createdById', as: 'createdBy' });
  };

  return GroupBank;
};