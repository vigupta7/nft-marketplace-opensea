const db = require('../../../helper/db.config.js');
const { Op } = require("sequelize");
const users = db.users;
const { validationResult } = require('express-validator');
var jwt = require('jsonwebtoken');
var randomstring = require("randomstring");
var bcrypt = require('bcrypt');
var validator = require('validator');
var config = require('./../../../helper/config')
var moment = require('moment');
var mailer = require('./../../common/controller/mailController');
var media = require('./../../media/controller/mediaController');
//var cp = require('child_process');
/*
*  This is the function which used to retreive user list
*/
exports.getList = async function (req, res) {
    var logged_id = '';
    var page = req.query.page ? req.query.page : 1;
    var limit = 15;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);

    if (req.query.user_id) {
        logged_id = req.query.user_id
    }
    var keyword = req.query.keyword ? req.query.keyword : '';
    keyword = keyword.replace("+", " ");

    var whereCondition = {};

    if (logged_id) {
        var blockerIDS = [];
        blockerIDS.push(logged_id)
        whereCondition.id = { [Op.notIn]: blockerIDS };
        //query = users.find({ '_id': { $nin: blockerIDS } });
    } else {
        //query = users.find();
    }

    if (keyword != '') {
        whereCondition = {
            [Op.or]: [
                {
                    first_name: {
                        [Op.substring]: keyword
                    }
                },
                {
                    last_name: {
                        [Op.substring]: keyword
                    }
                },
                {
                    email: {
                        [Op.substring]: keyword
                    }
                }
            ]
        };
    }
    //query = query.where('status', 'active').sort('-create_date')
    whereCondition.status = 'active';

    users.findAndCountAll({
        where: whereCondition,
        attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'profile_image'],
        order: ['create_date'],
        offset: offset,
        limit: limit,
        page: page
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Users retrieved successfully",
            data: response
        });
    });
}

/*
*   This is the function which used to retreive user list for admin
*/
exports.getAdminList = async function (req, res) {
    var logged_id = '';
    var page = req.query.page ? req.query.page : 1;
    var limit = 15;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);

    if (req.query.user_id) {
        logged_id = req.query.user_id
    }
    var keyword = req.query.keyword ? req.query.keyword : '';
    keyword = keyword.replace("+", " ");

    var whereCondition = {};

    //var query;
    if (logged_id) {
        var blockerIDS = [];
        blockerIDS.push(logged_id)
        whereCondition.id = { [Op.notIn]: blockerIDS };
        //query = users.find({ '_id': { $nin: blockerIDS } });
    } else {
        //query = users.find();
    }

    if (keyword != '') {
        whereCondition = {
            [Op.or]: [
                {
                    first_name: {
                        [Op.substring]: keyword
                    }
                },
                {
                    last_name: {
                        [Op.substring]: keyword
                    }
                },
                {
                    email: {
                        [Op.substring]: keyword
                    }
                }
            ]
        };
    }

    users.findAndCountAll({
        where: whereCondition,
        attributes: ['id','username', 'email', 'profile_image', 'first_name', 'last_name', 'status'],
        order: ['create_date'],
        offset: offset,
        limit: limit,
        page: page
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Users retrieved successfully",
            data: response
        });
    });
}

/*
*  This is the function which used to retreive user list
*/
exports.getListByIds = async function (req, res) {
    var whereCondition = {};
    whereCondition.id = { [Op.in]: req.body.users };

    users.findAll({
        where: whereCondition,
        attributes: ['id', 'username', 'email', 'profile_image']
    }).then(function (result) {
        res.json({
            status: true,
            message: "Users retrieved successfully",
            data: result
        });
    });
}

exports.login = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }

    if (validator.isEmail(req.body.username)) {
        params = { email: req.body.username };
    } else {
        params = { username: req.body.username };
    }
    this.loginUser(params, req, res);
}

