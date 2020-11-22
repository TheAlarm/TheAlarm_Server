var express = require('express');
var router = express.Router();

router.use("/", require("./promiseRoute"));
// router.use("/", require("./userRoute"));

module.exports = router;