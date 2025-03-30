const { Card, User, sequelize, Sequelize, CardItem } = require('../models');
const Op = Sequelize.Op;

// Получение всех карточек пользователя
exports.getUserCards = async (req, res) => {
  try {
    const cards = await Card.findAll({ 
      where: { userId: req.userId },
      order: [['updatedAt', 'DESC']]
    });
    
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении карточек' });
  }
};

// Получение одной карточки
exports.getCard = async (req, res) => {
  try {
    const card = await Card.findByPk(req.params.cardId, {
      include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }]
    });
    
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId !== req.userId && !card.public && !req.user.isAdmin) {
      // Проверка роли Dungeon Master для NPC и предметов
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster || (card.type === 'character')) {
        return res.status(403).json({ message: 'Нет доступа к этой карточке' });
      }
    }
    
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении карточки' });
  }
};

// Создание новой карточки
exports.createCard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, type, content, public } = req.body;
    
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Имя карточки обязательно' });
    }
    
    // Проверка прав на создание карточек разных типов
    if (type === 'npc' || type === 'item') {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      const isCreator = req.user.roles.some(role => role.name === 'Card Creator');
      
      if (!req.user.isAdmin && !isDungeonMaster && !isCreator) {
        await transaction.rollback();
        return res.status(403).json({ 
          message: 'У вас нет прав на создание карточек данного типа' 
        });
      }
    }
    
    // Создание новой карточки
    const newCard = await Card.create({
      name,
      type: type || 'character',
      content: content || {},
      userId: req.userId,
      public: public || false
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json(newCard);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании карточки' });
  }
};

// Обновление карточки
exports.updateCard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { cardId } = req.params;
    const { name, type, content, public } = req.body;
    
    const card = await Card.findByPk(cardId);
    
    if (!card) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId !== req.userId && !req.user.isAdmin) {
      // Проверка роли Dungeon Master для NPC и предметов
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster || (card.type === 'character')) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Нет прав на редактирование этой карточки' });
      }
    }
    
    // Обновление полей
    if (name) card.name = name;
    if (content) card.content = content;
    if (public !== undefined) card.public = public;
    
    await card.save({ transaction });
    
    await transaction.commit();
    
    res.json(card);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении карточки' });
  }
};

// Удаление карточки
exports.deleteCard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { cardId } = req.params;
    
    const card = await Card.findByPk(cardId);
    
    if (!card) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId !== req.userId && !req.user.isAdmin) {
      // Dungeon Master не может удалять карточки персонажей
      if (card.type === 'character') {
        await transaction.rollback();
        return res.status(403).json({ message: 'Нет прав на удаление этой карточки' });
      }
      
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Нет прав на удаление этой карточки' });
      }
    }
    
    await card.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Карточка успешно удалена' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении карточки' });
  }
};

// Получение карточек по типу
exports.getCardsByType = async (req, res) => {
  try {
    const { type } = req.params;
    
    // Проверка валидности типа
    if (!['character', 'npc', 'item'].includes(type)) {
      return res.status(400).json({ message: 'Недопустимый тип карточки' });
    }
    
    // Для NPC и предметов проверяем права доступа
    if (type === 'npc' || type === 'item') {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!req.user.isAdmin && !isDungeonMaster) {
        return res.status(403).json({ 
          message: 'У вас нет прав на просмотр карточек данного типа' 
        });
      }
    }
    
    // Определяем условия поиска
    let where = { type };
    
    // Для обычных игроков показываем только их карточки персонажей
    if (type === 'character' && !req.user.isAdmin) {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        where.userId = req.userId;
      }
    }
    
    const cards = await Card.findAll({ 
      where,
      include: [{ model: User, as: 'owner', attributes: ['id', 'username'] }],
      order: [['updatedAt', 'DESC']]
    });
    
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении карточек' });
  }
};

// НОВЫЕ МЕТОДЫ ДЛЯ РАБОТЫ С ПРЕДМЕТАМИ

