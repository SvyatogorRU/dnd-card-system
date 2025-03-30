'use strict';

module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    discordId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    avatar: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    lastLogin: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    timestamps: true
  });

  User.associate = function(models) {
    // Определим ассоциации
    User.hasMany(models.Card, { foreignKey: 'userId', as: 'cards' });
    User.belongsToMany(models.Role, { through: 'UserRoles', foreignKey: 'userId', as: 'roles' });
    User.belongsToMany(models.Group, { through: 'GroupMembers', foreignKey: 'userId', as: 'groups' });
  };

  return User;
};