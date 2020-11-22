const express = require("express");
const router = express.Router();
const promise = require('../controllers/promiseController');

router.get("/app/promise-list", promise.getPromiseAll);

module.exports = router;