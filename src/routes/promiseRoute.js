module.exports = function(app){
    const promise = require('../controllers/promiseController');

    app.get('/app/promise-list', promise.getPromiseAll); 
};     