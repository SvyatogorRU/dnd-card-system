const { Card, User, sequelize } = require('../models');

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