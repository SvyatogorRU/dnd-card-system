const { User, Role, sequelize } = require('../models');

// Получение всех пользователей
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ],
      attributes: ['id', 'username', 'avatar', 'isAdmin', 'createdAt', 'lastLogin']
    });
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
};

// Получение пользователя по ID
exports.getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ],
      attributes: ['id', 'username', 'avatar', 'isAdmin', 'createdAt', 'lastLogin']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении пользователя' });
  }
};

// Обновление пользователя (доступно только для администраторов)
exports.updateUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { userId } = req.params;
    const { isAdmin } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Нельзя снять флаг администратора у последнего администратора
    if (user.isAdmin && isAdmin === false) {
      const adminCount = await User.count({ where: { isAdmin: true } });
      
      if (adminCount <= 1) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Невозможно удалить последнего администратора системы' });
      }
    }
    
    // Обновление флага администратора
    if (isAdmin !== undefined) {
      user.isAdmin = isAdmin;
      
      // Если пользователь стал администратором, добавляем роль Administrator
      if (isAdmin) {
        const adminRole = await Role.findOne({ where: { name: 'Administrator' } });
        if (adminRole) {
          await user.addRole(adminRole, { transaction });
        }
      } else {
        // Если пользователь больше не администратор, удаляем роль Administrator
        const adminRole = await Role.findOne({ where: { name: 'Administrator' } });
        if (adminRole) {
          await user.removeRole(adminRole, { transaction });
        }
      }
    }
    
    await user.save({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Пользователь успешно обновлен' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении пользователя' });
  }
};

// Получение профиля текущего пользователя
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Role,
          as: 'roles',
          through: { attributes: [] }
        }
      ],
      attributes: ['id', 'username', 'avatar', 'isAdmin', 'createdAt', 'lastLogin']
    });
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении профиля' });
  }
};