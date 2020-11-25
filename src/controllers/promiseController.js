// const { logger } = require('../../../config/winston');
const { query } = require('../../modules/dbModule');
const utils = require('../../modules/response');
const statusCode = require('../../modules/statusCode');
const responseMessage = require('../../modules/responseMessage');
const moment = require('moment');

/**
 * 2020.11.21
 * 다짐목록 조회
 */
/**
 * @swagger
 * definitions:
 *  boardItem:
 *   type: object
 *   required:
 *     - boardTitle
 *     - boardContent
 *     - boardState
 *     - boardType
 *   properties:
 *     id:
 *       type: integer
 *       description: ObjectId
 *     boardTitle:
 *       type: string
 *       description: 게시글 제목
 *     boardContent:
 *       type: string
 *       description: 게시글 내용
 *     boardState:
 *       type: boolean
 *       description: 게시글 숨김상태여부
 *     boardType:
 *       type: string
 *       description: 게시글 타입
 */

/**
 * @swagger
 *  /app/promise-list:
 *    get:
 *      tags:
 *      - Promise
 *      description: 다짐 목록을 조회한다
 *      produces:
 *      - application/json
 *      parameters:
 *      responses:
 *       200:
 *        description: board of column list
 *        schema:
 *          type: array
 *          items:
 *           $ref: '#/definitions/boardItem'
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

/**
 * 
 * @TODO userIdx 받아와서 넘겨야 함 (수민)
 */
exports.postPromise = async function (req, res) {
    console.log("다짐 쓰기 API");

    try {
        const {
            promise,
            public
        } = req.body;

        const postPromiseQuery = `INSERT INTO promise(promise, createdAt, public, userIdx) VALUES (?, ?, ?, ?)`;
        const date = Date.now();
        const curTime = moment(date).format('YYYY-MM-DD HH:mm:ss');

        const result = await query(postPromiseQuery, [promise, curTime, public, 1]);

        if (!result) {
            return res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, "다짐 작성 실패"));
        }
        
        return res.status(statusCode.OK).send(utils.successTrue(statusCode.OK, responseMessage.OK, promise));
        
    } catch (err) {
        console.log(err);

        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }

}