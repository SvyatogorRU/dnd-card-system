const { Group, User, Card, GroupBank, sequelize } = require('../models');

// Получение всех групп пользователя
exports.getUserGroups = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [{ 
        model: Group, 
        as: 'groups',
        through: { attributes: ['position'] }
      }]
    });
    
    res.json(user.groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении групп' });
  }
};

// Получение информации о группе
exports.getGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Проверяем, является ли пользователь участником группы
    const isMember = await req.user.hasGroup(groupId);
    
    if (!isMember && !req.user.isAdmin) {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        return res.status(403).json({ message: 'У вас нет доступа к этой группе' });
      }
    }
    
    const group = await Group.findByPk(groupId, {
      include: [
        { 
          model: User, 
          as: 'members',
          through: { attributes: ['position'] },
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });
    
    if (!group) {
      return res.status(404).json({ message: 'Группа не найдена' });
    }
    
    res.json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении группы' });
  }
};

// Создание новой группы
exports.createGroup = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, description } = req.body;
    
    if (!name) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Название группы обязательно' });
    }
    
    // Проверка прав на создание группы
    const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
    if (!req.user.isAdmin && !isDungeonMaster) {
      await transaction.rollback();
      return res.status(403).json({ message: 'У вас нет прав на создание групп' });
    }
    
    // Создание новой группы
    const newGroup = await Group.create({
      name,
      description: description || ''
    }, { transaction });
    
    // Добавление создателя как участника группы
    await newGroup.addMember(req.userId, { 
      through: { position: 'Dungeon Master' },
      transaction
    });
    
    await transaction.commit();
    
    res.status(201).json(newGroup);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании группы' });
  }
};

// Обновление группы
exports.updateGroup = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { groupId } = req.params;
    const { name, description } = req.body;
    
    const group = await Group.findByPk(groupId);
    
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Группа не найдена' });
    }
    
    // Проверка прав на редактирование группы
    const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
    if (!req.user.isAdmin && !isDungeonMaster) {
      // Проверка, является ли пользователь капитаном группы
      const membership = await req.user.getMembership(groupId);
      if (!membership || !['Капитан Группы'].includes(membership.position)) {
        await transaction.rollback();
        return res.status(403).json({ message: 'У вас нет прав на редактирование этой группы' });
      }
    }
    
    // Обновление полей
    if (name) group.name = name;
    if (description !== undefined) group.description = description;
    
    await group.save({ transaction });
    
    await transaction.commit();
    
    res.json(group);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении группы' });
  }
};

// Добавление пользователя в группу
exports.addUserToGroup = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { groupId } = req.params;
    const { userId, position } = req.body;
    
    if (!userId) {
      await transaction.rollback();
      return res.status(400).json({ message: 'ID пользователя обязателен' });
    }
    
    const group = await Group.findByPk(groupId);
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Группа не найдена' });
    }
    
    // Проверка прав на добавление пользователей
    const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
    if (!req.user.isAdmin && !isDungeonMaster) {
      // Проверка, является ли пользователь капитаном группы
      const membership = await req.user.getMembership(groupId);
      if (!membership || !['Капитан Группы'].includes(membership.position)) {
        await transaction.rollback();
        return res.status(403).json({ message: 'У вас нет прав на добавление пользователей в эту группу' });
      }
    }
    
    // Проверка существования пользователя
    const user = await User.findByPk(userId);
    if (!user) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Проверка, не состоит ли пользователь уже в группе
    const isMember = await group.hasMember(userId);
    if (isMember) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Пользователь уже состоит в группе' });
    }
    
    // Добавление пользователя в группу
    await group.addMember(userId, { 
      through: { position: position || 'Участник' },
      transaction
    });
    
    await transaction.commit();
    
    res.json({ message: 'Пользователь успешно добавлен в группу' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при добавлении пользователя в группу' });
  }
};

// Обновление банка группы
exports.updateGroupBank = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { groupId } = req.params;
    const { title, amount, description } = req.body;
    
    if (!title || amount === undefined) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Название и сумма обязательны' });
    }
    
    const group = await Group.findByPk(groupId);
    if (!group) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Группа не найдена' });
    }
    
    // Проверка прав на обновление банка группы
    const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
    if (!req.user.isAdmin && !isDungeonMaster) {
      await transaction.rollback();
      return res.status(403).json({ message: 'У вас нет прав на обновление банка группы' });
    }
    
    // Создание записи в банке группы
    await GroupBank.create({
      groupId,
      title,
      amount,
      description: description || '',
      createdById: req.userId
    }, { transaction });
    
    await transaction.commit();
    
    res.json({ message: 'Банк группы успешно обновлен' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении банка группы' });
  }
};

// Получение истории банка группы
exports.getGroupBank = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Проверяем, является ли пользователь участником группы
    const isMember = await req.user.hasGroup(groupId);
    
    if (!isMember && !req.user.isAdmin) {
      const isDungeonMaster = req.user.roles.some(role => role.name === 'Dungeon Master');
      if (!isDungeonMaster) {
        return res.status(403).json({ message: 'У вас нет доступа к банку этой группы' });
      }
    }
    
    const bankEntries = await GroupBank.findAll({
      where: { groupId },
      include: [
        { model: User, as: 'createdBy', attributes: ['id', 'username'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    // Рассчитываем текущий баланс
    const totalBalance = bankEntries.reduce((sum, entry) => sum + entry.amount, 0);
    
    res.json({
      entries: bankEntries,
      totalBalance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении банка группы' });
  }
};