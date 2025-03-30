const { Field, sequelize } = require('../models');

// Получение всех полей
exports.getAllFields = async (req, res) => {
  try {
    // Если указан тип карточки, фильтруем по нему
    const { cardType } = req.query;
    
    let where = {};
    if (cardType && ['character', 'npc', 'item'].includes(cardType)) {
      where = {
        [sequelize.Op.or]: [
          { cardType },
          { cardType: 'all' }
        ]
      };
    }
    
    const fields = await Field.findAll({
      where,
      order: [
        ['category', 'ASC'],
        ['order', 'ASC']
      ]
    });
    
    res.json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении полей' });
  }
};

// Создание нового поля
exports.createField = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { name, type, category, options, defaultValue, required, cardType, order } = req.body;
    
    // Валидация входных данных
    if (!name || !type || !category) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    }
    
    // Создание уникального ключа на основе имени
    const key = name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    // Проверка на уникальность ключа
    const existingField = await Field.findOne({ where: { key } });
    if (existingField) {
      await transaction.rollback();
      return res.status(400).json({ message: 'Поле с таким именем уже существует' });
    }
    
    // Подсчет количества полей в категории для определения порядка
    const fieldsInCategory = await Field.count({ 
      where: { 
        category,
        cardType: cardType || 'all'
      } 
    });
    
    // Создание нового поля
    const newField = await Field.create({
      name,
      key,
      type,
      category,
      options: options || [],
      defaultValue,
      required: required || false,
      cardType: cardType || 'all',
      order: order !== undefined ? order : fieldsInCategory
    }, { transaction });
    
    await transaction.commit();
    
    res.status(201).json(newField);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании поля' });
  }
};

// Обновление поля
exports.updateField = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { fieldId } = req.params;
    const { name, type, category, options, defaultValue, required, cardType, order } = req.body;
    
    const field = await Field.findByPk(fieldId);
    if (!field) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Поле не найдено' });
    }
    
    // Обновление полей
    if (name) field.name = name;
    if (type) field.type = type;
    if (category) field.category = category;
    if (options) field.options = options;
    if (defaultValue !== undefined) field.defaultValue = defaultValue;
    if (required !== undefined) field.required = required;
    if (cardType) field.cardType = cardType;
    if (order !== undefined) field.order = order;
    
    await field.save({ transaction });
    
    // Если изменилась категория или порядок, перестраиваем порядок других полей
    if (field.changed('category') || field.changed('order')) {
      // Получаем поля той же категории
      const categoryFields = await Field.findAll({
        where: {
          category: field.category,
          cardType: field.cardType,
          id: { [sequelize.Op.ne]: field.id }
        },
        order: [['order', 'ASC']],
        transaction
      });
      
      // Перестраиваем порядок полей
      let currentOrder = 0;
      for (const catField of categoryFields) {
        if (currentOrder === field.order) {
          currentOrder++;
        }
        
        if (catField.order !== currentOrder) {
          catField.order = currentOrder;
          await catField.save({ transaction });
        }
        
        currentOrder++;
      }
    }
    
    await transaction.commit();
    
    res.json(field);
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении поля' });
  }
};

// Удаление поля
exports.deleteField = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { fieldId } = req.params;
    
    const field = await Field.findByPk(fieldId);
    if (!field) {
      await transaction.rollback();
      return res.status(404).json({ message: 'Поле не найдено' });
    }
    
    // Сохраняем категорию и порядок для обновления других полей
    const { category, cardType, order } = field;
    
    await field.destroy({ transaction });
    
    // Обновление порядка оставшихся полей в той же категории
    await Field.update(
      { order: sequelize.literal('order - 1') },
      {
        where: {
          category,
          cardType,
          order: { [sequelize.Op.gt]: order }
        },
        transaction
      }
    );
    
    await transaction.commit();
    
    res.json({ message: 'Поле успешно удалено' });
  } catch (error) {
    await transaction.rollback();
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении поля' });
  }
};