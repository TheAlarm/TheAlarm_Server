const express = require("express");
const router = express.Router();
const promise = require('../controllers/promiseController');
const jwtMiddleware = require('../../modules/jwtMiddleware')

router.get("/app/promise-list", jwtMiddleware, promise.getAllPromise);
router.post("/app/promise", promise.postPromise);

module.exports = router;