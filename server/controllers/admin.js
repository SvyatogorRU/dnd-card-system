const Field = require('../models/Field');

// Получение всех полей
exports.getAllFields = async (req, res) => {
  try {
    const fields = await Field.find().sort({ category: 1, order: 1 });
    res.json(fields);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении полей' });
  }
};

// Создание нового поля
exports.createField = async (req, res) => {
  try {
    const { name, type, category, options, defaultValue, required } = req.body;
    
    // Валидация входных данных
    if (!name || !type || !category) {
      return res.status(400).json({ message: 'Все обязательные поля должны быть заполнены' });
    }
    
    // Создание уникального ключа на основе имени
    const key = name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
    
    // Проверка на уникальность ключа
    const existingField = await Field.findOne({ key });
    if (existingField) {
      return res.status(400).json({ message: 'Поле с таким именем уже существует' });
    }
    
    // Подсчет количества полей в категории для определения порядка
    const fieldsInCategory = await Field.countDocuments({ category });
    
    const newField = new Field({
      name,
      key,
      type,
      category,
      options: options || [],
      defaultValue,
      required: required || false,
      order: fieldsInCategory
    });
    
    await newField.save();
    
    res.status(201).json(newField);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при создании поля' });
  }
};

// Обновление поля
exports.updateField = async (req, res) => {
  try {
    const { fieldId } = req.params;
    const { name, type, category, options, defaultValue, required, order } = req.body;
    
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Поле не найдено' });
    }
    
    // Обновление полей
    if (name) field.name = name;
    if (type) field.type = type;
    if (category) field.category = category;
    if (options) field.options = options;
    if (defaultValue !== undefined) field.defaultValue = defaultValue;
    if (required !== undefined) field.required = required;
    if (order !== undefined) field.order = order;
    
    field.updatedAt = new Date();
    
    await field.save();
    
    res.json(field);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при обновлении поля' });
  }
};

// Удаление поля
exports.deleteField = async (req, res) => {
  try {
    const { fieldId } = req.params;
    
    const field = await Field.findById(fieldId);
    if (!field) {
      return res.status(404).json({ message: 'Поле не найдено' });
    }
    
    await Field.deleteOne({ _id: fieldId });
    
    // Обновление порядка оставшихся полей в той же категории
    await Field.updateMany(
      { category: field.category, order: { $gt: field.order } },
      { $inc: { order: -1 } }
    );
    
    res.json({ message: 'Поле успешно удалено' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при удалении поля' });
  }
};