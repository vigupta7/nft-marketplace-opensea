const db = require('../../../helper/db.config.js');
const categories = db.categories;

//var categories = require('./../model/my_categoryModel');
var validator = require('validator');
const { validationResult } = require('express-validator');

/*
*  This is the function which used to retreive active category list
*/
exports.getList = async function (req, res) {
    const categoryObj = await categories.findAll({ where: { status: 'active' }, order: ['create_date'] });

    res.json({
        status: true,
        message: "Category retrieved successfully",
        data: categoryObj
    });
}

/*
*  This is the function which used to retreive category detail by category id
*/
exports.details = function (req, res) {

    categories.findOne({ where: { id: req.query.category_id } }).then(function (category, err) {
        if (err) {
            res.json({
                status: false,
                message: "Request failed",
                errors: "Category not found"
            });
            return;
        }
        if (!category) {
            res.json({
                status: false,
                message: "Request failed",
                errors: "Category not found"
            });
            return;
        }
        res.json({
            status: true,
            message: "Category info retrieved successfully",
            result: category
        });
    })
}

/**
 * This is the function which used to list all categories
 */
exports.getAdminList = function (req, res) {
    var page = req.query.page ? req.query.page : 1;
    var limit = 10;
    var offset = (page == 1) ? 0 : ((parseInt(page - 1)) * limit);

    categories.findAndCountAll({
        attributes: ['id','title', 'category_image', 'status', 'create_date'],
        order: ['create_date'],
        offset: offset,
        limit: limit,
        page: page
    }).then(function (result) {
        const response = db.getPagingData(result, page, offset, limit);
        res.json({
            status: true,
            message: "Category retrieved successfully",
            data: response
        });
    });
}

/**
 * This is the function which used to add category from admin
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
    var category = new categories();
    category.title = req.body.title;
    category.category_image = req.body.category_image;
    category.status = req.body.status;
    category.save().then(function (categoryObj) {
        res.json({
            status: true,
            message: "Category created successfully",
            result: categoryObj
        });
    }).catch(function (err) {
        res.json({
            status: false,
            message: "Request failed",
            errors: err
        });
    });
}

/**
 *  This is the function which used to update category 
 */
exports.edit = function (req, res) {
    categories.findOne({ where: { id: req.body.category_id } }).then(function (category, err) {
        if (err || !category) {
            res.json({
                status: false,
                message: "Category not found",
                errors: err
            });
            return;
        } else {
            category.title = req.body.title ? req.body.title : category.title;
            category.category_image = req.body.category_image ? req.body.category_image : category.category_image;
            category.status = req.body.status;
            category.save().then(function (category) {
                res.json({
                    status: true,
                    message: "Category updated successfully",
                    result: category
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

/**
 *  This is the function which used to delete category 
 */
exports.delete = function (req, res) {
    categories.findOne({ where: { id: req.body.category_id } }).then(function (category, err) {
        if (err || !category) {
            res.json({
                status: false,
                message: "Category not found",
                errors: err
            });
            return;
        } else {
            categories.destroy({ where: { id: req.body.category_id } }).then(function (err) {
                res.json({
                    status: true,
                    message: "Category deleted successfully"
                });
            })
        }
    });
}










