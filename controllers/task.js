const Task = require("../models/task");
const calculatePriority = require("../common/calculatePriority");
const User = require("../models/user");

exports.createTask = async (req, res) => {
  try {
    const { title, description, due_date } = req.body;

    if (!title || !description || !due_date) {
      return res.status(400).json({
        message: "All fields are mandatory",
      });
    }

    const priority = calculatePriority(due_date);

    const task = new Task({
      title,
      description,
      due_date: new Date(due_date),
      priority,
      users: [],
    });

    await task.save();

    return res.status(200).json({
      message: "Task successfully created!",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, due_date } = req.body;

    const task = await Task.findOne({ _id: id, delete: false });

    if (status && ["TODO", "DONE"].includes(status)) task.status = status;
    if (due_date) {
      task.due_date = new Date(due_date);
      task.priority = calculatePriority(due_date);
    }

    const updatedTask = await task.save();

    return res.status(200).json({
      message: "Task successfully updated",
      updatedTask,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findOne({ _id: id, delete: false });

    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    task.delete = true;

    await task.save();

    return res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const { priority, due_date, status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (priority !== undefined) query.priority = priority;
    if (due_date !== undefined) query.due_date = new Date(due_date);
    if (status !== undefined) query.status = status;
    query.delete = false;

    const tasks = await Task.find(query)
      .sort({ due_date: "asc" })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.status(200).json({
      message: "success",
      tasks,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

