const { query } = require("../../modules/dbModule");
const utils = require("../../modules/response");
const axios = require("axios");
const { response } = require("express");
const request = require("request-promise");
const statusCode = require("../../modules/statusCode");
const responseMessage = require("../../modules/responseMessage");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../../config/config");
const facebookCredentials = require("../../config/loginKey").facebook;
const queryString = require("querystring");
const { patch } = require("../routes/userRoute");

/**
 * 2020.12.06
 * 회원가입 API
 * /sign-up
 * request body : nickname, email, password
 * response body: token, userInfoIdx
 */
exports.signUp = async function (req, res) {
  const { nickname, email, password } = req.body;

  //body 값 확인
  if (!nickname)
    return res.send(
      utils.successFalse(statusCode.NO_CONTENT, responseMessage.EMPTY_NICKNAME)
    );
  if (!email)
    return res.send(
      utils.successFalse(statusCode.NO_CONTENT, responseMessage.EMPTY_EMAIL)
    );
  // TODO: 이메일 정규식 추가하기
  // if (!password)
  //   return res.send(
  //     utils.successFalse(statusCode.NO_CONTENT, responseMessage.EMPTY_PASSWORD)
  //   );
  if (password.length < 4 || password.length > 10)
    return res.send(
      utils.successFalse(
        statusCode.INVALID_CONTENT,
        responseMessage.PASSWORD_RULE
      )
    );
  try {
    // 이메일 중복 확인
    const getUserEmailResult = await query(
      `SELECT email FROM userInfo WHERE email = ?`,
      [email]
    );
    if (getUserEmailResult.length > 0)
      return res.send(
        utils.successFalse(
          statusCode.INVALID_CONTENT,
          responseMessage.DUPLICATE_EMAIL
        )
      );

    const hashedPwd = await crypto
      .createHash("sha512")
      .update(password)
      .digest("hex");

    const signUpUserResult = await query(
      `INSERT INTO userInfo (nickname, email, password, type) VALUES (?, ?, ?, ?)`,
      [nickname, email, hashedPwd, "local"]
    );

    //토큰 생성
    const userIdx = signUpUserResult.insertId;
    let token = await jwt.sign(
      {
        userIdx: userIdx,
        id: nickname,
      }, // 토큰의 내용(payload)
      config.SECRET_ACCESS_KEY, // 비밀 키
      {
        expiresIn: "365d",
        subject: "userInfo",
      } // 유효 시간은 365일
    );
    return res.send(
      utils.successTrue(statusCode.OK, responseMessage.SIGN_UP_SUCCESS, {
        token,
        userIdx,
      })
    );
  } catch (err) {
    return res.send(
      utils.successFalse(
        statusCode.INTERNAL_SERVER_ERROR,
        `Error: ${err.message}`
      )
    );
  }
};

/**
 * 2020.12.06
 * 로그인 API
 * /sign-in
 * request body : email, password
 * response body: token, userInfoIdx, nickname, profile
 */
exports.signIn = async function (req, res) {
  try {
    const { email, password } = req.body;

    // body 값 체크
    if (!email)
      return res.send(
        utils.successFalse(statusCode.NO_CONTENT, responseMessage.EMPTY_EMAIL)
      );

    if (!password)
      return res.send(
        utils.successFalse(
          statusCode.NO_CONTENT,
          responseMessage.EMPTY_PASSWORD
        )
      );

    // 로그인 확인
    const getUserResult = await query(
      `SELECT userIdx, nickname, email, password, profile FROM userInfo WHERE email = ?`,
      [email]
    );

    // 이메일이 존재할 경우
    if (getUserResult.length >= 1) {

      const userIdx = getUserResult[0].userIdx;
      const nickname = getUserResult[0].nickname;
      const profile = getUserResult[0].profile;

      let token = await jwt.sign(
        {
          userIdx: userIdx,
          id: getUserResult[0].nickname,
        }, // 토큰의 내용(payload)
        config.SECRET_ACCESS_KEY, // 비밀 키
        {
          expiresIn: "365d",
          subject: "userInfo",
        } // 유효 시간은 365일
      );

      const hashedPwd = await crypto
        .createHash("sha512")
        .update(password)
        .digest("hex");


      if (getUserResult[0].password !== hashedPwd) {
        return res.send(
          utils.successFalse(
            statusCode.NO_CONTENT,
            responseMessage.WRONG_PASSWORD_EMAIL
          )
        );
      } else { 
        return res.send(
          utils.successTrue(statusCode.OK, responseMessage.SIGN_IN_SUCCESS, {
            token,
            userIdx,
            nickname,
            profile,
          })
        );
      }
      // 이메일이 존재하지 않을 경우
    } else {
      return res.send(
        utils.successFalse(
          statusCode.INVALID_CONTENT,
          responseMessage.NO_EXIST_USER
        )
      );
    }
  } catch (err) {
    return res.send(
      utils.successFalse(
        statusCode.INTERNAL_SERVER_ERROR,
        `Error: ${err.message}`
      )
    );
  }
};

