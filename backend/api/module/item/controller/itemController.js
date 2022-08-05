const db = require('../../../helper/db.config.js');
const { Op } = require("sequelize");
const items = db.items;
const favourites = db.favourites;
const buyRequests = db.buyRequests;
const options = db.options;
const offers = db.offers;
const views = db.views;
const histories = db.histories;
const prices = db.prices;
const users = db.users;
const collections = db.collections;
const category = db.categories;

var fs = require('fs')
const { validationResult } = require('express-validator');
var userController = require('./../../user/controller/userController');
const config = require('../../../helper/config');
var Web3 = require('web3');
var web3 = new Web3(new Web3.providers.HttpProvider(config.rpcurl));
var cp = require('child_process');
var mailer = require('./../../common/controller/mailController');

/*
* This is the function which used to add item in database
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
    var item = new items();
    item.name = req.body.name;
    item.description = req.body.description;
    item.category_id = req.body.category_id;
    item.collection_id = req.body.collection_id;
    item.author_id = req.decoded.user_id;
    item.current_owner = req.decoded.user_id;
    item.price = req.body.price;
    item.unlock_content_url = req.body.unlock_content_url ? req.body.unlock_content_url : '';
    item.media = req.body.media ? req.body.media : '';
    item.thumb = req.body.thumb ? req.body.thumb : '';
    item.external_link = req.body.external_link ? req.body.external_link : '';
    item.attributes = req.body.attributes ? req.body.attributes : '[]';
    item.levels = req.body.levels ? req.body.levels : '[]';
    item.stats = req.body.stats ? req.body.stats : '[]';

    collections.findOne({ where: { id: req.body.collection_id } }).then(function (collection, err) {
        if (err || !collection) {
            res.json({
                status: false,
                message: "Collection not found",
                errors: err
            });
            return;
        }
        item.save().then(function (itemObj) {
            collection.item_count = collection.item_count + 1;
            collection.save().then(function (collectionObj) {
                res.json({
                    status: true,
                    message: "Item created successfully",
                    result: itemObj
                });
            }).catch(function (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors: err
                });
            });

        }).catch(function (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: err
            });
        });

    });
}

/*
* This is the function which used to update item in database
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
    items.findOne({ where: { id: req.body.item_id, author_id: req.decoded.user_id, status: "inactive" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }
        item.name = req.body.name ? req.body.name : item.name;
        item.description = req.body.description ? req.body.description : item.description;
        item.price = req.body.price ? req.body.price : item.price;
        item.media = req.body.media ? req.body.media : item.media;
        item.thumb = req.body.thumb ? req.body.thumb : item.thumb;
        item.external_link = req.body.external_link ? req.body.external_link : item.external_link;
        item.unlock_content_url = req.body.unlock_content_url ? req.body.unlock_content_url : item.unlock_content_url;
        item.attributes = req.body.attributes ? req.body.attributes : item.attributes;
        item.levels = req.body.levels ? req.body.levels : item.levels;
        item.stats = req.body.stats ? req.body.stats : item.stats;
        item.category_id = req.body.category_id ? req.body.category_id : item.category_id

        item.save().then(function (itemObj) {
            res.json({
                status: true,
                message: "Item updated successfully",
                result: itemObj
            });
        }).catch(function (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: err
            });
        });
    })
}

/*
* This is the function which used to resale item in ethereum network
*/
exports.resale = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    items.findOne({ where: { id: req.body.item_id, author_id: req.decoded.user_id, status: "active" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }
        userController.getUserInfoByID(req.decoded.user_id).then(function (user, err) {
            prices.update({ status: false }, { where: { item_id: item.id, user_id: user.id, status: true } });

            var price = new prices();
            price.item_id = item.id;
            price.price = req.body.price;
            price.user_id = user.id;
            price.status = true

            price.save().then(function (priceObj) {
                res.json({
                    status: true,
                    message: "Item on resale successfully",
                    result: priceObj
                }).catch(function (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors: err
                    });
                });
            });
        });
    });
}

