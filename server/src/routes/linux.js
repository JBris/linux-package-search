const app = require('express');
const router = app.Router();
const apiSecret = require("../middleware/api-secret");
const controller = require('../controllers/linux');

router.get('/search/:distribution/:package', apiSecret.authenticate, controller.search);  
router.get('/view/:distribution/:package', apiSecret.authenticate, controller.view);  

module.exports = router;
 