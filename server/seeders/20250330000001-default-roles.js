'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Roles', [
      {
        name: 'Administrator',
        description: 'Полный доступ ко всем функциям системы',
        permissions: JSON.stringify({
          all: true,
          admin: true,
          users: true,
          cards: true,
          fields: true,
          groups: true
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Dungeon Master',
        description: 'Создание и редактирование NPC, настройка групп',
        permissions: JSON.stringify({
          cards: {
            create: true,
            read: true,
            update: true,
            delete: true,
            npc: true,
            item: true
          },
          groups: {
            manage: true,
            bank: true
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Card Creator',
        description: 'Создание и редактирование карточек',
        permissions: JSON.stringify({
          cards: {
            create: true,
            read: true,
            update: true
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Player',
        description: 'Базовые права игрока',
        permissions: JSON.stringify({
          cards: {
            read: true,
            update: {
              own: true
            }
          },
          groups: {
            read: true
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Group Captain',
        description: 'Капитан группы с расширенными правами',
        permissions: JSON.stringify({
          groups: {
            read: true,
            members: true
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Group Vice-Captain',
        description: 'Заместитель капитана группы',
        permissions: JSON.stringify({
          groups: {
            read: true
          }
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Roles', null, {});
  }
};