/*
* This is the function which used to resale item in ethereum network
*/
exports.resaleInformation = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }

    prices.findOne({ where: { user_id: req.decoded.user_id, item_id: req.body.item_id, status: true } }).then(function (item, err) {
        res.json({
            status: true,
            message: "Item on resale successfully",
            result: item
        });
        return;
    })
}

/*
* This is the function which used to publish item in ethereum network
*/
exports.publish = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    items.findOne({ include: ["collection"] }, { where: { id: req.body.item_id, author_id: req.decoded.user_id, status: "inactive" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }
        userController.getUserInfoByID(req.decoded.user_id, function (err, user) {
            item.token_id = req.body.token_id;
            item.minted_date = new Date();
            item.status = "active";
            item.save().then(function (itemObj) {
                var history = new histories();
                history.item_id = item.id;
                history.collection_id = item.collection_id;
                history.from_id = user.id; //'000000000000000000000000';
                history.to_id = user.id;
                history.transaction_hash = req.body.transaction_hash ? req.body.transaction_hash : '';
                history.price = item.price;
                history.history_type = "minted";
                history.save().then(function (historyObj) {
                    var price = new prices();
                    price.item_id = item.id;
                    price.price = item.price;
                    price.user_id = user.id;
                    price.save().then(function (priceObj) {
                        res.json({
                            status: true,
                            message: "Item published successfully",
                            result: itemObj
                        });
                    }).catch(function (err) {
                        res.json({
                            status: false,
                            message: "Price Request failed",
                            errors: err
                        });
                    });
                }).catch(function (err) {
                    res.json({
                        status: false,
                        message: "History Request failed",
                        errors: err
                    });
                });
            }).catch(function (err) {
                res.json({
                    status: false,
                    message: "Item Request failed",
                    errors: err
                });
            });
        });
    })
}


/*
* This is the function which used to update item price
*/

exports.updatePrice = function (req, res) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    items.findOne({ include: ["collection"] }, { where: { id: req.body.item_id, status: "active" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }
        userController.getUserInfoByID(req.decoded.user_id, function (err, sender) {

            item.price = req.body.price
            item.save(function (err, itemObj) {

                var price = new prices();
                price.item_id = itemObj.id;
                price.price = itemObj.price;
                price.user_id = sender.id
                price.save().then(function (priceObj) {
                    res.json({
                        status: true,
                        message: "Item price updated successfully",
                        result: itemObj
                    });
                })

            })

        })
    })
}

/*
* This is the function which used to purchase item in ethereum network
*/
exports.purchase = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    items.findOne({ include: ["collection"] }, { where: { id: req.body.item_id, status: "active" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }

        userController.getUserInfoByID(item.current_owner, function (err, receiver) {
            userController.getUserInfoByID(req.decoded.user_id, function (err, sender) {
                this.transferAdminComission(item, function (err, comission) {
                    this.transferBalance(sender, receiver, item, comission, function (is_transferred) {
                        
                        item.current_owner = req.decoded.user_id;
                        collections.findOne({ where: { id: item.collection_id } }).then(function (collection, err) {
                            collection.volume_traded = collection.volume_traded + item.price;
                            collection.save().then(function (collectionsaveObj) {
                                if (req.body.price) {
                                    item.price = req.body.price;
                                }
                                item.save().then(function (itemObj) {
                                    var history = new histories();
                                    history.item_id = item.id;
                                    history.collection_id = item.collection_id;
                                    history.from_id = receiver.id;
                                    history.to_id = sender.id;
                                    history.transaction_hash = ''; //transaction_hash
                                    history.history_type = "transfer";
                                    history.price = item.price;
                                    history.save().then(function (historyObj) {
                                        var price = new prices();
                                        price.item_id = item.id;
                                        price.price = item.price;
                                        price.user_id = sender.id
                                        price.save().then(function (priceObj) {
                                            offers.destroy({ where: { item_id: req.body.item_id } }).then(function (deleteResult, err) {
                                                if (err) {
                                                    res.json({
                                                        status: false,
                                                        message: "Offers Delete Request failed",
                                                        errors: err
                                                    });
                                                }
                                                else {
                                                    res.json({
                                                        status: true,
                                                        message: "Item Transfer successfully",
                                                        result: itemObj
                                                    });
                                                }
                                            })
                                        }).catch(function (err) {
                                            res.json({
                                                status: false,
                                                message: "Price Save Request failed",
                                                errors: err
                                            });
                                        });
                                    }).catch(function (err) {
                                        res.json({
                                            status: false,
                                            message: "History Save Request failed",
                                            errors: err
                                        });
                                    });
                                }).catch(function (err) {
                                    res.json({
                                        status: false,
                                        message: "Item Save Request failed",
                                        errors: err
                                    });
                                });
                            }).catch(function (err) {
                                res.json({
                                    status: false,
                                    message: "Collection Save Request failed",
                                    errors: err
                                });
                            });
                        });
                    });
                })
            })
        });
    });
}

