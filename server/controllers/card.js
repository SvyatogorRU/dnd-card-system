const Card = require('../models/Card');
const Field = require('../models/Field');

// Получение всех карточек пользователя
exports.getUserCards = async (req, res) => {
  try {
    const cards = await Card.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(cards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении карточек' });
  }
};

// Получение одной карточки
exports.getCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);
    
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId.toString() !== req.userId.toString() && !card.public && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Нет доступа к этой карточке' });
    }
    
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении карточки' });
  }
};

// Создание новой карточки
exports.createCard = async (req, res) => {
  try {
    const { name, fields, public } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Имя карточки обязательно' });
    }
    
    // Создание новой карточки
    const newCard = new Card({
      name,
      userId: req.userId,
      fields: fields || [],
      public: public || false
    });
    
    await newCard.save();
    
    res.status(201).json(newCard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании карточки' });
  }
};

// Обновление карточки
exports.updateCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { name, fields, public } = req.body;
    
    const card = await Card.findById(cardId);
    
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId.toString() !== req.userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Нет прав на редактирование этой карточки' });
    }
    
    // Обновление полей
    if (name) card.name = name;
    if (fields) card.fields = fields;
    if (public !== undefined) card.public = public;
    
    card.updatedAt = new Date();
    
    await card.save();
    
    res.json(card);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении карточки' });
  }
};

// Удаление карточки
exports.deleteCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    
    const card = await Card.findById(cardId);
    
    if (!card) {
      return res.status(404).json({ message: 'Карточка не найдена' });
    }
    
    // Проверка прав доступа
    if (card.userId.toString() !== req.userId.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Нет прав на удаление этой карточки' });
    }
    
    await Card.deleteOne({ _id: cardId });
    
    res.json({ message: 'Карточка успешно удалена' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении карточки' });
  }
};