exports.kakao = async function (req, res) {
  const options = {
    method: "GET",
    uri: "https://kauth.kakao.com/oauth/authorize",
    json: true,
    qs: {
      client_id: `${config.REST_API_KEY}`,
      redirect_uri: `${config.REDIRECT_URI}`,
      response_type: "code",
    },
  };

  const login = await request(options, function (err, response, body) {
    console.log("callback");
    console.log(body);
  });

  console.log(login);

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
  // https://kauth.kakao.com/oauth/authorize?client_id=a5bb3faff700411ecd5b1adc2c58e217&redirect_uri=http://localhost:3232/user/kakao-redirect&response_type=code
};

exports.kakaoRedirect = async function (req, res) {
  const code = req.query.code;
  console.log("코드다");
  console.log(code);

  // 리퀘스트 모듈
  const options = {
    method: "post",
    uri: "https://kauth.kakao.com/oauth/token",
    body: {
      grant_type: "authorization_code",
      client_id: config.REST_API_KEY,
      redirect_uri: config.REDIRECT_URI,
      code: code,
    },
  };

  // await request(options, (error, response, body) => {
  //   console.log(body);
  // });

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

/**
 * 2020.12.13
 * 카카오 로그인 API
 * /kakaoLogin
 * request header : Bearer {ACCESS_TOKEN}
 */

exports.kakaoLogin = async function (req, res) {
  const kakaoAccessToken = req.body.kakaoAccessToken;
  // const email = req.body.email;
  // const profile = req.body.profile;

  if (!kakaoAccessToken)
    return res.send(
      utils.successFalse(
        statusCode.NO_CONTENT,
        responseMessage.EMPTY_KAKAOTOKEN
      )
    );

  try {
    const options = {
      method: "GET",
      uri: "https://kapi.kakao.com/v2/user/me",
      json: true,
      headers: {
        Authorization: `Bearer ${kakaoAccessToken}`,
      },
    };
    const userInfo = await request(options);

    const check = await query(
      `SELECT userIdx, nickname, email, password FROM userInfo WHERE email = ?`,
      [userInfo.kakao_account.email]
    );
    let userIdx = 0;
    if (check.length !== 1) {
      // 새로운 유저 회원 가입
      console.log("새로운 유저 회원 가입");
      // const signUpUserResult = await query(
      //   `INSERT INTO userInfo (nickname, email, profile, type) VALUES (?, ?, ?, 'kakao')`,
      //   [
      //     userInfo.properties.nickname,
      //     userInfo.kakao_account.email,
      //     userInfo.properties.profile_image,
      //   ]
      // );

      // userIdx = signUpUserResult.insertId;

      return res.send(
        utils.successTrue(
          statusCode.CREATED,
          responseMessage.KAKAO_SIGNUP_SUCCESS,
          {
            nickname: userInfo.properties.nickname,
            email: userInfo.kakao_account.email,
          }
        )
      );
    } else {
      // 기존 회원 로그인
      console.log("기존 회원 로그인");
      userIdx = check[0].userIdx;
    }
    // 토큰 생성
    let token = await jwt.sign(
      {
        userIdx: userIdx,
        id: userInfo.properties.nickname,
      }, // 토큰의 내용(payload)
      config.SECRET_ACCESS_KEY, // 비밀 키
      {
        expiresIn: "365d",
        subject: "userInfo",
      } // 유효 시간은 365일
    );
    console.log(token);
    return res.send(
      utils.successTrue(statusCode.OK, responseMessage.KAKAO_LOGIN_SUCCESS, {
        token,
        userIdx,
      })
    );
  } catch (err) {
    return res.send(
      utils.successFalse(
        statusCode.INTERNAL_SERVER_ERROR,
        `Error: ${err.message}`
      )
    );
  }
};
/**
 * 2021.1.30
 * 내정보 수정 API
 * /user
 */
exports.profileEdit = async function (req, res) {
  const userIdx = req.verifiedToken.userIdx;
  const nickname = req.body.nickname;
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  if (!nickname)
    return res.send(
      utils.successFalse(statusCode.NOT_FOUND, responseMessage.EMPTY_NICKNAME)
    );

  if (!oldPassword)
    return res.send(
      utils.successFalse(
        statusCode.NOT_FOUND,
        responseMessage.EMPTY_PASSWORD_OLD
      )
    );

  try {
    const oldHashedPwd = await crypto
      .createHash("sha512")
      .update(oldPassword)
      .digest("hex");

    // 현재 닉네임과 비밀번호가 같은 유저가 1명이라면 비밀번호 변경
    const getUserResult = await query(
      `SELECT userIdx, nickname, email, password FROM userInfo WHERE password = ? AND userIdx = ?`,
      [oldHashedPwd, userIdx]
    );

    if (getUserResult.length == 1) {
      if (!newPassword) {
        return res.send(
          utils.successFalse(
            statusCode.NOT_FOUND,
            responseMessage.EMPTY_PASSWORD_NEW
          )
        );
      } else {
        const newHashedPwd = await crypto
          .createHash("sha512")
          .update(newPassword)
          .digest("hex");

        const updateNewPasswordResult = await query(
          `UPDATE userInfo SET password = ? ,nickname = ? WHERE userIdx = ? `,
          [newHashedPwd, nickname, getUserResult[0].userIdx]
        );

        const updateUserResult = await query(
          `SELECT nickname, profile FROM userInfo WHERE userIdx = ? `,
          [userIdx]
        );
        return res.send(
          utils.successTrue(
            statusCode.OK,
            responseMessage.USERINFO_EDIT_SUCCESS,
            updateUserResult[0]
          )
        );
      }
    } else {
      return res.send(
        utils.successFalse(
          statusCode.INVALID_CONTENT,
          responseMessage.WRONG_PASSWORD
        )
      );
    }
  } catch (err) {
    return res.send(
      utils.successFalse(
        statusCode.INTERNAL_SERVER_ERROR,
        `Error: ${err.message}`
      )
    );
  }
};

/**
 * 2021.1.31
 * 자동 로그인 API
 * /jwt
 */
exports.check = async function (req, res) {
  const result = req.verifiedToken.userIdx;

  return res.send(
    utils.successTrue(statusCode.OK, responseMessage.POSSIBLE_JWTTOKEN, {
      userIdx: result,
    })
  );
};

exports.facebook = async function (req, res) {
  console.log("페이스북 로그인");
  try {
    const { email, name, profile } = req.decoded;

    //
    const isExistUser = await query(
      `SELECT userIdx, nickname, email, password FROM userInfo WHERE email = ?`,
      [email]
    );
    let userIdx = 0;

    if (isExistUser.length !== 1) {
      // 새로운 유저 회원 가입
      console.log("새로운 유저 회원 가입(페북)");
      const signUpFbResult = await query(
        `INSERT INTO userInfo (nickname, email, profile, type) VALUES (?, ?, ?, ?)`,
        [name, email, profile, "facebook"]
      );

      userIdx = signUpFbResult.insertId;
    } else {
      // 기존 회원 로그인
      console.log("기존 회원 로그인(페북)");
      userIdx = isExistUser[0].userIdx;
    }

    // 토큰 생성
    let token = await jwt.sign(
      {
        userIdx: userIdx,
        id: name,
      }, // 토큰의 내용(payload)
      config.SECRET_ACCESS_KEY, // 비밀 키
      {
        expiresIn: "365d",
        subject: "userInfo",
      } // 유효 시간은 365일
    );

    console.log(token);
    return res.send(
      utils.successTrue(statusCode.OK, responseMessage.FACEBOOK_LOGIN_SUCCESS, {
        token,
        userIdx,
      })
    );
  } catch (err) {
    console.log(err);

    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(
        utils.successFalse(
          statusCode.INTERNAL_SERVER_ERROR,
          responseMessage.INTERNAL_SERVER_ERROR
        )
      );
  }
};

exports.editProfile = async function (req, res) {
  console.log(`프로필 이미지 변경`);

  try {
    const userIdx = req.verifiedToken.userIdx; // token으로부터 userIdx 받아오기
    var profileImg = ``;

    if (req.file) {
      console.log(req.file.location);
      profileImg = req.file.location;
    }

    if (profileImg == ``) {
      return res
        .status(statusCode.NO_CONTENT)
        .send(
          utils.successFalse(
            statusCode.NO_CONTENT,
            "프로필 사진을 선택해주세요"
          )
        );
    }

    const editProfileQuery = `UPDATE userInfo SET profile = ? WHERE userIdx = ?`;
    const result = await query(editProfileQuery, [profileImg, userIdx]);

    if (!result) {
      return res
        .status(statusCode.BAD_REQUEST)
        .send(
          utils.successFalse(statusCode.BAD_REQUEST, "프로필 사진 변경 실패")
        );
    }

    return res
      .status(statusCode.OK)
      .send(utils.successTrue(statusCode.OK, `프로필 사진 변경 성공`));
  } catch (err) {
    console.log(err);

    return res
      .status(statusCode.INTERNAL_SERVER_ERROR)
      .send(
        utils.successFalse(
          statusCode.INTERNAL_SERVER_ERROR,
          responseMessage.INTERNAL_SERVER_ERROR
        )
      );
  }
};
