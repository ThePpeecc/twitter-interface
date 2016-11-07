/**
 * This file holds the twitter functionality for the server side
 *
 * @summary   The module holds different functions that gets and sends data to and from the twitter servers
 *
 * @since     07.11.2016
 * @requires Node.js, twit, array-sort & moment
 * @NOTE     [For devs only this module also uses eslint for code quality]
 **/

//We get the required modules
var twitter = require('twit')
var arraySort = require('array-sort')
var moment = require('moment')


//Get twitter authentications keys
var credentials = require('./credentials.json')

//We set up the twitterStream with our credentials
var twitterStream = new twitter({
    consumer_key: credentials.twitter_consumer_key,
    consumer_secret: credentials.twitter_consumer_secret,
    access_token: credentials.twitter_access_token_key,
    access_token_secret: credentials.twitter_access_token_secret
})

//var stream = twitterStream.stream('user', { stringify_friend_ids: true })

/**
 stream.on('tweet', function (tweet) {
   console.log(tweet.text)
   //...
 })
 */


//This varaible holds a function that is passed to this module when you use the function getInfo, errorReporter uses this function when an error orccures
//The function that it holds is in this project used to serve an error page
var errorPage


/**
 * This function is called when there is a networking error in any of the different functions
 * It is used to tjek for error's before the function dose a callBack with potential damage or wrong data
 *
 * @param  {Error} err          The error object when the error orccures
 * @param  {Function} callBack  The callBack function from the twitter networking functions
 * @param  {json} data          This parameter can be pretty much anything but is primately a JSON object
 * @return {nil}                We don't return anything
 */
function errorReporter(err, callBack, data) {
    if (err == undefined) {
        callBack(data)
    } else {
        errorPage(err, data)
    }
}

/**
 * This function converts a date to a specifide format
 *
 * @param  {string} date  Simply a Date object in string format
 * @return {Date}         We return a formatted date object
 */
function convertDate(date) {
    return moment(date).format('D, MM, YYYY, HH:mm:ss')
}

/**
 * This function get a specifide number of tweets from the users timeline
 * @param  {int} numberOfTweets     The number of tweets to retive
 * @param  {function} callBack      The callBack function that is called when the networking is over
 * @return {nil}                    We don't return anything
 */
function getTweets(numberOfTweets, callBack) {
    twitterStream.get('statuses/home_timeline', { //We send some extra parameters with our get request
        count: numberOfTweets,
        exclude_replies: 'true',
        contributor_details: 'true'
    }, function(err, data) { //The networking return's
        errorReporter(err, callBack, data) //Here we use the errorReporter to do our callBack, this way we don't have to think about taking care of errors here
    })
}

/**
 * We get the users friends
 *
 * @param  {int} numberOfFriends The number of friends to get
 * @param  {function} callBack   The callBack function that is called when the networking is over
 * @return {nil}                  We don't return anything
 */
function getFriends(numberOfFriends, callBack) {
    twitterStream.get('friends/list', {
        count: numberOfFriends
    }, function(err, data) {
        errorReporter(err, callBack, data)
    })
}

/**
 * We get the messages
 *
 * @param  {int} numberOfMessages     The number of messages to get from the user, and a friend
 * @param  {function} callBack        The callBack function that is called when the networking is over
 * @return {nil}                      We don't return anything
 */
function getmessages(numberOfMessages, callBack) {
    twitterStream.get('direct_messages/sent', {
        count: numberOfMessages
    }, function(err, m) {//m stands for messages
        errorReporter(err, function(userMessages) {

            var recipient = userMessages[0].recipient //We chose the first message that the user sendt a message too. And save thier object
            var savedMessages = [] //An object with all our saved messages

            userMessages.forEach(message => { //We run through all of our user messages
                if (message.recipient.id === recipient.id) { //If the recipient is the same as our first recipient
                    message.created_at = convertDate(message.created_at) //We convert the date to make it easier to sort the messages later
                    savedMessages.push(message) //We save the message
                }
            })

            //We start to get the messages sendt to the user
            twitterStream.get('direct_messages', {
                count: numberOfMessages
            }, function(err, userRecivedMessages) {

                //We run through all the recived messages
                userRecivedMessages.forEach(message => {
                    if (message.sender.id === recipient.id) { //if the sender is the same as the recipient
                        message.created_at = convertDate(message.created_at)//We convert the date
                        savedMessages.push(message) //We save the message
                    }
                })

                //Here we sort the messages by date's
                //@NOTE we use the convertDate function too make the dates readable for the array-sort module
                arraySort(savedMessages, 'created_at')

                errorReporter(err, callBack, [savedMessages, recipient])//We do the callBack
            })

        }, m)
    })
}

/**
 * We get the users information ie. id, profile pic...
 * @param  {function} callBack    The callBack function that is called when the networking is over
 * @return {nil}                  We don't return anything
 */
function getUserInfo(callBack) {
    twitterStream.get('users/show', {
        screen_name: credentials.twitter_screen_name
    }, function(err, data) {
        errorReporter(err, callBack, data)
    })
}

/**
 * This function takes all of the above function's and dose all of the networking, so the whole thing will run synchronize
 * @param  {funciton} callBack When all of the callBack's from all of the different networking functions are done we call this callBack
 * @param  {function} error    This is the error callBack function, this funciton is called if there happends an error in any of the twitter funcitons
 * @return {nil}               We don't return anything
 */
var getInfo = function(callBack, error) {
    errorPage = error //We assing the error function to the global errorPage varialbe
    var tweets, friends, messages, user, recipient
    //We pretty much just go through all of the function one after the other
    getTweets(5, function(t) {
        tweets = t
        getFriends(5, function(f) {
            friends = f
            getmessages(5, function(mr) {
                messages = mr[0]
                recipient = mr[1]
                getUserInfo(function(u) {
                    user = u
                    callBack(tweets, friends.users, messages, user, recipient) //We do the last callBack
                })
            })
        })
    })
}

//Here we assing our exports
exports.getInfo = getInfo
