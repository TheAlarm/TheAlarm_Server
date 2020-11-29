const { query } = require('../../modules/dbModule');
const utils = require('../../modules/response');
const axios = require('axios');
const { response } = require('express');


/**
 * 2020.11.23
 * 회원가입 API
 */
exports.signUp = async function (req, res) {
    const result = await query(`INSERT INTO userInfo (name, email, type) VALUES ('혀녀이','hy@gmail.com', 'kakao')`);
    console.log("회원가입 API")

    return res.send(utils.successTrue(200, "회원가입 성공", result));
}

exports.signIn = async function (req, res) {
    console.log("로그인 API")
    return res.send(utils.successTrue(200, "로그인 성공"));
}

exports.kakao = async function (req, res) {

    //클라에서 인가코드 받는 것을 구현할 수도 있는데 서버에서 처리 해줌
    const REST_API_KEY = 'a989cd90aa0be7eac5f9315560bd8b75';
    const REDIRECT_URI = 'http://localhost:3232/user/kakao-redirect'

    const result = await axios.get('https://kauth.kakao.com/oauth/authorize', {
        params: {
            client_id : REST_API_KEY,
            redirect_uri : REDIRECT_URI,
            response_type :'code'
        }
      }).then(function (response){
        //console.log(response)
      }).catch(function (err){
          console.log(err)
      })
    
    
   // axios.get(`https://kauth.kakao.com/oauth/authorize?client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}&response_type=code`)
    // .then(function (response){
    //     //console.log(response)
    //     console.log(response.)
    // }).catch(function (err){
    //     console.log(err)
    // })

    https://kauth.kakao.com/oauth/authorize?client_id=a989cd90aa0be7eac5f9315560bd8b75&redirect_uri=http://localhost:3232/user/kakao-redirect&response_type=code
    ///oauth/authorize?client_id={REST_API_KEY}&redirect_uri={REDIRECT_URI}&response_type=code

   //console.log(`result : ${result}`)

    console.log(result)

  //return res.send(utils.successTrue(200, "로그인 성공"));
}

exports.kakaoRedirect = async function (req, res) {

    const code = req.query.code
    const REST_API_KEY = 'a989cd90aa0be7eac5f9315560bd8b75';
    const REDIRECT_URI = 'http://localhost:3232/user/kakao-redirect'
    console.log(code)

    console.log("카카오 리다이렉트 API")

    ///사용자 인증
    
    
    await axios({
        method: 'post',
        url :'https://kauth.kakao.com/oauth/token',
        data : {
            code: code,
            grant_type: "authorization_code",
            client_id: REST_API_KEY,
            redirect_uri: REDIRECT_URI,
           // client_secret: "1TN0Nj02h6FY42Xqy51y4YyAPSbf9849"
        },
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
    }).then(function (response) {
        console.log("rrspon");
        console.log(response);
      })
      .catch(function (err) {
        console.log(err);
      });

    return res.send(utils.successTrue(200, `카카오 리다이렉트 성공`));
}