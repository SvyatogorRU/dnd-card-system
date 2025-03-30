const axios = require('axios');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Авторизация через Discord
exports.discordAuth = async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Код авторизации не предоставлен' });
    }

    // Обмен кода на токен доступа
    const tokenResponse = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    const { access_token } = tokenResponse.data;

    // Получение информации о пользователе
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`
      }
    });

    const { id: discordId, username, avatar } = userResponse.data;

    // Проверка, является ли пользователь администратором
    const isAdmin = discordId === process.env.ADMIN_DISCORD_ID;

    // Поиск или создание пользователя
    let user = await User.findOne({ discordId });

    if (user) {
      // Обновление существующего пользователя
      user.username = username;
      user.avatar = avatar;
      user.lastLogin = new Date();
      
      // Убедимся, что права администратора сохраняются
      if (isAdmin && !user.isAdmin) {
        user.isAdmin = true;
      }
    } else {
      // Создание нового пользователя
      user = new User({
        discordId,
        username,
        avatar,
        isAdmin
      });
    }

    await user.save();

    // Создание JWT токена
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        avatar: user.avatar,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Discord auth error:', error);
    res.status(500).json({ message: 'Ошибка авторизации через Discord' });
  }
};

// Проверка текущего пользователя
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};