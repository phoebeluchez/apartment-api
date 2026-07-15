const express = require('express');
const router = express.Router({ mergeParams: true });

const { createComment, getCommentsForRequest, deleteComment } = require('../controllers/comment.controller');
const protect = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate.middleware');
const { createCommentSchema } = require('../validators/comment.validator');

router.use(protect);

router.post('/', validate(createCommentSchema), createComment);
router.get('/', getCommentsForRequest);
router.delete('/:id', deleteComment);

module.exports = router;