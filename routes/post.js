const express = require('express')
const router = express.Router()
const models = require('../models')
const AWS = require('aws-sdk')
const path = require('path')
const jwt = require('jsonwebtoken')
const multerS3 = require('multer-s3')
const multer = require('multer')
const authMiddleWare = require('../middlewares/auth-middleware')

// a3 세팅
AWS.config.accessKeyId = process.env.accessKeyId
AWS.config.secretAccessKey = process.env.secretAccessKey
AWS.config.region = process.env.region

let upload = multer({
    storage: multerS3({
        s3: new AWS.S3(),
        bucket: "velog-velog-clone",
        key: function (req, file, cb) {
            let extension = path.extname(file.originalname);
            cb(null, Date.now().toString() + extension)
        },
        acl: 'public-read-write',
    })
})

// 게시글 리스트 보여주기
router.get('/post', async (req, res) => {
    // 게시글 작성자 찾아오기
    const user = await models.User.findAll({raw: true})
    // 게시글 DB에서 불러오기
    const posts = await models.Post.findAll({raw: true})
    res.json({
        posts: posts.map((post) => {
            return {
                post,
                email: user.find((item) => item.user_id === post.fk_user_id)['email']
            }
        })
    })
})

// 게시글 상세 보여주기
router.get('/post/:post_id', async (req, res) => {
    const post_id = req.params.post_id
    // 게시글 찾기
    const detail_post = await models.Post.findOne({
        raw: true,
        where: {
            post_id
        }
    })
    // 작성한 유저 찾기
    const user = await models.User.findOne({
        raw: true,
        where: {
            user_id: detail_post.fk_user_id
        }
    })
    res.status(200).json({
        detail_post,
        email: user.email,
    })
})

// 게시글 작성하기
router.post('/post', authMiddleWare, upload.single('image'), async (req, res) => {
    try {
        const {title, content} = req.body
        const {authorization} = req.headers
        const tokenValue = authorization.split(' ')[1]
        const user_email = jwt.verify(tokenValue, 'my-secret-key')
        const fk_user_id = await models.User.findOne({
            raw: true,
            where: {email: user_email.user_email}
        })
        const img_url = req.file.location
        await models.Post.create({title, content, img_url, fk_user_id: fk_user_id.user_id})
        res.status(200).json({
            msg: '작성완료!'
        })
    } catch (err) {
        res.status(400).json({
            errorMessage: '입력창을 확인해주세요..'
        })
    }
})

// 게시글 수정 API
router.put('/post/:post_id', authMiddleWare, upload.single('image'), async (req, res) => {
    try {
        const post_id = req.params.post_id
        const {title, content} = req.body
        const img_url = req.file.location
        console.log('============================',post_id,title, content, img_url)
        await models.Post.update({title, content, img_url}, {where: {post_id}})
        res.status(200).json({
            msg : '수정 성공!'
        })
    } catch (err) {
        res.status(400).json({
            errorMessage: '다시 시도하세요.'
        })
    }
})

// 게시글 삭제 API
router.delete('/post/:post_id', authMiddleWare, async (req, res) => {
    try {
        const post_id = req.params.post_id
        await models.Post.destroy({
            raw: true,
            where: {
                post_id
            }
        })
        res.status(200).json({
            msg: '삭제완료!'
        })
    } catch (err) {
        res.status(400).json({
            errorMessage: '다시 시도 해주세요.'
        })
    }

})

module.exports = router