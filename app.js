/**
 * This file holds the server and route functionality
 *
 * @summary   The module holds the route and server functionality, it also is the place where we render the jade files
 *
 * @since     07.11.2016
 * @requires Node.js, twitter.js, express & moment
 * @NOTE     [For devs only this module also uses eslint for code quality]
 **/

//We get our required module
var express = require('express')
var twitter = require('./twitter')

var app = express()

//We setup our static server
app.use('/static', express.static(__dirname + '/public'))

//We specifi where to find our templates
app.set('view engine', 'jade')
app.set('views', __dirname + '/views')

//We add the moment module under the app.locals, so that we can access the module in jade
app.locals.moment = require('moment')

/* GET home page. */
app.get('/', function(req, res) {

    twitter.getInfo(function(tweets, friends, message, user, recipient) { //We call the getInfo function to get the basic information for the user
        res.render('index', { //We render the index because the information was retrived successfully
            tweets: tweets,
            friends: friends,
            messages: message,
            user: user,
            recipient: recipient
        })
    }, function(err, data) {
        res.render('error', { //We render the error page, since we got an error
            error: err,
            data: data
        })
    })
})

/* We set the server to litsten at 127.0.0.1:3000 */
app.listen(3000, function() {
    console.log('App listening at 127.0.0.1:3000')
})
