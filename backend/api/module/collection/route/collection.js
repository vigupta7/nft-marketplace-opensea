var express = require('express')
var router = express.Router();
var collectionController = require("./../controller/collectionController")
var auth = require("./../../../middleware/auth");
var adminauth = require("./../../../middleware/adminauth");
var optionalauth = require("./../../../middleware/optionalauth");
const { check } = require('express-validator');

router.post('/add',[check('name').not().isEmpty(),auth],collectionController.add)
router.put('/update',[check('collection_id').not().isEmpty(),auth],collectionController.update);
router.get('/fulllist',adminauth,collectionController.getAdminList)
router.get('/list',optionalauth,collectionController.list)
router.get('/detail',collectionController.view)
router.delete('/delete',[check('collection_id').not().isEmpty(),auth],collectionController.delete)
//router.post('/generateabi',collectionController.generateABI)
module.exports = router