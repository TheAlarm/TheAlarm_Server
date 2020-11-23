// const { query } = require('../../../config/database');
// const { logger } = require('../../../config/winston');
const { getMysqlPool } = require('../../modules/database');
const database = require('../../modules/database');
const utils = require('../../modules/response')

/**
 * 2020.11.21
 * 다짐목록 조회
 */
exports.getPromiseAll = async function (req, res) {
    console.log("다짐목록 조회 API")

    try {
        const getPromiseAllQuery = `SELECT * FROM promise`
        const result = await database.startTransaction(getPromiseAllQuery)

        if (result.status == "success") {
            return res.send(utils.successTrue(200, result.status, result.connection));
        }
        return res.send(utils.successTrue(200, "조회 성공", ))
    } catch (err) {
        console.log(err)
    }
    // return res.send(utils.successFalse(400, "유저아이디가 존재하지않습니다."));
}

exports.postPromise = async function (req, res) {
    console.log("다짐 쓰기 API")

    try {
        const {
            promise
        } = req.body

        if (!promise) {
            return res.send(utils.successFalse(400, "다짐을 작성해주세요"))
        }

        // const insertPromiseQuery = `INSERT INTO promise (promise, createdAt, public, userIdx) VALUES ?`
        // database.query(insertPromiseQuery, [])
    } catch (err) {
        console.log(err)
    }

}