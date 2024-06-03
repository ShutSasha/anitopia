const Router = require('express')
const router = new Router()
const  newsController = require('../controllers/newsController')

router.post('/',newsController.add)
router.get('/:id',newsController.getNewsById)
router.delete('/',newsController.delete)

module.exports = router