const express = require('express');
const router = express.Router();

const { register, login, getMe, createStaffOrAdmin } = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema, createStaffSchema } = require('../validators/auth.validator');
const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const upload = require('../middlewares/upload.middleware');

router.post('/register', upload.single('verificationDocument'), validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/me', protect, getMe);

// Admin-only: create staff or admin accounts
router.post('/create-staff', protect, authorize('admin'), validate(createStaffSchema), createStaffOrAdmin);

module.exports = router;