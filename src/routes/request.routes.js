const express = require('express');
const router = express.Router();


const {
  createRequest,
  getAllRequests,
  getRequestById,
  assignRequest,
  updateStatus,
  deleteRequest,
} = require('../controllers/request.controller');


const protect = require('../middlewares/auth.middleware');
const authorize = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const upload = require('../middlewares/upload.middleware');
const { createRequestSchema, assignSchema, updateStatusSchema } = require('../validators/request.validator');
const commentRoutes = require('./comment.routes');

router.use(protect); // everything below requires login

router.post('/', authorize('tenant'), upload.array('images', 5), validate(createRequestSchema), createRequest);
router.get('/', getAllRequests); // scoped by role inside controller
router.get('/:id', getRequestById);
router.patch('/:id/assign', authorize('admin'), validate(assignSchema), assignRequest);
router.patch('/:id/status', authorize('admin'), validate(updateStatusSchema), updateStatus);
router.delete('/:id', deleteRequest); // ownership/status check inside controller

router.use('/:requestId/comments', commentRoutes);

module.exports = router;