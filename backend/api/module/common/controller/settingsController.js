const db = require('../../../helper/db.config.js');
const options = db.options;
const users = db.users;

const { validationResult } = require('express-validator');

exports.installOptions = function (req, res) {
    // create admin user
    var user = new users();
    user.username = "admin";
    user.email = "admin@mail.com";
    user.password = '123456';
    user.first_name = "admin";
    user.last_name = "user";
    user.phone = "1234567890";
    user.profile_image = "";
    user.role = 1;
    user.status = 'active';
    user.save().then(function (userObj) {
        res.json({
            status: true,
            message: "user saved successfully",
            result: userObj
        });
    }).catch(function (err) {
        res.json({
            status: false,
            message: "Error",
            errors: err
        });
    });

    var option = new options();
    option.name = "admin_commission";
    option.value = 2;
    option.save();

    res.json({
        status: true,
        message: "Installation completed successful",
    });
}

/*
*  This is the function which used to set option value for admin settings
*/
exports.setOptions = function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.json({
            status: false,
            message: "Request failed",
            errors: errors.array()
        });
        return;
    }
    options.findOne({ where: { name: req.body.name } }).then(function (option, err) {
        if (option) {
            option.value = req.body.value;
            option.save().then(function (optionObj) {
                res.json({
                    status: true,
                    message: "Options saved successfully",
                });
            })
        } else {
            var optionadd = new options();
            optionadd.name = req.body.name;
            optionadd.value = req.body.value;
            optionadd.save().then(function (optionObj) {
                res.json({
                    status: true,
                    message: "Options saved successfully",
                });
            })
        }

    })
}


/*
*  This is the function which used to get option value for admin settings
*/
exports.getOptions = function (req, res) {
    options.findOne({ where: { name: req.query.name } }).then(function (option, err) {
        if (err || !option) {
            res.json({
                status: false,
                message: "Request failed",
                errors: err
            });
            return;
        }

        res.json({
            status: true,
            message: "Options detail reterived successfully successfully",
            result: option
        });

    })
}