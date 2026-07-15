const express = require('express');
const router = express.Router();

const { getMyNotifications, markAsRead } = require('../controllers/notification.controller');
const protect = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);

module.exports = router;