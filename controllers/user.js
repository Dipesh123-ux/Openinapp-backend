const User = require("../models/user");

exports.createUser = async (req, res) => {
  try {
    const { phoneNumber, priority } = req.body;

    if (!phoneNumber || priority === undefined) {
      return res.status(400).json({
        message: "Please enter phone number and priority",
      });
    }

    if (![0, 1, 2].includes(priority)) {
      return res.status(400).json({
        message: "Please enter priority between 0 to 1",
      });
    }

    const user = new User({
      phoneNumber,
      priority,
    });

    await user.save();

    return res.status(200).json({
      message: "User successfully created!",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
