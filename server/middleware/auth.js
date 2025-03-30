const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

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
    const user = await User.findByPk(decoded.userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }

    // Сохранение информации о пользователе
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Ошибка авторизации' });
  }
};