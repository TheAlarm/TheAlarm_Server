// const { query } = require('../../../config/database');
// const { logger } = require('../../../config/winston');
const utils = require('../../modules/response')

/**
 * 2020.11.21
 * 다짐목록 조회
 */
exports.getPromiseAll = async function (req, res) {
    console.log("다짐목록 조회 API")
    return res.send(utils.successFalse(400, "유저아이디가 존재하지않습니다."));
}