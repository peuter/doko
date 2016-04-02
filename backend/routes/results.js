var express = require('express');
var router = express.Router();
var model = require('../models');

/* GET users listing. */
router.route('/')

  // add a new result
  .post(function(req, res) {

    var year = new Date(req.body.date).getFullYear();
    
    // calculate average
    var sum = 0;
    var playerCounter = 0;
    req.body.players.forEach(function (player) {
      if (player.points) {
        playerCounter++;
        sum+=parseInt(player.points,10);
      }
    });

    if (playerCounter === 0) {
      res.json(true);
      return;
    }
    var avg = Math.ceil(sum/playerCounter);

    if (avg === 0) {
      res.json(true);
      return;
    }

    // apply average to players without points
    req.body.players.forEach(function (player) {
      if (!player.points) {
        player.points = avg;
      }
    });

    // find players in model
    var promises = [];
    req.body.players.forEach(function (player) {
      promises.push(
        model.Player.findOne({
          where: {
            nick: player.nick
          }
        })
      );
    },this);

    Promise.all(promises).then(function(modelPlayers) {
        model.sequelize.transaction(function(t) {
          return model.Appointment.findOrCreate({
            where: {
              date: req.body.date
            },
            defaults: {
              place: req.body.place
            },
            transaction: t
          }).spread(function(appointment, created) {
            var promises = [];

            if (created === false) {
              // update place
              appointment.place = req.body.place;
              promises.push(appointment.save());
            }

            // create the Point DB entries
            modelPlayers.forEach(function (player, index) {
              promises.push(model.Points.findOrCreate({
                  include: [model.Player],
                  where: {
                    appointment_id: appointment.id,
                    player_id: player.id
                  },
                  defaults: {
                    points: req.body.players[index].points
                  },
                  transaction: t
                })
              );
            });

            return Promise.all(promises);
          }).spread(function() {
            var promises = [];
            for (var key in arguments) {

              if (Array.isArray(arguments[key])) {
                // findOrCreate returns array
                var points = arguments[key][0];
                var created = arguments[key][1];
                if (created === false) {
                  // update points
                  req.body.players.some(function(p) {
                    if (p.nick === points.Player.nick) {
                      points.points = p.points;
                      return true;
                    }
                  });
                  promises.push(points.save());
                }
              }
            }
            return Promise.all(promises);
          });
        }).then(function(result) {
          if (result.length > 0) {
            res.json({refresh: year});
          } else {
            res.json({refresh: false});
          }
        }).catch(function(err) {
          console.log(err);
          res.send(err);
        });

    });
  })
  .get(function(req, res) {
    model.Points.findAll({
      include: [model.Appointment, model.Player]
    }).then(function(points) {
      res.json(points);
    });
  });


router.get('/:year', function(req, res) {
  model.Points.findAll({
    include: [model.Player, {
      model: model.Appointment,
      where: {
        date: {
          $gte: new Date(parseInt(req.params.year), 0, 1),
          $lt: new Date(parseInt(req.params.year)+1, 0, 1)
        }
      }
    }]
  }).then(function(points) {
    res.json(points);
  }).catch(function(err) {
    res.send(err);
  });
});

module.exports = router;
