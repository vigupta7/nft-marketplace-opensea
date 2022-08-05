const db = require('../../../helper/db.config.js');
const { Op } = require("sequelize");
const collections = db.collections;
const { validationResult } = require('express-validator');
const items = db.items;

//var userController = require('./../../user/controller/userController');
//var validator = require('validator');
//var cp = require('child_process');
//var Web3 = require('web3');
//const config = require('../../../helper/config');
//var fs = require('fs')

/*
* This is the function which used to add collection in database
*/

exports.add = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    var symbol = req.body.name.replace(" ", "_")
    var collection = new collections();
    collection.name = req.body.name;
    collection.description = req.body.description ? req.body.description : '';
    collection.royalties = req.body.royalties ? req.body.royalties : 0;
    collection.banner = req.body.banner ? req.body.banner : '';
    collection.image = req.body.image ? req.body.image : '';
    collection.status = 0;
    collection.author_id = req.decoded.user_id;
    collection.contract_symbol = symbol;
    collection.save().then(function (collectionObj) {
        res.json({
            status: true,
            message: "Collection created successfully",
            result: collectionObj
        });
    }).catch(function (err) {
        res.json({
            status: false,
            message: "Request failed",
            errors: err
        });
    });
}

/*
* This is the function which used to update collection in database
*/
exports.update = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    var authorId = null;
    if (req.decoded.user_id != undefined) authorId = req.decoded.user_id;
    //collections.findOne({ _id: req.body.collection_id, author_id: req.decoded.user_id }, function (err, collection) {
    collections.findOne({ where: { id: req.body.collection_id, author_id: authorId } }).then(function (collection, err) {
        if (err || !collection) {
            res.json({
                status: false,
                message: "Collection not found",
                errors: err
            });
            return;
        } else {
            collection.name = req.body.name ? req.body.name : collection.name;
            collection.image = req.body.image ? req.body.image : collection.image;
            collection.banner = req.body.banner ? req.body.banner : collection.banner;
            collection.royalties = req.body.royalties ? req.body.royalties : collection.royalties;
            collection.description = req.body.description ? req.body.description : collection.description;
            collection.contract_address = req.body.contract_address ? req.body.contract_address : collection.contract_address;
            if (collection.contract_address) {
                collection.status = 1;
            }

            collection.save().then(function (collection) {
                res.json({
                    status: true,
                    message: "Collection updated successfully",
                    result: collection
                });
            }).catch(function (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors: err
                });
            });
        }
    });
}

/*
* This is the function which used to delete collection in database
*/
exports.delete = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }

    var authorId = null;
    if (req.decoded.user_id != undefined) authorId = req.decoded.user_id;

    collections.findOne({ where: { id: req.body.collection_id, author_id: authorId } }).then(function (collection, err) {
        if (err || !collection) {
            res.json({
                status: false,
                message: "Collection not found",
                errors: err
            });
            return;
        }
        items.count({ where: { id: req.body.collection_id } }).then(function (count) {
            if (count == 0) {
                collections.destroy({ where: { id: req.body.collection_id } }).then(function (err) {
                    res.json({
                        status: true,
                        message: "Collection deleted successfully"
                    });
                })
            } else {
                res.json({
                    status: true,
                    message: "Collection has items and you can't delete it"
                });
            }

        })
    });
}

/**
 *  This is the function which used to view collection
 */
exports.view = function (req, res) {
    collections.findOne({ where: { id: req.query.collection_id } }).then(function (collection, err) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: "Collection not found"
            });
            return;
        }
        if (!collection) {
            res.json({
                status: false,
                message: "Request failed",
                errors: "Collection not found"
            });
            return;
        }
        res.json({
            status: true,
            message: "Collection info retrieved successfully",
            result: collection
        });
    })
}

/**
 * This is the function which used to list collection with filters
 */
