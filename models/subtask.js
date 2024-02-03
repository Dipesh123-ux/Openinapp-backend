const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subTaskSchema = new Schema(
  {
    task_id: {
      type: mongoose.Schema.ObjectId,
      ref: "Task",
      required: true,
    },
    status: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    delete: {
      type: Boolean,
      default: false,
    },
    deleted_at: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subtask", subTaskSchema);
