const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const models = require('../models')
const authMiddleWare = require('../middlewares/auth-middleware')

// 게시글에 작성된 댓글 보여주는 API
router.get('/post/:post_id/comment', async (req, res) => {
    const post_id = req.params.post_id

    // 로그인된 유저 정보 찾기
    const {authorization} = req.headers
    const tokenValue = authorization.split(' ')[1]
    const login_user_email = jwt.verify(tokenValue, 'my-secret-key')

    const comments = await models.Comment.findAll({
        raw: true,
        where: {
            fk_post_id: post_id,
        }
    })
    const author = await models.User.findAll({
        raw: true
    })
    res.status(200).json({
        comments: comments.map((comment) => {
            return {
                comment,
                email: author.find((item) => item.user_id === comment.fk_user_id)['email']
            }
        })
        , login_user_email
    })
})

// 댓글 작성 API
router.post('/post/:post_id/comment', authMiddleWare, async (req, res) => {
    // 토큰은 해석해주기
    const {authorization} = req.headers
    const tokenValue = authorization.split(' ')[1]
    // 유저 이메일
    const email = jwt.verify(tokenValue, 'my-secret-key').user_email
    const post_id = req.params.post_id
    const {content} = req.body

    const user_id = await models.User.findOne({
        raw: true,
        where: {
            email: email
        }
    })

    const fk_post_id = post_id
    const fk_user_id = user_id.user_id

    if (content === null) {
        return res.status(400).json({
            errorMessage: '내용을 작성해 주세요..'
        })
    }
    await models.Comment.create({
        content,
        fk_post_id,
        fk_user_id,
    })

    res.status(200).json({
        msg: '작성완료!'
    })
})

// 댓글 수정 API
router.put('/post/:post_id/comment/:comment_id', authMiddleWare, async (req, res) => {
    const post_id = req.params.post_id
    const comment_id = req.params.comment_id
    const {content} = req.body

    await models.Comment.update({content: content}, {where: {fk_post_id: post_id, comment_id: comment_id,}})

    res.status(200).json({
        msg: '수정완료!'
    })
})

// 댓글 삭제 API
router.delete('/post/:post_id/comment/:comment_id', authMiddleWare, async (req, res) => {
    const post_id = req.params.post_id
    const comment_id = req.params.comment_id
    await models.Comment.destroy({
        where: {
            fk_post_id: post_id,
            comment_id: comment_id
        }
    })
    res.status(200).json({
        msg: '삭제완료!'
    })
})

module.exports = router