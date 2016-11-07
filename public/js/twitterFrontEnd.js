/* global $ io*/
/**
 * This file holds the ui and networking logi for the frontend
 *
 * @summary   The module takes care off getting new tweets aswell as posting new tweets
 *
 * @link      URL
 * @since     07.11.2016
 * @requires jquery-3.1.0.js & socket.io
 **/

/**
 * This module holds the functionallity for frontend javascript for the site
 * @type {module}
 */
! function() {
    'use strict'

    var url = 'http://127.0.0.1:3000/' //The standard url

    //We connect to the servers socket
    var socket = io.connect(url)

    /**
     * This function takes html of a tweet, and adds it to the list of tweets
     * @param  {html} tweetHTML html of the tweet
     * @return {nil}            We don't return anything
     */
    var pasteTweet = function(tweetHTML) {
        $('.app--tweet--list').prepend(tweetHTML)
    }

    socket.on('tweet', pasteTweet)//When a tweet happends

    /**
     * This function recalculates the number of chars that the user can still write in thier tweet
     * @return {nil}  We don't return anything
     */
    var numberOfCharsLeft = function() {
        var tweetLength = $('#tweet-textarea').val().length
        $('#tweet-char').html(140-tweetLength)
    }

    $('#tweet-textarea').keyup(numberOfCharsLeft)//When the user types on thier tweet

    /**
     * This function sends a post request to the server with the text for a new tweet
     * @param  {event} event   The DOM event
     * @return {nil}           We don't return anything
     */
    var postNewTweet = function(event) {
        event.preventDefault()//Stop from reloading the page
        var tweetText = $('#tweet-textarea').val() //Get the text of the tweet
        if (tweetText != '') {//If it is not empty
            $.post(url + 'tweet', { //We send post request with the text
                text: tweetText
            }, function() {
                $('#tweet-textarea').val('')//Empty the tweet bar
            })
        }
    }

    $('.button-primary').click(postNewTweet) //when the user presses the tweet button

}()
