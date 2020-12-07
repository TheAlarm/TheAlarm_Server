const { query } = require("../../modules/dbModule");
const utils = require("../../modules/response");
const axios = require("axios");
const { response } = require("express");
const request = require("request-promise");
const statusCode = require("../../modules/statusCode");
const responseMessage = require("../../modules/responseMessage");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require('../../config/config')


/**
 * 2020.12.06
 * 회원가입 API
 * /sign-up
 * request body : nickname, email, password
 * response body: token, userInfoIdx
 */
exports.signUp = async function (req, res) {
  try {
    const { nickname, email, password } = req.body;

    if (!nickname) return res.send(utils.successFalse(statusCode.NO_CONTENT, responseMessage.EMPTY_NICKNAME));
    if (!email) return res.send(utils.successFalse(statusCode.NO_CONTENT, responseMessage.EMPTY_EMAIL));
    if (!password) return res.send(utils.successFalse(statusCode.NO_CONTENT, responseMessage.EMPTY_PASSWORD));
    if (password.length < 4 || password.length > 10) return res.send(utils.successFalse(statusCode.INVALID_CONTENT, responseMessage.PASSWORD_RULE));

    const hashedPwd = await crypto.createHash("sha512").update(password).digest("hex");

    const signUpUserResult = await query(
      `INSERT INTO userInfo (nickname, email, password, type) VALUES (?, ?, ?, ?)`, [nickname, email, hashedPwd, "local"]
    );
    const userInfoIdx = signUpUserResult.insertId

    //토큰 생성
    let token = await jwt.sign(
      {
        userInfoIdx: userInfoIdx,
        id: nickname,
      }, // 토큰의 내용(payload)
      config.SECRET_ACCESS_KEY, // 비밀 키
      {
        expiresIn: "365d",
        subject: "userInfo",
      } // 유효 시간은 365일
    );
    return res.send(utils.successTrue(statusCode.OK, responseMessage.SIGN_UP_SUCCESS, {token, userInfoIdx}));

  } catch (err) {
    return res.send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR,`Error: ${err.message}`));
  }
};

exports.signIn = async function (req, res) {
  console.log("로그인 API");
  return res.send(utils.successTrue(200, "로그인 성공"));
};
exports.kakaoLogin = async function (req, res) {
  const kakaoAccessToken =
    "H6_cvTCjmseeELUf__zujvoF0EmEJpAQnHX3OQopb7kAAAF2NB6RVw";
  const options = {
    method: "GET",
    uri: "https://kapi.kakao.com/v2/user/me",
    json: true,
    headers: {
      Authorization: `Bearer ${kakaoAccessToken}`,
    },
  };

  try {
    const userInfo = await request(options);

    console.log(userInfo);

    //return { accessToken };
  } catch (e) {
    throw e;
  }
};

exports.kakao = async function (req, res) {
  const REST_API_KEY = "a989cd90aa0be7eac5f9315560bd8b75";
  const REDIRECT_URI = "http://localhost:3232/user/kakao-redirect";
  console.log("들어오긴하는데");

  const options = {
    method: "GET",
    uri: "https://kauth.kakao.com/oauth/authorize",
    json: true,
    qs: {
      client_id: `${REST_API_KEY}`,
      redirect_uri: `${REDIRECT_URI}`,
      response_type: "code",
    },
  };

  const login = await request(options, function (err, response, body) {
    console.log("callback");
  });

  // await axios.get(`https://kauth.kakao.com/oauth/authorize?client_id=a989cd90aa0be7eac5f9315560bd8b75&redirect_uri=http://localhost:3232/user/kakao-redirect&response_type=code`,{
  //     headers: { 'content-type': 'application/x-www-form-urlencoded' },
  // })
  // .then(function (response){
  //     //console.log(response)
  //   }).catch(function (err){
  //       console.log(err)
  //       console.log("에러안나는데")
  //   })
  //   console.log("왜 악시오시가 안대?")
  // https://kauth.kakao.com/oauth/authorize?client_id=a989cd90aa0be7eac5f9315560bd8b75&redirect_uri=http://localhost:3232/user/kakao-redirect&response_type=code
};

exports.kakaoRedirect = async function (req, res) {
  const code = req.query.code;
  console.log("코드다");
  console.log(code);

  const REST_API_KEY = "a989cd90aa0be7eac5f9315560bd8b75";
  const REDIRECT_URI = "http://localhost:3232/user/kakao-redirect";

  // 리퀘스트 모듈
  const options = {
    method: "post",
    uri: "https://kauth.kakao.com/oauth/token",
    body: {
      grant_type: "authorization_code",
      client_id: REST_API_KEY,
      redirect_uri: REDIRECT_URI,
      code: code,
      client_secret: "1TN0Nj02h6FY42Xqy51y4YyAPSbf9849",
    },
  };

  await request(options, (error, response, body) => {
    console.log(body);
  });

  ///사용자 인증
  // await axios({
  //     method: 'post',
  //     url :'https://kauth.kakao.com/oauth/token',
  //     data : {
  //         code: `${code}`,
  //         grant_type: "authorization_code",
  //         client_id: REST_API_KEY,
  //         redirect_uri: REDIRECT_URI,
  //         client_secret: "1TN0Nj02h6FY42Xqy51y4YyAPSbf9849"
  //     },
  //     headers: { 'Content-type': 'application/x-www-form-urlencoded' },
  // }).then(function (response) {
  //     console.log("여기왔는데");
  //     //console.log(response);
  //     //console.log(response.data);
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   });

  return res.send(utils.successTrue(200, `카카오 리다이렉트 성공`));
};
