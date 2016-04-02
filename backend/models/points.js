/**
 * results
 *
 * @author tobiasb
 * @since 2016
 */

module.exports = function(sequelize, DataTypes) {
  var Points = sequelize.define("Points", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    appointment_id: DataTypes.INTEGER,
    player_id: DataTypes.INTEGER,
    points: DataTypes.INTEGER,
    type: DataTypes.BOOLEAN
  }, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // disable the modification of table names; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    // if you don't want that, set the following
    freezeTableName: true,

    // define the table's name
    tableName: 'doko_points'
  });
  return Points;
};