const { User, Card, Group, Field, sequelize } = require('../models');

// Получение статистики базы данных
exports.getDbStats = async (req, res) => {
  try {
    // Получение количества пользователей
    const usersCount = await User.count();
    
    // Получение количества групп
    const groupsCount = await Group.count();
    
    // Получение количества полей
    const fieldsCount = await Field.count();
    
    // Получение статистики по карточкам
    const cardsTotal = await Card.count();
    
    // Статистика по типам карточек
    const characterTotal = await Card.count({ where: { type: 'character' } });
    const npcTotal = await Card.count({ where: { type: 'npc' } });
    const itemTotal = await Card.count({ where: { type: 'item' } });
    
    // Получение количества уникальных карточек (без дубликатов)
    // Допустим, что уникальность определяется по совпадению содержимого (content)
    const [uniqueResults] = await sequelize.query(`
      SELECT COUNT(DISTINCT content) as unique_count, 
             COUNT(DISTINCT CASE WHEN type = 'character' THEN content END) as character_unique,
             COUNT(DISTINCT CASE WHEN type = 'npc' THEN content END) as npc_unique,
             COUNT(DISTINCT CASE WHEN type = 'item' THEN content END) as item_unique
      FROM "Cards"
    `);
    
    const uniqueCount = uniqueResults[0]?.unique_count || 0;
    const characterUnique = uniqueResults[0]?.character_unique || 0;
    const npcUnique = uniqueResults[0]?.npc_unique || 0;
    const itemUnique = uniqueResults[0]?.item_unique || 0;
    
    // Формирование ответа
    const stats = {
      users: { 
        count: usersCount, 
        lastUpdated: new Date() 
      },
      cards: {
        count: cardsTotal,
        uniqueCount: uniqueCount,
        types: { 
          character: { total: characterTotal, unique: characterUnique }, 
          npc: { total: npcTotal, unique: npcUnique }, 
          item: { total: itemTotal, unique: itemUnique } 
        },
        lastUpdated: new Date()
      },
      groups: { 
        count: groupsCount, 
        lastUpdated: new Date() 
      },
      fields: { 
        count: fieldsCount, 
        lastUpdated: new Date() 
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка при получении статистики базы данных' });
  }
};

// Выполнение произвольного SQL-запроса (только для администраторов)
exports.executeSqlQuery = async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'SQL-запрос не предоставлен' });
    }
    
    // Определяем тип запроса (SELECT или другой)
    const isSelectQuery = query.trim().toLowerCase().startsWith('select');
    
    // Выполнение запроса
    const [results, metadata] = await sequelize.query(query);
    
    if (isSelectQuery) {
      // Для SELECT-запросов возвращаем данные и структуру
      if (results.length > 0) {
        const columns = Object.keys(results[0]);
        const rows = results.map(row => columns.map(col => row[col]));
        
        res.json({
          columns,
          rows
        });
      } else {
        res.json({
          columns: [],
          rows: []
        });
      }
    } else {
      // Для других запросов возвращаем сообщение об успехе
      res.json({
        message: 'Запрос выполнен успешно',
        rowsAffected: metadata
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      message: 'Ошибка при выполнении SQL-запроса', 
      error: error.message 
    });
  }
};