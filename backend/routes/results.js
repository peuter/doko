var express = require('express');
var router = express.Router();
var model = require('../models');
var passport = require('passport');

/* GET users listing. */
router.route('/')

  // add a new result
  .post(passport.authenticate('basic', { session: false }),
    function(req, res) {

    var year = new Date(req.body.date).getFullYear();

    // find players in model
    var promises = [];
    req.body.players.forEach(function (player) {
      if (player.points) {
        promises.push(
          model.Player.findOne({
            where: {
              nick: player.nick
            }
          })
        );
      }
    },this);

    if (promises.length === 0) {
      // nothing to do
      res.json({refresh: false});
      return
    }

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
          res.json(err);
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

router.delete('/:id', passport.authenticate('basic', { session: false }),
  function(req, res) {
    model.Appointment.findById(parseInt(req.params.id, 10)).then(function(appointment) {
      if (appointment) {
        var year = appointment.date.getFullYear();
        appointment.destroy();
        res.json({refresh: year});
      } else {
        res.json({refresh: false});
      }
    });
  }
);

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
