const { Role, User, sequelize } = require('../models');

// Получение всех ролей
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      order: [['name', 'ASC']]
    });
    
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении ролей' });
  }
};

// Создание новой роли
exports.createRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description, permissions } = req.body;
    
    // Валидация входных данных
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Название роли обязательно' });
    }
    
    // Проверка на уникальность имени
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Роль с таким названием уже существует' });
    }
    
    // Создание новой роли
    const newRole = await Role.create({
      name,
      description: description || '',
      permissions: permissions || {}
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json(newRole);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании роли' });
  }
};

// Обновление роли
exports.updateRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { roleId } = req.params;
    const { name, description, permissions } = req.body;
    
    const role = await Role.findByPk(roleId);
    if (!role) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Роль не найдена' });
    }
    
    // Защита системных ролей
    if (role.name === 'Administrator' && name !== 'Administrator') {
      await transaction.rollback();
      return res.status(403).json({ message: 'Невозможно изменить название системной роли' });
    }
    
    // Обновление полей
    if (name) role.name = name;
    if (description !== undefined) role.description = description;
    if (permissions) role.permissions = permissions;
    
    await role.save({ transaction });
    
    await transaction.commit();
    
    res.json(role);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении роли' });
  }
};

// Удаление роли
exports.deleteRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { roleId } = req.params;
    
    const role = await Role.findByPk(roleId);
    if (!role) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Роль не найдена' });
    }
    
    // Защита системных ролей
    if (['Administrator', 'Dungeon Master', 'Player'].includes(role.name)) {
      await transaction.rollback();
      return res.status(403).json({ message: 'Невозможно удалить системную роль' });
    }
    
    await role.destroy({ transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Роль успешно удалена' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении роли' });
  }
};

// Присвоение роли пользователю
exports.assignRoleToUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { userId, roleId } = req.body;
    
    // Валидация входных данных
    if (!userId || !roleId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'ID пользователя и роли обязательны' });
    }
    
    // Проверка существования пользователя и роли
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const role = await Role.findByPk(roleId);
    if (!role) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Роль не найдена' });
    }
    
    // Проверка, имеет ли пользователь уже эту роль
    const hasRole = await user.hasRole(role);
    if (hasRole) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Пользователь уже имеет эту роль' });
    }
    
    // Присвоение роли пользователю
    await user.addRole(role, { transaction });
    
    // Если роль Administrator, обновляем флаг isAdmin
    if (role.name === 'Administrator' && !user.isAdmin) {
      user.isAdmin = true;
      await user.save({ transaction });
    }
    
    await transaction.commit();
    
    res.json({ message: 'Роль успешно присвоена пользователю' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при присвоении роли' });
  }
};

// Удаление роли у пользователя
exports.removeRoleFromUser = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { userId, roleId } = req.params;
    
    // Проверка существования пользователя и роли
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const role = await Role.findByPk(roleId);
    if (!role) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Роль не найдена' });
    }
    
    // Проверка, имеет ли пользователь эту роль
    const hasRole = await user.hasRole(role);
    if (!hasRole) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Пользователь не имеет этой роли' });
    }
    
    // Нельзя снять роль Administrator у единственного администратора
    if (role.name === 'Administrator') {
      const adminCount = await User.count({
        include: [
          {
            model: Role,
            as: 'roles',
            where: { name: 'Administrator' }
          }
        ]
      });
      
      if (adminCount <= 1) {
        await transaction.rollback();
        return res.status(403).json({ message: 'Невозможно удалить последнего администратора системы' });
      }
    }
    
    // Удаление роли у пользователя
    await user.removeRole(role, { transaction });
    
    // Если роль Administrator, проверяем, нужно ли обновить флаг isAdmin
    if (role.name === 'Administrator') {
      const stillAdmin = await user.hasRole('Administrator');
      
      if (!stillAdmin && user.isAdmin) {
        user.isAdmin = false;
        await user.save({ transaction });
      }
    }
    
    await transaction.commit();
    
    res.json({ message: 'Роль успешно удалена у пользователя' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении роли' });
  }
};

// Получение пользователей с определенной ролью
exports.getUsersByRole = async (req, res) => {
  try {
    const { roleId } = req.params;
    
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Роль не найдена' });
    }
    
    const users = await User.findAll({
      include: [
        {
          model: Role,
          as: 'roles',
          where: { id: roleId },
          through: { attributes: [] }
        }
      ],
      attributes: ['id', 'username', 'avatar', 'isAdmin']
    });
    
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении пользователей' });
  }
};