const Router = require('express')
const router = new Router()
const authRouter = require('./authRouter')
const animeRouter = require('./animeRouter')
const rateAnimeRouter = require('./rateAnimeRouter')
const commentRouter = require('./commentRouter')
const userRouter = require('./userRouter')
const notificationRouter = require('./notificationRouter')
const complaintRouter = require('./complaintRouter')
const bansRouter = require('./bansRouter')
const newsRouter = require('./newsRouter')

router.use('/auth', authRouter)
router.use('/users', userRouter)
router.use('/anime', animeRouter)
router.use('/rate-anime', rateAnimeRouter)
router.use('/comments', commentRouter)
router.use('/notifications', notificationRouter)
router.use('/complaints', complaintRouter)
router.use('/bans', bansRouter)
router.use('/news', newsRouter)

module.exports = router
