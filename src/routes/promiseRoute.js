const express = require("express");
const router = express.Router();
const promise = require('../controllers/promiseController');
const jwtMiddleware = require('../../modules/jwtMiddleware')

router.get("/app/promise-list", jwtMiddleware, promise.getAllPromise); // 다짐목록 조회 (get)
router.post("/app/promise", jwtMiddleware, promise.postPromise); // 다짐 작성 (post)

module.exports = router;