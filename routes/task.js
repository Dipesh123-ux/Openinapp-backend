const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isauth");

const {
  createTask,
  updateTask,
  deleteTask,
  getAllTasks,
} = require("../controllers/task");

router.use(isAuth);

router.post("/create", createTask);
router.post("/update/:id", updateTask);
router.post("/delete/:id", deleteTask);
router.get("/all", getAllTasks);

module.exports = router;
