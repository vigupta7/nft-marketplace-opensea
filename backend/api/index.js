const express = require('express')
const app = express()
const fs = require("fs");
const https = require("https");
var config = require("./helper/config")
var bodyParser = require('body-parser');
var user = require("./module/user/route/user")

var category = require("./module/category/route/category")
var collection = require("./module/collection/route/collection")
var media = require("./module/media/route/media")
var settings = require("./module/common/route/settings")
var item = require("./module/item/route/item");

var options = require('./module/common/model/optionsModel')
var request = require('request');
var firstTime = true;

var cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
global.__basedir = __dirname;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/media'));
app.use(cors());

/*
* Below lines used to define route for the api services
*/
app.get('/', (req, res) => res.send('Welcome to MarketPlace API'))
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/user', user)
app.use('/settings', settings)
app.use('/media', media)
app.use('/category', category);
app.use('/collection', collection)
app.use('/item', item)

const db = require("./helper/db.config");

// db.sequelize.sync({ force: false })
//     .then(() => {
//         console.log("Synced db.");
//     })
//     .catch((err) => {
//         console.log("Failed to sync db: " + err.message);
//     });

/*
* Below lines used to handle invalid api calls
*/
app.use(function (req, res, next) {
    res.status(404).send("Sorry can't find that!")
})
app.use(function (err, req, res, next) {
    console.error(err.stack)
    res.status(500).send('Something broke!')
})

if (firstTime == true) {
    var dayInMilliseconds = 1000 * 60 * 60 * 24;
    firstTime = false;
    setInterval(() => {
        updateUSD()
    }, dayInMilliseconds);
}

function updateUSD() {
    request(config.converstion_url, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            var result = JSON.parse(body);
            console.log(result.USD) // Print the google web page.
            options.findOne({ name: "ethtousd" }, function (err, option) {
                if (option) {
                    option.value = result.USD;
                    option.save(function (err, option) {
                        console.log("option updated")
                    })
                } else {
                    var optionadd = new options();
                    optionadd.name = "ethtousd";
                    optionadd.value = result.USD;
                    optionadd.save(function (err, option) {
                        console.log("option added")
                    })
                }

            })
        }
    })

}
/*
* Below lines used to run api service 
*/
// https.createServer(options, app).listen(config.app.port, () => console.log(`Cryptotrades app listening on port ${config.app.port}!`));
app.listen(config.app.port, () => console.log(`Marketplace app listening on port ${config.app.port}!`))