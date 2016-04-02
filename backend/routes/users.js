var express = require('express');
var router = express.Router();
var model = require('../models');

/* GET users listing. */
router.route('/users')

  // add a new result
  .post(function(req, res) {
    
    // find player
    model.Player.findOne({
      where: {
        nick: req.body.nick
      }
    }).then(function(player) {
      if (player) {
        return model.User.create({
          username: req.body.username,
          password: req.body.password,
          player_id: player.id
        });
      } else {
        return false;
      }
    }).then(function(user) {
      if (user === false) {
        res.json({success: true});
      } else {
        res.json({success: false});
      }
    }).catch(function(err) {
      console.log(err);
      res.json({success: false, error: err});
    });
  });

router.post('/users/login', function(req, res) {
  // find user
  model.User.findOne({
    where: {
      username: req.body.username
    },
    include: [model.Player]
  }).then(function(user) {
    user.verifyPassword(req.body.password, function(err, isMatch) {
      var result = { login: false };
      if (err) {
        result.error = err;
      }
      if (isMatch) {
        result.login = true;
        result.user =  {
          name: user.Player.nick,
          role: user.role || 'user'
        }
      }
      res.json(result);
    });
  });
});

module.exports = router;
