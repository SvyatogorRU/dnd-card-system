const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

// Временный маршрут для проверки
router.get('/profile', authMiddleware, (req, res) => {
  res.json({ message: 'Профиль пользователя', user: req.user });
});

module.exports = router;