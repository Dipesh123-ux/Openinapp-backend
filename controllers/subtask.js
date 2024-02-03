const Subtask = require("../models/subtask");
const Task = require("../models/task");

exports.createSubtask = async (req, res) => {
  try {
    const { taskId } = req.body;

    if (!taskId) {
      return res.status(404).json({ message: "Please enter taskId" });
    }

    const task = await Task.findOne({ _id: taskId, delete: false });

    if (!task) {
      return res.status(404).json({ message: "Task does not exist" });
    }

    const subtask = new Subtask({
      task_id: taskId,
    });

    await subtask.save();

    return res.status(200).json({ message: "Subtask successfully created" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateSubTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (![0, 1].includes(status)) {
      return res
        .status(400)
        .json({ error: "Invalid status value. It should be 0 or 1." });
    }

    const subTask = await Subtask.findOne({ _id: id, delete: false });

    if (!subTask) {
      return res.status(404).json({ error: "SubTask not found." });
    }

    const task = await Task.findOne({ _id: subTask.task_id, delete: false });
    if (!task) {
      subTask.delete = true;
      await subTask.save();
      return res.status(404).json({ error: "Parent Task not found." });
    }

    subTask.status = status;
    await subTask.save();

    const subTasks = await Subtask.find({ task_id: task._id });
    const allSubTasksCompleted = subTasks.every(
      (subTask) => subTask.status === 1
    );

    if (allSubTasksCompleted) {
      task.status = "DONE";
    } else if (subTasks.some((subTask) => subTask.status === 1)) {
      task.status = "IN_PROGRESS";
    } else {
      task.status = "TODO";
    }

    await task.save();

    res
      .status(200)
      .json({ message: "success", subTask: subTask, parentTask: task });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteSubTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Soft delete the subtask
    const deletedSubTask = await Subtask.findOne({ _id: id, delete: false });

    if (!deletedSubTask) {
      return res.status(404).json({ error: "SubTask not found." });
    }

    deletedSubTask.delete = true;
    deletedSubTask.deleted_at = new Date();

    await deletedSubTask.save();

    // Check if all subtasks of the parent task are deleted
    const task = await Task.findById(deletedSubTask.task_id);
    if (!task) {
      return res.status(404).json({ error: "Parent Task not found." });
    }

    const subTasks = await Subtask.find({ task_id: task._id });
    const allSubTasksDeleted = subTasks.every((subTask) => subTask.delete);

    // Soft delete the parent task if all subtasks are deleted
    if (allSubTasksDeleted) {
      task.delete = true;
      await task.save();
    }

    return res.status(200).json({
      message : "Subtask deleted successfully"
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllSubTasks = async (req, res) => {
  try {
    const { task_id } = req.query;

    const subTasks = await Subtask.find({ task_id: task_id, delete: false });

    return res.status(200).json({
      message: "success",
      subTasks,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
