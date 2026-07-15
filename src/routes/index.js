const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./user.routes'));
router.use('/requests', require('./request.routes'));
router.use('/notifications', require('./notification.routes'));

module.exports = router;