loginUser = function (params, req, res) {
    console.log("Login")
    console.log(params)

    users.findOne({ where: params }).then(function (user, err) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: err
            });
            return;
        }
        if (this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "User not found",
            });
            return;
        }

        user.comparePassword(req.body.password, (err, match) => {
            if (!match) {
                res.json({
                    status: false,
                    message: "Password is mismatch"
                });
                return;
            }
            if (user.status == 'inactive') {
                res.json({
                    status: false,
                    message: "Your account has been inactive. contact admin to activate your account",
                });
                return;
            }
            if (user.status == 'blocked') {
                res.json({
                    status: false,
                    message: "Your account has been blocked. contact admin to activate your account",
                });
                return;
            }

            if (req.body.device_info) {
                var device_info = JSON.parse(req.body.device_info);
                user.device_info = device_info;
                user.save().then(function (err) {
                    let token = jwt.sign({ user_id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, profile_image: user.profile_image ? user.profile_image : '', status: user.status, dob: user.dob, phone: user.phone, role: user.role },
                        config.secret_key,
                        {
                            expiresIn: '24h' // expires in 24 hours
                        }
                    );
                    res.json({
                        status: true,
                        token: token,
                        message: "Login successful",
                    });
                })
            } else {
                let token = jwt.sign({ user_id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, profile_image: user.profile_image ? user.profile_image : '', status: user.status, dob: user.dob, phone: user.phone, role: user.role },
                    config.secret_key,
                    {
                        expiresIn: '24h' // expires in 24 hours
                    }
                );
                res.json({
                    status: true,
                    token: token,
                    message: "Login successful",
                });
            }


        });
    });
}

/*
*  This is the function which used to retreive user detail by user id
*/
exports.details = function (req, res) {
    users.findOne({
        where: { id: req.params.userId },
        attributes: ['id', 'username', 'email', 'first_name', 'last_name', 'profile_image', 'profile_cover', 'metamask_info_id', 'metamask_info_type', 'password', 'status', 'create_date'],
    }).then(function (user, err) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: "User not found"
            });
            return;
        }
        if (this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "Request failed",
                errors: "User not found"
            });
            return;
        }
        res.json({
            status: true,
            message: "Profile info retrieved successfully",
            result: user
        });
    });
}

/*
*  This is the function which used to create new user in Cryptotrades
*/
exports.register = function (req, res) {
    if (req.body.social_info) {
        this.checkSocialUserExist(req, res, function (result) {
            if (result) {
                var social_info = JSON.parse(req.body.social_info)

                var params;
                if (social_info.type == "metamask") {
                    params = { 'metamask_info_id': social_info.id }
                }
                this.loginUserWithSocial(params, req, res);
            } else {
                var social_info = JSON.parse(req.body.social_info)
                console.log("social_info ", social_info)
                this.registerUser(req, res);
            }
        });
    } else {
        res.json({
            status: false,
            message: "Request failed. register not accepted without connect wallet",
        });
    }
}

/**
 *   This is the function handle user registration
 */
registerUser = function (req, res) {

    console.log("req.body ", req.body);
    var user = new users();
    user.username = req.body.username ? req.body.username : "";
    user.email = req.body.email ? req.body.email : "";
    user.password = req.body.password ? req.body.password : "";
    user.first_name = req.body.first_name ? req.body.first_name : "";
    user.last_name = req.body.last_name ? req.body.last_name : "";
    user.phone = req.body.phone ? req.body.phone : "";
    user.profile_image = req.body.profile_image ? req.body.profile_image : "";
    user.dob = req.body.dob ? req.body.dob : "";

    if (req.body.device_info) {
        var device_info = JSON.parse(req.body.device_info);
        user.device_info = device_info;
    }

    if (req.body.social_info) {
        var social_info = JSON.parse(req.body.social_info);
        social_info = {
            id: social_info.id ? social_info.id : '',
            type: social_info.type ? social_info.type : '',
        }

        let username = randomstring.generate({
            length: 10,
            charset: 'alphabetic'
        });
        user.username = username
        user.metamask_info_id = social_info.id;
        user.metamask_info_type = social_info.type;
        //user.metamask_info = social_info;

    }
    user.status = 'active';

    user.save().then(function (user) {
        let token = jwt.sign({ user_id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, profile_image: user.profile_image ? user.profile_image : '', status: user.status, dob: user.dob, phone: user.phone, role: user.role },
            config.secret_key,
            {
                expiresIn: '1h' // expires in 1 hours
            }
        );

        res.json({
            status: true,
            token: token,
            message: "Registration successful",
        });
    }).catch(function (err) {
        console.log("Catech error ", err)
        res.json({
            status: false,
            message: "Request failed",
            errors: err
        });
    });
}

/*
*  This function used to find whether user name exist or not
*/
checkUserNameExist = function (req, res, callback) {
    if (req.body.username) {
        users.findOne({ where: { 'username': req.body.username } }).then(function (data, err) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors: err
                });
                return;
            }
            if (data.length > 0) {
                res.json({
                    status: false,
                    message: "User Name already Exist",
                    errors: "User Name already Exist"
                });
                return;
            }
            callback(true)
        })
    } else {
        res.json({
            status: false,
            message: "User Name is required",
            errors: "User Name is required"
        });
        return;
    }
}

