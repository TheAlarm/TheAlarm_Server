const express = require("express");
const router = express.Router();
const user = require('../controllers/userController');

router.post("/sign-up", user.signUp);
//router.get("/sign-in", user.signIp);
router.get("/v2/user/me", user.kakao);
router.get("/user/kakao-redirect", user.kakaoRedirect);



module.exports = router;