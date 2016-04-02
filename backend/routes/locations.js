var express = require('express');
var router = express.Router();
var model = require('../models');
var geolib = require('geolib');

/* GET users listing. */
router.route('/locations')

  // search closest location
  .post(function(req, res) {

    model.Location.findAll({ include: [ model.Player ] }).then(function(locations) {
      console.log(req.body);
      var point = {
        latitude: req.body.latitude,
        longitude: req.body.longitude
      };
      var spots = [];
      locations.forEach(function(loc, index) {
        spots.push({
          latitude: loc.latitude,
          longitude: loc.longitude,
          index: index
        });
      });
      console.log(point);
      console.log(spots);
      var closest = geolib.findNearest(point, spots);
      if (closest) {
        res.json({
          place: locations[closest.index].Player.nick,
          distance: geolib.getDistance(point, closest)
        });
      } else {
        res.json({
          error: 'no location found'
        })
      }
    });
  });

module.exports = router;
