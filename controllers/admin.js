const Admin = require("../models/admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.adminSignup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }
    const alreadyExist = await Admin.findOne({ email: email });
    if (alreadyExist) {
      return res
        .status(400)
        .json({ message: "User with email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = new Admin({ email: email, password: hashedPassword });

    await admin.save();

    return res.status(200).json({ message: "Admin successfully created" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are mandatory" });
    }
    const admin = await Admin.findOne({ email: email });

    if (!admin) {
      return res.status(404).json({ message: "Email does not exist" });
    }

    const result = await bcrypt.compare(password, admin.password);

    if (result) {
      const token = jwt.sign(
        {
          admin: {
            _id: admin._id,
            email: admin.email,
          },
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );
      return res
        .status(200)
        .json({ token: token, message: "successfully logged-in" });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
