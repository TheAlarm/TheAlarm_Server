// const { query } = require('../../../config/database');
// const { logger } = require('../../../config/winston');
const utils = require('../../modules/response')

/**
 * 2020.11.23
 * 회원가입 API
 */
exports.signUp = async function (req, res) {
    console.log("회원가입 API")
    return res.send(utils.successTrue(200, "회원가입 성공"));
}

exports.signIn = async function (req, res) {
    console.log("로그인 API")
    return res.send(utils.successTrue(200, "로그인 성공"));
}