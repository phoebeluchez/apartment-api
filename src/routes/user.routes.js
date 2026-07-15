const express = require('express');
const router = express.Router();

const { getPendingUsers, verifyUser, rejectUser } = require('../controllers/user.controller');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');

router.get('/pending', protect, authorize('admin'), getPendingUsers);
router.patch('/:id/verify', protect, authorize('admin'), verifyUser);
router.patch('/:id/reject', protect, authorize('admin'), rejectUser);

module.exports = router;