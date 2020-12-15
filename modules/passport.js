
var facebookCredentials = require('../config/loginKey').facebook;

module.exports = function (app) {
    var passport = require('passport'),
        FacebookStrategy = require('passport-facebook').Strategy;

    passport.use(new FacebookStrategy({
        clientID: facebookCredentials.clientId,
        clientSecret: facebookCredentials.secretId,
        callbackURL: facebookCredentials.callbackUrl
        },
        
        function(accessToken, refreshToken, profile, done) {
            // db에 저장?
            console.log('FacebookStrategy', accessToken, refreshToken, profile);
        }
    ));

    return passport;
};