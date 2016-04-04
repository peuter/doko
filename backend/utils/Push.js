/**
 * Push
 *
 * @author tobiasb
 * @since 2016
 */

var request = require('request');
var jwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiIzNGJkODM1YS0xMDVmLTQwYzYtYmQ3OS1jZDVjMmI4NGRmYWQifQ.1xcDRnf8GHoHlou5OdTfI6gMclP4rkcyP79M0iP0yzg';
var tokens = [];
var profile = 'doko-release';

var push = {

  send: function(title, message) {
    var options = {
      url: 'https://api.ionic.io/push/notifications',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+jwt
      },
      data: {
        "tokens": tokens,
        "profile": profile,
        "notification": {
          "title": title,
          "message": message
        }
      }
    };
    request.post(options, function(err, httpResponse, body) {
      if (err) {
        console.error('Error sending push notification:', err);
      } else {
        console.log(httpResponse);
      }
    })
  }
};

module.exports = push;