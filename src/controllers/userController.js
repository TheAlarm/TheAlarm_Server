const { query } = require('../../modules/dbModule');
const utils = require('../../modules/response')


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