const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const authMiddleware = require('../middlewares/auth-middleware')
const models = require('../models')

// 회원가입 API
router.post('/join', async (req, res) => {
    try {
        const {email, password, nickname} = req.body
        // password 암호화
        const encryptedPassword = bcrypt.hashSync(password, 10)
        await models.User.create({email, password: encryptedPassword, nickname})
        res.status(200).json({
            msg: '회원가입 완료!'
        })
    } catch (err) {
        res.status(400).json({
            errorMessage: '확인 후 다시 입력해주세요.'
        })
    }
})

// 로그인 API
router.post('/login', async (req, res) => {
    try {
        const {email, password} = req.body
        // 유저 이메일 찾기
        const check = await models.User.findOne({
            raw: true,
            where: {
                email,
            }
        })

        // 유저 이메일
        const check_email = check.email

        // 암호화된 패스워드 찾기
        const hash_password = await models.User.findOne({
            raw: true,
            where: {
                email
            }
        })

        // 입력받은 패스워드와 암호화된 패스워드 비교
        const checkPassword = bcrypt.compareSync(password, hash_password.password)

        // 토큰생성
        const token = jwt.sign({user_email: check_email}, 'my-secret-key')
        if (check_email === email && checkPassword === true) {
            return res.status(200).json({
                // 토큰도 넘겨주기
                token,
                msg: '로그인 성공!'
            })
        }
    } catch (err) {
        res.status(400).json({
            errorMessage: '입력창을 다시 확인해 주세요.'
        })
    }
})

// 유저정보 확인 API
router.get('/api/users/me', authMiddleware, (req, res) => {
    const {user} = res.locals
    res.json({
        user
    })
})

module.exports = router