/*
* This is the function which used to purchase item in ethereum network
*/
exports.history = function (req, res) {
    var page = req.query.page ? req.query.page : 1;
    var limit = 10;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);

    var whereCondition = {};

    if (req.query.type == "item") {
        whereCondition.item_id = req.query.item_id;
    } else if (req.query.type == "collection") {
        whereCondition.collection_id = req.query.collection_id;
    } else if (req.query.type == "profile") {
        whereCondition.to_id = req.query.user_id;
    }

    if (req.query.filter) {
        whereCondition.history_type = req.query.filter;
    }

    histories.findAndCountAll({
        include: [
            { model: db.users, as: 'toUser', attributes: ['id', 'username', 'first_name', 'last_name', 'profile_image'] },
            { model: db.users, as: 'fromUser', attributes: ['id', 'username', 'first_name', 'last_name', 'profile_image'] },
            { model: db.items, as: 'itemHistory', attributes: ['id', 'name', 'thumb', 'price'] },
            { model: db.collections, as: 'collectionHistory' }],
        where: whereCondition,
        order: ['created_date'],
        offset: offset,
        limit: limit,
        page: page
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Histories retrieved successfully",
            data: response
        });
    });
}

function getSignaure(price, toAddress) {
    return "0xarnishfdsafdnijnjarnishfdanrisharnishiarnishnairnisnisrniarnisfdnsajkfnjksdnfkjasbfdjasbfhjasbfdasdf";
}
/*
* This is the function which used for buy request update
* tx_hash = '' means REJECT
* tx_hash = '0x....' means SUBMIT
*/
exports.buyRequestUpdate = function (req, res) {
    var buyRequestId = req.body.buy_request_id;
    var transactionHash = req.body.tx_hash;

    buyRequests.findOne({ where: { id: buyRequestId, status: 'PENDING' } }).then(function (buyRequestObj, err) {
        if (err || !buyRequestObj) {
            res.json({
                status: false,
                message: "Invalid buy_request_id",
                errors: err
            });
            return;
        } else {
            if (transactionHash == '') {
                buyRequestObj.status = 'REJECT';
            } else {
                buyRequestObj.status = 'SUBMIT';
                buyRequestObj.tx_hash = transactionHash;
            }

            buyRequestObj.save().then(function (result) {
                res.json({
                    status: true,
                    data: 'Successfully updated',
                    errors: err
                });
            })
        }
    })

}
/*
* This is the function which used for buy request
*/
exports.buyRequest = function (req, res) {
    var userId = req.decoded.user_id;
    var itemId = req.body.item_id;

    items.findOne({ where: { id: itemId, status: "active" }, attributes: ['id', 'current_owner', 'status', 'price'] }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        } else {
            var currentOwnerId = item.current_owner;
            var price = item.price;
            var status = 'PENDING';

            users.findOne({ where: { id: currentOwnerId } }).then(function (userObj, userErr) {
                var toAddress = userObj.metamask_info_id;
                var signature = getSignaure(price, toAddress);


                var buyRequestObj = new buyRequests();
                buyRequestObj.item_id = itemId;
                buyRequestObj.from_id = userId;
                buyRequestObj.to_id = userObj.id;
                buyRequestObj.price = price;
                buyRequestObj.price = price;
                buyRequestObj.sign = signature;
                buyRequestObj.status = status;

                buyRequestObj.save().then(function (result) {
                    res.json({
                        status: true,
                        data: {
                            signature: signature,
                            requestId: buyRequestObj.id
                        },
                        errors: err
                    });
                })
            })
        }
    });
}

