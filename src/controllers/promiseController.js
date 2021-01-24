// const { logger } = require('../../../config/winston');
const { query } = require('../../modules/dbModule');
const utils = require('../../modules/response');
const statusCode = require('../../modules/statusCode');
const responseMessage = require('../../modules/responseMessage');
const moment = require('moment');

/**
 * [GET] /app/promise-list
 * @author ChoSooMin
 */
exports.getAllPromise = async function (req, res) {
    console.log("다짐목록 조회 API");

    try {
        const {
            date, page
        } = req.query;

        if (!date && !page) { // 둘 다 없으면 다짐 목록 전체 조회
            const getAllPromiseQuery = `SELECT userInfo.profile, userInfo.nickname, promise.promiseIdx, promise.createdAt, promise.promise, promise.public FROM promise JOIN userInfo ON promise.userIdx = userInfo.userIdx`;
            const result = await query(getAllPromiseQuery);

            const json = utils.successTrue(200, "다짐목록 조회", result);

            return res.status(statusCode.OK).send(json);
        }
        else { // 둘 중 하나 있을 경우(date만 있을 경우)
            if (!page || page == 0) { // page 쿼리를 입력하지 않거나 0으로 입력하면 전체 목록을 보여준다. (페이징 해서 보내지 않음) -> 날짜만 있을 경우
                const getDatePromiseListQuery = `SELECT userInfo.profile, userInfo.nickname, promise.promiseIdx, promise.createdAt, promise.promise, promise.public FROM promise JOIN userInfo ON promise.userIdx = userInfo.userIdx WHERE DATE(promise.createdAt) = ?`;
    
                const result = await query(getDatePromiseListQuery, [date]);
                const json = utils.successTrue(statusCode.OK, "날짜별 다짐 목록 전체 조회", result);

                return res.status(statusCode.OK).send(json);
            }
            else { // 페이징 처리
                const getDatePromiseListQuery = `SELECT userInfo.profile, userInfo.nickname, promise.promiseIdx, promise.createdAt, promise.promise, promise.public FROM promise JOIN userInfo ON promise.userIdx = userInfo.userIdx WHERE DATE(promise.createdAt) = ? ORDER BY promise.promiseIdx LIMIT ? OFFSET ?`;
    
                const result = await query(getDatePromiseListQuery, [date, 10, (page - 1) * 10]);
                const json = utils.successTrue(statusCode.OK, "날짜별 다짐 목록 전체 조회(페이징)", result);

                return res.status(statusCode.OK).send(json);
            }
        }
    } catch (err) {
        console.log(err);
        
        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }
};

/**
 * [GET] /app/promise-list/:date/:page
 * @author ChoSooMin
 */
exports.getDatePromiseList = async function (req, res) {
    console.log("날짜별 다짐 목록 조회 API");

    try {
        const {
            date, page
        } = req.query;

        if (!date || !page) {
            res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, "날짜와 페이징 인덱스를 입력해주세요"));
        }

        if (page == 0) {
            const getDatePromiseListQuery = `SELECT userInfo.profile, userInfo.nickname, promise.promiseIdx, promise.createdAt, promise.promise, promise.public FROM promise JOIN userInfo ON promise.userIdx = userInfo.userIdx WHERE DATE(promise.createdAt) = ?`;

            const result = await query(getDatePromiseListQuery, [date]);
            const json = utils.successTrue(200, "날짜별 다짐 목록 전체 조회", result);

            return res.status(statusCode.OK).send(json);
        }
        else { // 페이징 처리
            const getDatePromiseListQuery = `SELECT userInfo.profile, userInfo.nickname, promise.promiseIdx, promise.createdAt, promise.promise, promise.public FROM promise JOIN userInfo ON promise.userIdx = userInfo.userIdx WHERE DATE(promise.createdAt) = ? ORDER BY promise.promiseIdx LIMIT ? OFFSET ?`;

            const result = await query(getDatePromiseListQuery, [date, (page - 1) * 10]);
            const json = utils.successTrue(200, "날짜별 다짐 목록 전체 조회(페이징)", result);

            return res.status(statusCode.OK).send(json);
        }
    } catch (err) {
        console.log(err);

        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }
};

/**
 * 
 * [POST] /app/promise
 * @author ChoSooMin
 * @header token
 * @body promise, public
 */
exports.postPromise = async function (req, res) {
    console.log("다짐 쓰기 API");

    try {
        const {
            promise,
            public
        } = req.body;
        
        const userIdx = req.verifiedToken.userIdx; // token으로부터 userIdx 받아오기

        const postPromiseQuery = `INSERT INTO promise(promise, createdAt, public, userIdx) VALUES (?, ?, ?, ?)`;
        const date = Date.now();
        const curTime = moment(date).format('YYYY-MM-DD HH:mm:ss'); // 현재 시간을 등록시간으로 보낸다.

        const result = await query(postPromiseQuery, [promise, curTime, public, userIdx]);

        if (!result) {
            return res.status(statusCode.BAD_REQUEST).send(utils.successFalse(statusCode.BAD_REQUEST, "다짐 작성 실패"));
        }
        
        return res.status(statusCode.CREATED).send(utils.successTrue(statusCode.CREATED, "다짐 작성 성공")); // @TODO result를 뺄까 말까?
        
    } catch (err) {
        console.log(err);

        return res.status(statusCode.INTERNAL_SERVER_ERROR).send(utils.successFalse(statusCode.INTERNAL_SERVER_ERROR, responseMessage.INTERNAL_SERVER_ERROR));
    }
};