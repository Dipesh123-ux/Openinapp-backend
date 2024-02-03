const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isauth");

const { createUser } = require("../controllers/user");

router.use(isAuth);

router.post("/create", createUser);

module.exports = router;
