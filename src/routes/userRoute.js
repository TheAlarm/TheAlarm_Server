const express = require("express");
const router = express.Router();
const user = require('../controllers/userController');
// const passport = require('../../modules/passport');
const facebookCredentials = require('../../config/loginKey').facebook;

router.post("/sign-up", user.signUp);
router.post("/sign-in", user.signIn);

// router.get("/user/kakao", user.kakao);                   // 인가코드, 토큰 만들기
router.post("/kakao", user.kakaoLogin);                     // 토큰 받아서 회원가입 시키기
router.get("/user/kakao-redirect", user.kakaoRedirect);     //리다리렉션 코드

router.get('/user/facebook', user.route);
router.get('/user/facebook-redirect', user.facebookRedirect);
router.get('/me', user.me);

module.exports = router;