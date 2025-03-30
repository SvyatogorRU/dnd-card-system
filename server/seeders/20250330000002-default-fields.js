'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Fields', [
      // Поля для персонажей
      {
        name: 'Имя',
        key: 'name',
        type: 'text',
        category: 'Основное',
        options: JSON.stringify([]),
        required: true,
        order: 1,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Раса',
        key: 'race',
        type: 'text',
        category: 'Основное',
        options: JSON.stringify([]),
        required: true,
        order: 2,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Класс',
        key: 'class',
        type: 'text',
        category: 'Основное',
        options: JSON.stringify([]),
        required: true,
        order: 3,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Уровень',
        key: 'level',
        type: 'number',
        category: 'Основное',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(1),
        required: true,
        order: 4,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Предыстория',
        key: 'background',
        type: 'text',
        category: 'Основное',
        options: JSON.stringify([]),
        required: false,
        order: 5,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Мировоззрение',
        key: 'alignment',
        type: 'select',
        category: 'Основное',
        options: JSON.stringify([
          'Законно-добрый', 'Нейтрально-добрый', 'Хаотично-добрый',
          'Законно-нейтральный', 'Нейтральный', 'Хаотично-нейтральный',
          'Законно-злой', 'Нейтрально-злой', 'Хаотично-злой'
        ]),
        required: false,
        order: 6,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Сила',
        key: 'strength',
        type: 'number',
        category: 'Характеристики',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(10),
        required: true,
        order: 1,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ловкость',
        key: 'dexterity',
        type: 'number',
        category: 'Характеристики',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(10),
        required: true,
        order: 2,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Телосложение',
        key: 'constitution',
        type: 'number',
        category: 'Характеристики',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(10),
        required: true,
        order: 3,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Интеллект',
        key: 'intelligence',
        type: 'number',
        category: 'Характеристики',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(10),
        required: true,
        order: 4,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Мудрость',
        key: 'wisdom',
        type: 'number',
        category: 'Характеристики',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(10),
        required: true,
        order: 5,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Харизма',
        key: 'charisma',
        type: 'number',
        category: 'Характеристики',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(10),
        required: true,
        order: 6,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Хиты',
        key: 'hp',
        type: 'number',
        category: 'Боевые',
        options: JSON.stringify([]),
        required: true,
        order: 1,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Класс брони',
        key: 'ac',
        type: 'number',
        category: 'Боевые',
        options: JSON.stringify([]),
        required: true,
        order: 2,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Инициатива',
        key: 'initiative',
        type: 'number',
        category: 'Боевые',
        options: JSON.stringify([]),
        required: false,
        order: 3,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Скорость',
        key: 'speed',
        type: 'number',
        category: 'Боевые',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(30),
        required: false,
        order: 4,
        cardType: 'character',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Поля для NPC
      {
        name: 'Имя',
        key: 'npc_name',
        type: 'text',
        category: 'Основное',
        options: JSON.stringify([]),
        required: true,
        order: 1,
        cardType: 'npc',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Тип',
        key: 'npc_type',
        type: 'select',
        category: 'Основное',
        options: JSON.stringify(['Гуманоид', 'Зверь', 'Монстр', 'Нежить', 'Конструкт', 'Фея', 'Дракон', 'Элементаль', 'Небожитель', 'Исчадие']),
        required: true,
        order: 2,
        cardType: 'npc',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Опасность',
        key: 'challenge_rating',
        type: 'select',
        category: 'Основное',
        options: JSON.stringify(['0', '1/8', '1/4', '1/2', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30']),
        required: true,
        order: 3,
        cardType: 'npc',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Мировоззрение',
        key: 'npc_alignment',
        type: 'select',
        category: 'Основное',
        options: JSON.stringify([
          'Законно-добрый', 'Нейтрально-добрый', 'Хаотично-добрый',
          'Законно-нейтральный', 'Нейтральный', 'Хаотично-нейтральный',
          'Законно-злой', 'Нейтрально-злой', 'Хаотично-злой'
        ]),
        required: false,
        order: 4,
        cardType: 'npc',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Описание',
        key: 'npc_description',
        type: 'textarea',
        category: 'Описание',
        options: JSON.stringify([]),
        required: false,
        order: 1,
        cardType: 'npc',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Поля для предметов
      {
        name: 'Название',
        key: 'item_name',
        type: 'text',
        category: 'Основное',
        options: JSON.stringify([]),
        required: true,
        order: 1,
        cardType: 'item',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Тип',
        key: 'item_type',
        type: 'select',
        category: 'Основное',
        options: JSON.stringify(['Оружие', 'Броня', 'Магический предмет', 'Зелье', 'Свиток', 'Расходный материал', 'Артефакт', 'Инструмент', 'Прочее']),
        required: true,
        order: 2,
        cardType: 'item',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Редкость',
        key: 'rarity',
        type: 'select',
        category: 'Основное',
        options: JSON.stringify(['Обычный', 'Необычный', 'Редкий', 'Очень редкий', 'Легендарный', 'Артефакт']),
        required: true,
        order: 3,
        cardType: 'item',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Требует настройки',
        key: 'attunement',
        type: 'checkbox',
        category: 'Основное',
        options: JSON.stringify([]),
        defaultValue: JSON.stringify(false),
        required: false,
        order: 4,
        cardType: 'item',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Описание',
        key: 'item_description',
        type: 'textarea',
        category: 'Описание',
        options: JSON.stringify([]),
        required: true,
        order: 1,
        cardType: 'item',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Fields', null, {});
  }
};