/*
* This is the function which used to show price list
*/
exports.pricelist = function (req, res) {
    var page = req.query.page ? req.query.page : 1;
    var limit = 10;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);

    prices.findAndCountAll({
        include: [{
            model: db.users,
            as: 'userPrice',
            attributes: ['id', 'username', 'first_name', 'last_name', 'profile_image'],
        }],
        include: ["userPrice"],
        where: { 'item_id': req.query.item_id },
        order: ['created_date'],
        page: page,
        offset: offset,
        limit: limit,
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Prices retrieved successfully",
            data: response
        });
    });
}

/*
* This is the function which used to delete item in database
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
    items.findOne({ where: { id: req.body.item_id, author_id: req.decoded.user_id, status: "inactive" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        } else {
            collections.findOne({ where: { id: item.collection_id } }).then(function (collection, err) {
                items.destroy({ where: { id: req.body.item_id } }).then(function (err) {
                    collection.item_count = collection.item_count - 1;
                    collection.save().then(function (collectionObj) {
                        res.json({
                            status: true,
                            message: "Item deleted successfully"
                        });
                    })
                })
            })
        }
    });
}

/*
* This is the function which used to get more from collection for item detail page
*/
exports.moreFromCollection = function (req, res) {
    var collIDS = [];
    collIDS.push(req.query.item_id)
    var whereCondition = {};
    whereCondition.id = { [Op.notIn]: collIDS };
    whereCondition.collection_id = req.query.collection_id;
    whereCondition.status = 'active';

    items.findAll({
        where: whereCondition,
        attributes: ['id', 'name', 'description', 'thumb', 'like_count', 'created_date', 'status', 'price'],
        order: ['created_date'],
        limit: 5
    }).then(function (result) {
        res.json({
            status: true,
            message: "Collection Item retrieved successfully",
            data: result
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
* This is the function which used to check list item by collection for collection home page
*/
exports.listByCollection = function (req, res) {
    var result = {
    };
    //Get Results by Create Date
    items.findAll({
        where: { collection_id: req.query.collection_id, status: 'active' },
        attributes: ['name', 'description', 'thumb', 'like_count', 'created_date', 'status', 'price'],
        order: ['created_date'],
        limit: 5
    }).then(function (recentresult) {
        result["recent"] = recentresult;
    });

    //Get Results by Minted Date

    items.findAll({
        where: { collection_id: req.query.collection_id, status: 'active' },
        attributes: ['name', 'description', 'thumb', 'like_count', 'created_date', 'status', 'price'],
        order: ['minted_date'],
        limit: 5
    }).then(function (mintedresult) {
        result["minted"] = mintedresult;
    })

    //Get Auctions data

    items.findAll({
        where: { collection_id: req.query.collection_id, status: 'active', has_offer: true },
        attributes: ['name', 'description', 'thumb', 'like_count', 'created_date', 'status', 'price'],
        order: ['created_date'],
        limit: 5
    }).then(function (mintedresult) {
        result["onauction"] = mintedresult;

        res.json({
            status: true,
            message: "Collection Item retrieved successfully",
            data: result
        });
    });
}

/*
* This is the function which used to list item in database
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

    if (req.query.type == "mycollection" && req.decoded.user_id != null) {
        whereCondition.collection_id = req.query.collection_id;
        sortby.push("created_date");
    } else if (req.query.type == "view" && req.decoded.user_id != null) {
        whereCondition.id = req.query.item_id;
    } else {
        if (req.query.user && req.decoded.user_id != null) {
            if (req.decoded.role == 1 && req.query.user == "admin") {
            } else {
                whereCondition.status = 'active';
            }
        } else {
            whereCondition.status = 'active';
        }

        if (req.query.type == "my") {
            whereCondition.author_id = req.query.user_id;
            sortby.push("created_date");
        } else if (req.query.type == "collected") {
            whereCondition.author_id = { [Op.ne]: req.query.user_id };
            whereCondition.current_owner = req.query.user_id;
            sortby.push("created_date");
        } else if (req.query.type == "view") {
            whereCondition.id = req.query.item_id;
        } else if (req.query.type == "offer") {
            whereCondition.has_offer = true;
        } else if (req.query.type == "collection") {
            whereCondition.collection_id = req.query.collection_id;
        } else if (req.query.type == "category") {
            whereCondition.category_id = req.query.category_id;
        } else if (req.query.type == "price") {
            whereCondition.price = { [Op.gte]: req.query.price_range };
            //query = query.where('price', { $gte: req.query.price_range })
        } else if (req.query.type == "mostviewed") {
            sortby.push("view_count");
        } else if (req.query.type == "mostliked") {
            sortby.push("like_count");
        } else {
            sortby.push("created_date");
        }
    }

    var selectList = ['id', 'has_offer', 'unlock_content_url', 'view_count', 'like_count', 'price', 'stauts', 'token_id', 'status', 'attributes', 'levels', 'stats', 'created_date', 'name', 'description', 'media', 'thumb', 'external_link', 'author_id'];
    var includeList = [];

    if (req.query.type != "view") {
        selectList = ['id', 'name', 'description', 'thumb', 'like_count', 'created_date', 'status', 'price'];
    } else {
        //selectList = ['id', 'has_offer', 'unlock_content_url', 'view_count', 'like_count', 'price', 'stauts', 'token_id', 'status', 'attributes', 'levels', 'stats', 'created_date', 'name', 'description', 'media', 'thumb', 'external_link', 'author_id', 'owner.id', 'owner.username', 'owner.first_name', 'owner.last_name', 'owner.profile_image', 'owner.metamask_info_id', 'owner.metamask_info_type'];
        includeList = [
            { model: db.collections, as: "collection" },
            { model: db.categories, as: "category" },
            { model: db.users, as: "owner", attributes: ['id', 'username', 'first_name', 'last_name', 'profile_image', 'metamask_info_id', 'metamask_info_type'] }
        ];
    }

    items.findAndCountAll({
        include: includeList,
        where: whereCondition,
        attributes: selectList,
        order: sortby,
        offset: offset,
        limit: limit
    }).then(function (result, err) {
        if (err || !result) {
            res.json({
                status: false,
                message: "No Records",
                errors: err
            });
            return;
        }
        const response = db.getPagingData(result, page, offset, limit);
        if (req.query.type != "view") {
            res.json({
                status: true,
                message: "Item retrieved successfully",
                data: response,
                return_id: 0
            });
        } else {
            var is_liked = 0;
            if (req.decoded.user_id != null) {
                favourites.findOne({ where: { item_id: req.query.item_id, user_id: req.decoded.user_id } }).then(function (favourite, err) {
                    if (favourite) {
                        is_liked = 1
                    }
                    res.json({
                        status: true,
                        message: "Item retrieved successfully",
                        data: response,
                        return_id: is_liked
                    });
                })
            } else {
                res.json({
                    status: true,
                    message: "Item retrieved successfully",
                    data: response,
                    return_id: is_liked
                });
            }
        }
    }).catch(function (err) {
        res.json({
            status: false,
            message: "Request failed",
            errors: err
        });
    });
}

/*
* This is the function which used to list item in database
*/
exports.actionFavourite = function (req, res) {
    items.findOne({ where: { id: req.body.item_id, status: "active" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }
        favourites.findOne({ where: { item_id: req.body.item_id, user_id: req.decoded.user_id } }).then(function (favourite, err) {
            if (req.body.type == "increase") {
                if (!favourite) {
                    item.like_count = item.like_count + 1;
                    var newfavourite = new favourites();
                    newfavourite.user_id = req.decoded.user_id;
                    newfavourite.item_id = req.body.item_id;
                    newfavourite.save().then(function (result) {
                        item.save().then(function (result) {
                            res.json({
                                status: true,
                                message: "Favourite added successfully",
                            });
                        })
                    })
                } else {
                    res.json({
                        status: true,
                        message: "Favourite added successfully",
                    });
                }
            } else {
                if (!favourite) {
                    res.json({
                        status: true,
                        message: "Favourite removed successfully",
                    });
                } else {
                    item.like_count = item.like_count - 1;
                    favourites.destroy({ where: { id: favourite.id } }).then(function (err) {
                        item.save().then(function (result) {
                            res.json({
                                status: true,
                                message: "Favourite removed successfully",
                            });
                        })
                    })
                }
            }

        })

    });
}

/*
* This is the function which used to list user who add the item as favourite item
*/
exports.listFavourite = function (req, res) {
    var page = req.query.page ? req.query.page : 1;
    var limit = 15;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);
    //check later
    //query = query.populate({ path: 'item_id', model: items, select: '_id name thumb price' })
    favourites.findAndCountAll({
        include: [{
            model: db.items,
            as: 'itemFavorite',
            attributes: ['id', 'name', 'thuml', 'price']
        }],
        where: { 'user_id': req.query.user_id },
        order: ['created_date'],
        page: page,
        offset: offset,
        limit: limit,
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Favourites retrieved successfully",
            data: response
        });
    });
}

/*
* This is the function which used to add views for user
*/
exports.addViews = function (req, res) {
    items.findOne({ where: { id: req.body.item_id, status: "active" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }
        views.findOne({ where: { item_id: req.body.item_id, user_id: req.decoded.user_id } }).then(function (view, err) {
            if (!view) {
                item.view_count = item.view_count + 1;
                var newview = new views();
                newview.user_id = req.decoded.user_id;
                newview.item_id = req.body.item_id;
                newview.save().then(function (result) {
                    item.save().then(function (result) {
                        res.json({
                            status: true,
                            message: "View added successfully",
                        });
                    })
                })
            } else {
                res.json({
                    status: true,
                    message: "View added successfully",
                });
            }
        })

    });
}

/*
* This is the function which used to list user who recently view the item
*/
exports.recentlyViewed = function (req, res) {
    var page = req.query.page ? req.query.page : 1;
    var limit = 15;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);

    views.findAndCountAll({
        where: { 'item_id': req.query.item_id, 'user_id': req.query.user_id },
        //attributes: ['id', 'username', 'first_name', 'last_name', 'profile_image'],
        order: ['created_date'],
        offset: offset,
        limit: limit
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Views retrieved successfully",
            data: response
        });
    });
}

