// const { logger } = require('../../../config/winston');
const { query } = require('../../modules/dbModule');
const utils = require('../../modules/response');
const statusCode = require('../../modules/statusCode');
const responseMessage = require('../../modules/responseMessage');

/**
 * 2020.11.21
 * 다짐목록 조회
 */
exports.getAllPromise = async function (req, res) {
    console.log("다짐목록 조회 API");

    try {
        const getAllPromiseQuery = `SELECT * FROM promise`;
        const result = await query(getAllPromiseQuery);

        const promiseList = new Array();

        for (var i = 0; i < result.length; i++) {
            promiseList.push(result[i].promise);
        }

        const json = utils.successTrue(200, "다짐목록 조회", promiseList);

        return res.status(statusCode.OK).send(json);
    } catch (err) {
        console.log(err);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }
    // return res.send(utils.successFalse(400, "유저아이디가 존재하지않습니다."));
}

exports.postPromise = async function (req, res) {
    console.log("다짐 쓰기 API");

    try {
        const {
            promise
        } = req.body;



        if (!promise) {
            return res.send(utils.successFalse(400, "다짐을 작성해주세요"));
        }
    } catch (err) {
        console.log(err);
    }

}