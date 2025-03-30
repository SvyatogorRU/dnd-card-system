const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    // Проверка наличия токена
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Требуется авторизация' });
    }

    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Поиск пользователя
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Сохранение информации о пользователе
    req.user = user;
    req.userId = user._id;
    
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Ошибка авторизации' });
  }
};