/*
* This is the function which used to list item offer and profile offer
*/
exports.addOffers = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    items.findOne({
        include: [{
            model: db.collections,
            as: 'collection',
            attributes: ['id']
        }],
        where: { id: req.body.item_id, status: "active" },
        attributes: ['id', 'current_owner']
    }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }
        userController.getUserInfoByID(req.decoded.user_id, function (err, sender) {
            item.has_offer = true;
            item.save().then(function (itemObj) {
                offers.findOne({ where: { sender: req.decoded.user_id, item_id: req.body.item_id } }).then(function (offerObj, err) {
                    if (!offerObj) {
                        var offer = new offers();
                        offer.sender = req.decoded.user_id;
                        offer.item_id = req.body.item_id;
                        offer.receiver = item.current_owner;
                        offer.price = req.body.price;
                        offer.status = "pending"
                        offer.save().then(function (offerOb) {
                            var history = new histories();
                            history.item_id = item.id;
                            history.collection_id = item.collection.id;
                            history.from_id = req.decoded.user_id;
                            history.to_id = item.current_owner
                            history.transaction_hash = ""
                            history.history_type = "bids";
                            history.price = req.body.price;
                            history.save().then(function (historyObj) {
                                res.json({
                                    status: true,
                                    message: "offer added successfully",
                                    data: offerOb
                                });
                            });
                        });
                    } else {
                        res.json({
                            status: false,
                            message: "offer added already",
                        });
                    }
                })

            });
        });
    })
}

