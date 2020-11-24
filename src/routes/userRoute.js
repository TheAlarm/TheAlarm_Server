const express = require("express");
const router = express.Router();
const user = require('../controllers/userController');

router.post("/sign-up", user.signUp);
//router.get("/sign-in", user.signIp);

module.exports = router;