/*
*  This function used to find whether email exist or not
*/
checkEmailExist = function (req, res, callback) {
    if (req.body.email) {
        users.findOne({ where: { 'email': req.body.email } }).then(function (data, err) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors: err
                });
                return;
            }
            if (data.length > 0) {
                res.json({
                    status: false,
                    message: "Email already Exist",
                    errors: "Email already Exist"
                });
                return;
            }
            callback(true)
        })
    } else {
        res.json({
            status: false,
            message: "Email is required",
            errors: "Email is required"
        });
        return;
    }
}

/**
 * This is the function which used to check if user social account have or not
 */
checkSocialUserExist = function (req, res, callback) {
    var social_info = JSON.parse(req.body.social_info)
    var params;
    console.log("social_info.type: ", social_info.type)
    console.log("social_info.id: ", social_info.id)
    if (social_info.type == "metamask") {
        params = { 'metamask_info_id': social_info.id }
    }

    users.findOne({ where: params }).then(function (data, err) {

        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: err
            });
            return;
        }
        callback(data != undefined)

    })

}

/**
 * This is the function which used to process login user with social login
 */
loginUserWithSocial = function (params, req, res) {
    users.findOne({ where: params }).then(function (user, err) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: err
            });
            return;
        }
        if (this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "User not found",
            });
            return;
        }
        if (user.status == 'inactive') {
            res.json({
                status: false,
                message: "Your account has been inactive. contact admin to activate your account",
            });
            return;
        }
        if (user.status == 'blocked') {
            res.json({
                status: false,
                message: "Your account has been blocked. contact admin to activate your account",
            });
            return;
        }

        if (req.body.device_info) {
            var device_info = JSON.parse(req.body.device_info);
            user.device_info = device_info;
            user.save().then(function (err) {
                let token = jwt.sign({ user_id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, profile_image: user.profile_image ? user.profile_image : '', status: user.status, dob: user.dob, phone: user.phone, role: user.role },
                    config.secret_key,
                    {
                        expiresIn: '24h' // expires in 24 hours
                    }
                );
                res.json({
                    status: true,
                    token: token,
                    message: "Login successful",
                });
            });
        } else {
            let token = jwt.sign({ user_id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, profile_image: user.profile_image ? user.profile_image : '', status: user.status, dob: user.dob, phone: user.phone, role: user.role },
                config.secret_key,
                {
                    expiresIn: '24h' // expires in 24 hours
                }
            );
            res.json({
                status: true,
                token: token,
                message: "Login successful",
            });
        }
    });
}



/*
*  This is the function which used to update user profile
*/
exports.update = function (req, res) {
    var user_id = req.decoded.user_id;
    var whereCondition = {};
    whereCondition.id = { [Op.ne]: user_id };

    //var query = users.find();
    if (req.body.email) {
        whereCondition.email = req.body.email;
    }
    if (req.body.username) {
        whereCondition.username = req.body.username;
    }
    //query = users.find(params);
    console.log("whereCondition ", whereCondition)
    users.findAll({
        where: whereCondition,
    }).then(function (data, err) {
        if (req.body.email || req.body.username) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors: err
                });
                return;
            }
            if (data.length > 0) {
                res.json({
                    status: false,
                    message: "Email or Username already exist"
                });
                return;
            }
        }

        users.findOne({ where: { id: user_id } }).then(function (user, err) {
            if (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors: err
                });
                return;
            }
            if (this.isEmptyObject(user)) {
                res.json({
                    status: false,
                    message: "User not found"
                });
                return;
            }
            if (user.status == 'inactive') {
                res.json({
                    status: false,
                    message: "Your account has been inactive. Contact admin to activate your account"
                });
                return;
            }
            if (user.status == 'blocked') {
                res.json({
                    status: false,
                    message: "Your account has been blocked. Contact admin to activate your account"
                });
                return;
            }

            user.first_name = req.body.first_name ? req.body.first_name : user.first_name;
            user.last_name = req.body.last_name ? req.body.last_name : user.last_name;
            user.profile_image = req.body.profile_image ? req.body.profile_image : user.profile_image;
            user.profile_cover = req.body.profile_cover ? req.body.profile_cover : user.profile_cover;
            user.email = req.body.email ? req.body.email : user.email;
            user.username = req.body.username ? req.body.username : user.username;
            user.dob = req.body.dob ? req.body.dob : user.dob;
            user.phone = req.body.phone ? req.body.phone : user.phone;
            if (req.body.password) {
                user.password = req.body.password
            }
            if (req.body.social_info) {
                var social_info = JSON.parse(req.body.social_info);
                social_info = {
                    id: social_info.id ? social_info.id : '',
                    type: social_info.type ? social_info.type : '',
                }
                if (social_info.type == "metamask") {
                    user.metamask_info_id = social_info.id;
                    user.metamask_info_type = social_info.type;
                }
            }

            if (req.body.device_info) {
                var device_info = JSON.parse(req.body.device_info);
                user.device_info = device_info;
            }

            user.modified_date = moment().format();
            // save the user and check for errors
            user.save().then(function (result) {
                console.log("usr ", result);
            }).catch(function (err) {
                res.json({
                    status: false,
                    message: "Request failed",
                    errors: err
                });
                return;
            });

            let token = jwt.sign({ user_id: user.id, username: user.username, email: user.email, first_name: user.first_name, last_name: user.last_name, profile_image: user.profile_image ? user.profile_image : '', status: user.status, dob: user.dob, social_info: user.social_info, phone: user.phone, role: user.role },
                config.secret_key,
                {
                    expiresIn: '24h' // expires in 24 hours
                }
            );
            res.json({
                status: true,
                token: token,
                message: "profile updated successfully",
            });

        });
    });
}