/*
* This is the function which used to update offer
*/
exports.actionOffers = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }

    items.findOne({ include: ["collection"] }, { where: { id: req.body.item_id, current_owner: req.decoded.user_id, status: "active" } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "Item not found",
                errors: err
            });
            return;
        }
        offers.findOne({ where: { id: req.body.offer_id } }).then(function (offer, err) {
            if (req.body.type == "cancel") {
                offers.destroy({ where: { id: req.body.offer_id } }).then(function (err) {
                    offers.count({ where: { item_id: req.body.item_id } }).then(function (OfferItemCount, err) {
                        if (OfferItemCount > 0) {
                            res.json({
                                status: true,
                                message: "Offer cancelled successfully"
                            });
                        } else {
                            item.has_offer = false
                            item.save().then(function (err, result) {
                                res.json({
                                    status: true,
                                    message: "Offer cancelled successfully"
                                });
                            })
                        }

                    })
                })
            } else {
                offer.status = "accepted"
                offer.save().then(function (err, offerOb) {
                    res.json({
                        status: true,
                        message: "Offer accepted successfully"
                    });
                })
            }
        })
    });
}


/*
* This is the function which used to remove offer
*/
exports.removeOffers = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    offers.findOne({ where: { sender: req.decoded.user_id, id: req.body.offer_id } }).then(function (offerObj, err) {
        if (err || !offerObj) {
            res.json({
                status: false,
                message: "Offer not found",
                errors: err
            });
            return;
        }
        offers.destroy({ where: { id: req.body.offer_id } }).then(function (err) {
            offers.count({ where: { item_id: req.body.item_id } }).then(function (OfferItemCount, err) {
                if (OfferItemCount > 0) {
                    res.json({
                        status: true,
                        message: "Item deleted successfully"
                    });
                } else {
                    items.findOne({ where: { id: req.body.item_id, status: "active" } }).then(function (item, err) {
                        item.has_offer = false
                        item.save().then(function (err, result) {
                            res.json({
                                status: true,
                                message: "Item deleted successfully"
                            });
                        })
                    });
                }

            })

        })
    })
}

