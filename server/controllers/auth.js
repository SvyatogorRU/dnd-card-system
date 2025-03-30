const axios = require('axios');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');

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
    let [user, created] = await User.findOrCreate({
      where: { discordId },
      defaults: {
        username,
        avatar,
        isAdmin
      }
    });

    if (!created) {
      // Обновление существующего пользователя
      user.username = username;
      user.avatar = avatar;
      user.lastLogin = new Date();
      
      // Убедимся, что права администратора сохраняются
      if (isAdmin && !user.isAdmin) {
        user.isAdmin = true;
      }
      
      await user.save();
    }

    // Если пользователь администратор, добавляем роль администратора
    if (isAdmin) {
      const adminRole = await Role.findOne({ where: { name: 'Administrator' } });
      if (adminRole) {
        await user.addRole(adminRole);
      }
    }
    // Для новых пользователей не добавляем никаких ролей по умолчанию
    // Роли будут назначаться администратором вручную

    // Получаем роли пользователя
    const userRoles = await user.getRoles();
    const roles = userRoles.map(role => ({
      id: role.id,
      name: role.name
    }));

    // Создание JWT токена
    const token = jwt.sign(
      { userId: user.id, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        isAdmin: user.isAdmin,
        roles
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
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      avatar: user.avatar,
      isAdmin: user.isAdmin,
      roles: user.roles.map(role => ({
        id: role.id,
        name: role.name
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
};