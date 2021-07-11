const jwt = require("jsonwebtoken");
const { query } = require("./dbModule");
const crypto = require("crypto");
const config = require("../config/config");
const utils = require("./response");
const statusCode = require("./statusCode");

async function generateToken(userIdx, id) {
    let token = await jwt.sign(
        {
            userIdx: userIdx,
            id: id,
        }, // 토큰의 내용(payload)
        config.SECRET_ACCESS_KEY, // 비밀 키
        {
            expiresIn: "365d",
            subject: "userInfo",
        } // 유효 시간은 365일
    );
    console.log(token);
    return token;
}

async function cryptoPassword(password) {
    return await crypto
        .createHash("sha512")
        .update(password)
        .digest("hex");
}

async function getUserByKakaoId(id) {
    const result = await query(
        `SELECT * FROM userInfo WHERE email = ?`,
        [id]
    );

    if (result.length == 0) {
        return null
    }

    return result[0]
}

async function getUserByEmail(email) {
    const result = await query(
        `SELECT * FROM userInfo WHERE email = ?`,
        [email]
    );

    if (result.length == 0) {
        return null
    }

    return result[0]
}

async function getUserById(userIdx) {
    const result = await query(
        `SELECT * FROM userInfo WHERE userIdx = ?`,
        [userIdx]
    );

    if (result.length == 0) {
        return null
    }

    return result[0]
}

function successUser(token, user, message) {
    return utils.successTrue(statusCode.OK, message, {
        token: token,
        userIdx: user.userIdx,
        nickname: user.nickname,
        email: user.email,
        password: user.password,
        type: user.type,
        profile: user.profile,
        createdAt: user.createdAt
    });
}

module.exports = { generateToken, cryptoPassword, getUserByKakaoId, getUserByEmail, getUserById, successUser };