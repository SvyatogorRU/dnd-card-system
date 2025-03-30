const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group');
const authMiddleware = require('../middleware/auth');
const checkRole = require('../middleware/checkRole');

// Защита всех маршрутов middleware для проверки авторизации
router.use(authMiddleware);

// Маршруты для управления группами
router.get('/', groupController.getUserGroups);
router.get('/:groupId', groupController.getGroup);
router.post('/', checkRole(['Dungeon Master', 'Administrator']), groupController.createGroup);
router.put('/:groupId', groupController.updateGroup);
router.post('/:groupId/members', groupController.addUserToGroup);
router.get('/:groupId/bank', groupController.getGroupBank);
router.post('/:groupId/bank', checkRole(['Dungeon Master', 'Administrator']), groupController.updateGroupBank);

module.exports = router;