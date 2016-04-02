/**
 * results
 *
 * @author tobiasb
 * @since 2016
 */

module.exports = function(sequelize, DataTypes) {
  var Player = sequelize.define("Player", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    nick: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    surname: DataTypes.STRING,
    start: DataTypes.DATEONLY,
    end: DataTypes.DATEONLY
  }, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // disable the modification of table names; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    // if you don't want that, set the following
    freezeTableName: true,

    // define the table's name
    tableName: 'doko_players'
  });
  return Player;
};