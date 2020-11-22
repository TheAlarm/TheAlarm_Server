const express = require("express");
const router = express.Router();
const user = require('../controllers/userController');

router.get("/app/sign-up", user.signUp);
router.get("/app/sign-in", user.signIp);

module.exports = router;