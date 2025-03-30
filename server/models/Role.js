'use strict';

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define('Role', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    permissions: {
      type: DataTypes.JSONB,
      defaultValue: {}
    }
  }, {
    timestamps: true
  });

  Role.associate = function(models) {
    Role.belongsToMany(models.User, { through: 'UserRoles', foreignKey: 'roleId', as: 'users' });
  };

  return Role;
};