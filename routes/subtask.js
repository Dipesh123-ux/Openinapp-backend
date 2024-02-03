const express = require('express')
const router = express.Router();
const isAuth = require('../middleware/isauth')

const {createSubtask,updateSubTask,deleteSubTask,getAllSubTasks} = require('../controllers/subtask')

router.use(isAuth);

router.post('/create',createSubtask);
router.post('/update/:id',updateSubTask);
router.post('/delete/:id',deleteSubTask);
router.get('/all',getAllSubTasks);

module.exports = router;