// Получение предметов карточки
exports.getCardItems = async (req, res) => {
  try {
    const { cardId } = req.params;
    
    const card = await Card.findByPk(cardId);
    
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId !== req.userId && !card.public && !req.user.isAdmin) {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        return res.status(403).json({ message: 'Нет доступа к этой карточке' });
      }
    }
    
    // Получаем предметы, включая связанные данные
    const items = await card.getItems({
      joinTableAttributes: ['quantity', 'equipped', 'notes'],
      include: [
        { model: User, as: 'owner', attributes: ['id', 'username'] }
      ]
    });
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении предметов карточки' });
  }
};

// Добавление предмета к карточке
exports.addItemToCard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { cardId } = req.params;
    const { itemId, quantity = 1, equipped = false, notes } = req.body;
    
    // Проверка существования карточек
    const card = await Card.findByPk(cardId);
    const item = await Card.findByPk(itemId);
    
    if (!card) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    if (!item) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Предмет не найден' });
    }
    
    // Проверка, что itemId действительно является предметом
    if (item.type !== 'item') {
      await transaction.rollback();
      return res.status(400).json({ message: 'Указанная карточка не является предметом' });
    }
    
    // Проверка прав доступа
    if (card.userId !== req.userId && !req.user.isAdmin) {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Нет прав на добавление предметов к этой карточке' });
      }
    }
    
    // Проверка, не добавлен ли уже предмет
    const existingItem = await CardItem.findOne({
      where: {
        cardId,
        itemId
      }
    });
    
    if (existingItem) {
      // Если предмет уже добавлен, обновляем количество и заметки
      existingItem.quantity = quantity;
      existingItem.equipped = equipped;
      if (notes) existingItem.notes = notes;
      
      await existingItem.save({ transaction });
    } else {
      // Иначе создаем новую связь
      await CardItem.create({
        cardId,
        itemId,
        quantity,
        equipped,
        notes
      }, { transaction });
    }
    
    await transaction.commit();
    
    res.status(201).json({ message: 'Предмет успешно добавлен к карточке' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при добавлении предмета к карточке' });
  }
};

// Обновление предмета в карточке
exports.updateCardItem = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { cardId, itemId } = req.params;
    const { quantity, equipped, notes } = req.body;
    
    const card = await Card.findByPk(cardId);
    
    if (!card) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId !== req.userId && !req.user.isAdmin) {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Нет прав на обновление предметов в этой карточке' });
      }
    }
    
    // Поиск связи
    const cardItem = await CardItem.findOne({
      where: {
        cardId,
        itemId
      }
    });
    
    if (!cardItem) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Предмет не найден в карточке' });
    }
    
    // Обновление связи
    if (quantity !== undefined) cardItem.quantity = quantity;
    if (equipped !== undefined) cardItem.equipped = equipped;
    if (notes !== undefined) cardItem.notes = notes;
    
    await cardItem.save({ transaction });
    
    await transaction.commit();
    
    res.json(cardItem);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении предмета в карточке' });
  }
};

// Удаление предмета из карточки
exports.removeItemFromCard = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { cardId, itemId } = req.params;
    
    const card = await Card.findByPk(cardId);
    
    if (!card) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId !== req.userId && !req.user.isAdmin) {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Нет прав на удаление предметов из этой карточки' });
      }
    }
    
    // Удаление связи
    const removed = await CardItem.destroy({
      where: {
        cardId,
        itemId
      },
      transaction
    });
    
    if (removed === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Предмет не найден в карточке' });
    }
    
    await transaction.commit();
    
    res.json({ message: 'Предмет успешно удален из карточки' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении предмета из карточки' });
  }
};

// Получение карточек, в которых используется предмет
exports.getItemUsage = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    const item = await Card.findByPk(itemId);
    
    if (!item) {
      return res.status(404).json({ message: 'Предмет не найден' });
    }
    
    // Проверка, что это предмет
    if (item.type !== 'item') {
      return res.status(400).json({ message: 'Указанная карточка не является предметом' });
    }
    
    // Проверка прав доступа для просмотра использования предмета
    if (item.userId !== req.userId && !req.user.isAdmin) {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        return res.status(403).json({ message: 'Нет прав на просмотр использования этого предмета' });
      }
    }
    
    // Получаем карточки, использующие этот предмет
    const cards = await item.getUsedInCards({
      joinTableAttributes: ['quantity', 'equipped', 'notes'],
      include: [
        { model: User, as: 'owner', attributes: ['id', 'username'] }
      ]
    });
    
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении использования предмета' });
  }
};

module.exports = exports;