/*
* This is the function which used to list item offer and profile offer
*/
exports.listOffers = function (req, res) {
    var page = req.query.page ? req.query.page : 1;
    var limit = 10;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);

    var whereCondition = {};
    var sortby = [];

    var is_admin = false;
    if (req.decoded.user_id != null && req.query.user) {
        if (req.decoded.role == 1 && req.query.user == "admin") {
            is_admin = true;
        }
    }
    if (is_admin) {
        //query = offers.find();

    } else {
        if (req.query.type == "item") {
            whereCondition.item_id = req.query.item_id;
        } else {
            whereCondition.receiver = req.query.user_id;
        }
    }

    sortby.push("created_date");
    offers.findAndCountAll({
        //include: ["senderUser", "receiverUser", "itemOffer"],
        include: [{
            model: db.users,
            as: 'senderUser',
            attributes: ['id', 'username', 'first_name', 'last_name', 'profile_image']
        },
        {
            model: db.users,
            as: 'receiverUser',
            attributes: ['id', 'username', 'first_name', 'last_name', 'profile_image']
        },
        {
            model: db.items,
            as: 'itemOffer',
            attributes: ['id', 'name', 'thumb', 'price']
        }],

        where: whereCondition,
        order: sortby,
        offset: offset,
        limit: limit,
        page: page
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "offers retrieved successfully",
            data: response
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
* This is the function which used to check balance of the user
*/
exports.checkUserBalance = function (req, res) {
    userController.getUserInfoByID(req.decoded.user_id, function (err, user) {
        web3.eth.getBalance(user.metamask_info_id).then(balance => {
            res.json({
                status: true,
                message: "balance details successfull",
                return_id: balance / 1000000000000000000
            });
        });
    })
}

/**
 *  This is the function which used to report item
 */
exports.report = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    //var query = items.findOne({ _id: req.body.item_id })
    items.findOne({ where: { id: req.body.item_id } }).then(function (item, err) {
        if (err || !item) {
            res.json({
                status: false,
                message: "item not found",
                errors: err
            });
            return;
        }
        userController.getUserInfoByID(req.decoded.user_id, function (err, receiver) {
            var mailUser = receiver.first_name + ' ' + receiver.last_name;
            var mailTitle = "Report Notification";
            var mailContent = mailUser + ' reported Item. Item ID : ' + item.id + '\n\n' + req.body.message;
            mailer.mail({
                username: mailUser,
                content: mailContent
            }, config.site_email, mailTitle, receiver.mail, function (error, result) {
                if (error) {
                }
                res.json({
                    status: false,
                    message: "Report sent successfully",
                    errors: err
                });
            })
        });
    });
}

/**
 * This is the function which used to get balance for ethereum address
 */
checkbalance = function (eth_address, item, callback) {
    web3.eth.getBalance(eth_address).then(balance => {
        var eth = balance / 1000000000000000000;
        if (eth < (item.price + 0.2)) {
            callback(false);
        } else {
            callback(true)
        }
    });
}

/**
 * This is the function which used to get admin comission before transaction
 */

transferAdminComission = function (item, callback) {
    options.findOne({ where: { name: "admin_commission" } }).then(function (option, err) {
        if (err || !option) {
            callback("error", 0)
            return;
        }
        var commission = item.price * (option.value / 100);
        userController.getUserInfoByID(item.current_owner, function (err, sender) {
            users.findOne({ where: { role: 1 } }).then(function (receiver, err) {
                if (sender.id == receiver.id) {
                    callback("error", 0)
                    return;
                }
                var history = new histories();
                history.item_id = item.id;
                history.collection_id = item.collection_id;
                history.from_id = item.current_owner;
                history.to_id = receiver.id;
                history.transaction_hash = "";
                history.history_type = "admin_comission";
                history.price = commission;
                history.save().then(function (historyObj) {
                    callback(null, commission)
                })
            })
        })

    })
}


/**
 * This is the function which used to transfer erc721 token
 */
transferBalance = function (sender, receiver, item, commission, callback) {
    var sender_id = sender.id.toString();
    var receiver_id = receiver.id.toString();
    var author_id = item.author_id.toString();

    if (author_id == receiver_id) {
        callback(true)
    } else if (author_id == sender_id) {
        callback(true)
    } else {
        var royalty = item.price * (item.collection.royalties / 100);
        var history = new histories();
        history.item_id = item.id;
        history.collection_id = item.collection_id;
        history.from_id = sender.id;
        history.to_id = item.author_id;
        history.transaction_hash = "";
        history.history_type = "comission";
        history.price = royalty;
        history.save().then(function (historyObj) {
            callback(true)
        })
    }
}