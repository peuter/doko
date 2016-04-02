/**
 * Player locations
 *
 * @author tobiasb
 * @since 2016
 */
module.exports = function(sequelize, DataTypes) {
  var Location = sequelize.define("Location", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    player_id: DataTypes.INTEGER,
    radius: DataTypes.INTEGER,
    latitude: DataTypes.FLOAT,
    longitude: DataTypes.FLOAT
  }, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // disable the modification of table names; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    // if you don't want that, set the following
    freezeTableName: true,

    // define the table's name
    tableName: 'doko_locations'
  });
  return Location;
};