const jwt = require('jsonwebtoken')
const models = require('../models')

module.exports = (req, res, next) => {
    const {authorization} = req.headers
    const [tokenType, tokenValue] = authorization.split(' ')
    if (tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요.'
        })
        return
    }

    try {
        // 유저 이메일을 추출
        const {user_email} = jwt.verify(tokenValue, 'my-secret-key')
        // 유저 메일이 있는지 없는지 판별
        models.User.findOne({
            where: {email: user_email}
        })
            .then((user) => {
                res.locals.user = user
                // console.log(user)
                next()
            })
    } catch (err) {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요.'
        })
    }
}