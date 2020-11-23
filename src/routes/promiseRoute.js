const express = require("express");
const router = express.Router();
const promise = require('../controllers/promiseController');

router.get("/app/promise-list", promise.getPromiseAll);
router.post("/app/promise", promise.postPromise);

module.exports = router;