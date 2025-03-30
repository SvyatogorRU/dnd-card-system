'use strict';

module.exports = (sequelize, DataTypes) => {
  const GroupMember = sequelize.define('GroupMember', {
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Groups',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    timestamps: true,
    tableName: 'GroupMembers'
  });

  // Добавляем метод для получения членства пользователя в группе
  GroupMember.prototype.getMembership = async function(groupId) {
    return await GroupMember.findOne({
      where: {
        userId: this.id,
        groupId
      }
    });
  };

  return GroupMember;
};