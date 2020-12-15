const express = require("express");
const router = express.Router();
const user = require('../controllers/userController');
// const passport = require('../../modules/passport');
var facebookCredentials = require('../../config/loginKey').facebook;

router.post("/sign-up", user.signUp);
router.post("/sign-in", user.signIn);

// router.get("/user/kakao", user.kakao);                   // 인가코드, 토큰 만들기
router.post("/kakao", user.kakaoLogin);                     // 토큰 받아서 회원가입 시키기
router.get("/user/kakao-redirect", user.kakaoRedirect);     //리다리렉션 코드

var passport = require('passport'),
        FacebookStrategy = require('passport-facebook').Strategy;

    passport.use(new FacebookStrategy({
        clientID: facebookCredentials.clientId,
        clientSecret: facebookCredentials.secretId,
        callbackURL: facebookCredentials.callbackUrl
        },
        
        function(accessToken, refreshToken, profile, done) {
            // db에 저장?
            // 성공적으로 Wooly에 로그인이 되었음
            // accessToken 값을 서버에 저장?
            // console.log('FacebookStrategy', accessToken, refreshToken, profile);
            console.log('FacebookStrategy', 'accessToken = ' + accessToken, 'displayName = ' + profile.displayName);
        }
    ));

router.get('/auth/facebook', passport.authenticate('facebook'));
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        successRedirect: '/',
        failureRedirect: 'auth/login'
    })
);

module.exports = router;