exports.list = function (req, res) {
    var keyword = req.query.keyword ? req.query.keyword : '';
    keyword = keyword.replace("+", " ");

    var page = req.query.page ? req.query.page : 1;
    var limit = 10;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);

    var whereCondition = {};
    var sortby = [];

    if (keyword != '') {
        whereCondition = {
            [Op.or]: [
                {
                    name: {
                        [Op.substring]: keyword
                    }
                },
                {
                    description: {
                        [Op.substring]: keyword
                    }
                }
            ]
        };
    }
    if (req.query.type == "my") {
        if (req.decoded.user_id != null) {
            //query = query.where('author_id', req.decoded.user_id).sort('-create_date');
            whereCondition.author_id = req.decoded.user_id;
            sortby.push("create_date");
        }
    } else if (req.query.type == "item") {
        if (req.decoded.user_id != null) {
            //query = query.sort('-item_count');
            sortby.push("item_count");
        }
    } else {
        //query = query.where('status', 1).sort('-create_date')
        whereCondition.status = 1;
        sortby.push("create_date");
    }

    collections.findAndCountAll({
        where: whereCondition,
        attributes: ['id', 'name', 'description', 'banner', 'image', 'royalties', 'item_count', 'contract_symbol'],
        order: sortby,
        offset: offset,
        limit: 10
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Collection retrieved successfully",
            data: response
        });
    });
}

/**
 * This is the function which used to list all items for admin
 */
exports.getAdminList = function (req, res) {
    var keyword = req.query.keyword ? req.query.keyword : '';
    keyword = keyword.replace("+", " ");
    var page = req.query.page ? req.query.page : 1;
    var limit = 10;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);
    var whereCondition = {};

    if (keyword != '') {
        whereCondition = {
            [Op.or]: [{
                name: {
                    $regex: new RegExp(keyword, "ig")
                }
            }, {
                description: {
                    $regex: new RegExp(keyword, "ig")
                }
            }]
        }
    }

    collections.findAndCountAll({
        where: whereCondition,
        attributes: ['name', 'description', 'banner', 'image', 'royalties'],
        order: ['create_date'],
        offset: offset,
        limit: limit,
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Collection retrieved successfully",
            data: response
        });
    });
}


/**
 * This is the function which used to generate abi for create contract
 */

// exports.generateABI = function (req, res) {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         res.json({
//             status: false,
//             message: "Request failed",
//             errors: errors.array()
//         });
//         return;
//     }
//     console.log("checking errorsds")
//     const rootPath = __dirname.replace("module/collection/controller", "");
//     var symbol = req.body.symbol.replace(" ", "_")
//     var symbolsol = symbol + '.sol';
//     fs.stat(rootPath + symbol + '.bin', function (fileerr, stats) {
//         if (fileerr) {
//             //var command = 'sh generate.sh '+symbol + ' "' + req.body.name + '" ' +  symbolsol;
//             var command = 'sh generate.sh ' + symbol + ' "' + req.body.name + '" ' + symbolsol + ' ' + config.rpcurl;
//             cp.exec(command, function (err, stdout, stderr) {
//                 console.log('stderr ', stderr)
//                 console.log('stdout ', stdout)
//                 if (err) {
//                     console.log(err)
//                     res.json({
//                         status: false,
//                         message: err.toString().split('ERROR: ').pop().replace(/\n|\r/g, "")
//                     });
//                     return
//                 }
//                 fs.readFile(rootPath + symbol + '.bin', 'utf8', (err, data) => {
//                     if (err) {
//                         res.json({
//                             status: false,
//                             message: err.toString().split('ERROR: ').pop().replace(/\n|\r/g, "")
//                         });
//                         console.error(err)
//                         return
//                     }
//                     res.json({
//                         status: true,
//                         message: 'generate abi successful',
//                         result: data
//                     });
//                 })
//             });
//         } else {
//             fs.readFile(rootPath + symbol + '.bin', 'utf8', (err, data) => {
//                 if (err) {
//                     res.json({
//                         status: false,
//                         message: err.toString().split('ERROR: ').pop().replace(/\n|\r/g, "")
//                     });
//                     console.error(err)
//                     return
//                 }
//                 res.json({
//                     status: true,
//                     message: 'generate abi successful',
//                     result: data
//                 });
//             })
//         }
//     })
// }




