const app = require('./app');
const { sequelize } = require('./models');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Подключение к PostgreSQL и запуск сервера
sequelize.authenticate()
  .then(() => {
    console.log('Connected to PostgreSQL');
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to PostgreSQL', err);
    process.exit(1);
  });