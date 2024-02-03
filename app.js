require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Task = require("./models/task");
const calculatePriority = require("./common/calculatePriority");
const cron = require("node-cron");
const User = require("./models/user");
const initiateCall = require("./common/initiateCall");
const EventEmitter = require("events");


const callEventEmitter = new EventEmitter();

const app = express();

const PORT = 8080 || process.env.PORT;

app.use("*", cors());
app.use(express.json());

app.use("/callback", (req, res) => {
  const status = req.body.CallStatus;
  switch (status) {
    case "completed":
      console.log("Call completed");
      callEventEmitter.emit("completed");
      break;
    case "answered":
      console.log("Call answered");
      callEventEmitter.emit("answered");
      break;
  }
  res.status(200).end();
});

const adminRoutes = require("./routes/admin");
const userRoutes = require("./routes/user");
const taskRoutes = require("./routes/task");
const subtaskRoutes = require("./routes/subtask");

app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/task", taskRoutes);
app.use("/api/subtask", subtaskRoutes);

//cron job for updating the priority on the basis of due date

cron.schedule("0 0 0 * * *", async () => {
  try {
    const tasks = await Task.find();
    tasks.forEach(async (task) => {
      const upadatedPriority = calculatePriority(task.due_date);
      await Task.findByIdAndUpdate(task._id, { priority: upadatedPriority });
    });

    console.log("Priority update cron job executed successfully.");
  } catch (error) {
    console.error("Error in priority update cron job:", error);
  }
});

//cron job for calling the users
cron.schedule("0 0 * * *", async () => {
  try {
    const tasks = await Task.find({
      priority: 0,
      is_delete: false,
    });

    for (const task of tasks) {
      const users = await User.find({});

      // Sorting based upon
      users.sort((a, b) => a.priority - b.priority);

      for (const user of users) {
        await initiateCall(user.phoneNumber, `Task overdue: ${task.title}`);
        console.log(`Voice call made to user`);

        let answered = false;

        await Promise.race([
          new Promise((resolve) =>
            callEventEmitter.once("answered", () => {
              answered = true;
              resolve();
            })
          ),
          new Promise((resolve) => callEventEmitter.once("completed", resolve)),
        ]);

        console.log(`Call answered or completed for user ${user._id}`);

        // Break out of the loop if the call is answered
        if (answered) {
          console.log(`Breaking out of the loop for user ${user._id}`);
          break;
        }
      }
    }

    console.log("Voice calling cron job executed successfully.");
  } catch (error) {
    console.error("Error in voice calling cron job:", error);
  }
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("connected to db");
  });

app.listen(PORT, () => {
  console.log("listening on port" + PORT)
})
