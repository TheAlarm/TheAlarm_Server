const express = require("express");
const router = express.Router();
const promise = require('../controllers/promiseController');
const jwtMiddleware = require('../../modules/jwtMiddleware');

// 다짐 목록 조회는 토큰 없이 가능
router.get("/app/promise-list", promise.getAllPromise); // 다짐목록 전체 조회 (get)
router.post("/app/promise", jwtMiddleware, promise.postPromise); // 다짐 작성 (post)
router.get("/app/promise-list/:date/:page", promise.getDatePromiseList); // 날짜별 다짐목록 조회_페이징 처리(get)
router.get("/app/my-promise-list", jwtMiddleware, promise.getMyPromise); // 다짐 작성 (post)

module.exports = router;