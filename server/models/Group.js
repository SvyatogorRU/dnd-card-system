'use strict';

module.exports = (sequelize, DataTypes) => {
  const Group = sequelize.define('Group', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    timestamps: true
  });

  Group.associate = function(models) {
    Group.belongsToMany(models.User, { through: 'GroupMembers', foreignKey: 'groupId', as: 'members' });
    Group.belongsToMany(models.Card, { through: 'GroupCards', foreignKey: 'groupId', as: 'cards' });
    Group.hasMany(models.GroupBank, { foreignKey: 'groupId', as: 'bankEntries' });
  };

  return Group;
};