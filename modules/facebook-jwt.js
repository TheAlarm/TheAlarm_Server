var request = require('request');
const responseMessage = require('./responseMessage');
const statusCode = require('./statusCode');
const utils = require('./response');

module.exports = (req, res, next) => {
    const { fbAccessToken } = req.body;
    var api_url = 'https://graph.facebook.com/me?access_token=' + fbAccessToken + '&fields=email,name,picture';
    var options = {
        url: api_url
    };

    if (!fbAccessToken) {
        return res.send(utils.successFalse(statusCode.NO_CONTENT, responseMessage.EMPTY_FBTOKEN));
    }

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            var data = JSON.parse(body);

            req.decoded = {
                email: data.email,
                name: data.name,
                profile: data.picture.data.url
            };

            next();
        }
        else {
            return res.send(utils.successFalse(statusCode.BAD_REQUEST, responseMessage.INVALID_TOKEN));
        }
    });
}