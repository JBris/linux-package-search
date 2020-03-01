const app = require('express');
const router = app.Router();
const apiSecret = require("../middleware/api-secret");
const controller = require('../controllers/linux');

router.get('/search/:distribution/:package', apiSecret.authenticate, controller.search);  
router.get('/search-raw/:distribution/:package', apiSecret.authenticate, controller.searchRaw);  

router.get('/view/:distribution/:package', apiSecret.authenticate, controller.view);  
router.get('/view-raw/:distribution/:package', apiSecret.authenticate, controller.viewRaw);  

module.exports = router;
 