/*
*  This is the function which used to update user profile
*/
exports.updatesettings = function (req, res) {
    users.findOne({ where: { id: req.decoded.user_id } }).then(function (user, err) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: err
            });
            return;
        }
        if (this.isEmptyObject(user)) {
            res.json({
                status: false,
                message: "User not found"
            });
            return;
        }
        if (user.status == 'inactive') {
            res.json({
                status: false,
                message: "Your account has been inactive. Contact admin to activate your account"
            });
            return;
        }
        if (user.status == 'blocked') {
            res.json({
                status: false,
                message: "Your account has been blocked. Contact admin to activate your account"
            });
            return;
        }
        user.is_notification = req.body.is_notification;
        user.modified_date = moment().format();
        user.save().then(function (user) {
            res.json({
                status: true,
                message: "profile settings updated successfully",
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

/**
 *   This is the function check object is empty or not
 */
exports.getUserInfoByID = function (userId, callback) {
    users.findOne({ where: { id: userId } }).then(function (user, err) {
        if (err) {
            callback(err, null)
            return;
        }
        if (this.isEmptyObject(user)) {
            callback({
                status: false,
                message: "Request failed",
                errors: "User not found"
            }, null);
            return;
        }
        user.profile_image = user.profile_image ? user.profile_image : '';
        callback(null, user)
    })
}


/**
 *   This is the function check object is empty or not
 */
isEmptyObject = function (obj) {
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}



/*
*   This is the function which used to update user profile from admin
*/
exports.updateUser = function (req, res) {
    var user_id = req.body.user_id;
    var whereCondition = {};
    whereCondition['id'] = { [Op.ne]: user_id };

    //var query = users.find();
    if (req.body.email) {
        whereCondition['email'] = req.body.email;
    }
    if (req.body.username) {
        whereCondition['username'] = req.body.username;
    }
    //query = users.find(params);

    users.findAll({
        where: whereCondition,
    })
        .then(function (data, err) {
            if (req.body.email || req.body.username) {
                if (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors: err
                    });
                    return;
                }
                if (data.length > 0) {
                    res.json({
                        status: false,
                        message: "Email or Username already exist"
                    });
                    return;
                }
            }

            users.findOne({ where: { id: req.body.user_id } }).then(function (user, err) {
                if (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors: err
                    });
                    return;
                }
                if (this.isEmptyObject(user)) {
                    res.json({
                        status: false,
                        message: "User not found"
                    });
                    return;
                }
                user.first_name = req.body.first_name ? req.body.first_name : user.first_name;
                user.last_name = req.body.last_name ? req.body.last_name : user.last_name;
                user.profile_image = req.body.profile_image ? req.body.profile_image : user.profile_image;
                user.profile_cover = req.body.profile_cover ? req.body.profile_cover : user.profile_cover;
                user.email = req.body.email ? req.body.email : user.email;
                user.username = req.body.username ? req.body.username : user.username;
                user.dob = req.body.dob ? req.body.dob : user.dob;
                user.phone = req.body.phone ? req.body.phone : user.phone;
                if (req.body.password) {
                    user.password = req.body.password
                }
                user.status = req.body.status ? req.body.status : ''
                user.modified_date = moment().format();
                user.save().then(function (user) {
                    res.json({
                        status: true,
                        message: "profile updated successfully",
                    });
                }).catch(function (err) {
                    res.json({
                        status: false,
                        message: "Request failed",
                        errors: err
                    });
                });
            });
        });
}



