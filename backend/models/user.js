/**
 * User model
 *
 * @author tobiasb
 * @since 2016
 */
var bcrypt = require('bcrypt-nodejs');

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: DataTypes.STRING,
    password: {
      type: DataTypes.INTEGER,
      set : function(pwd) {
        // Password changed so we need to hash it
        var salt = bcrypt.genSaltSync(5);
        this.setDataValue('password', bcrypt.hashSync(pwd, salt));
      }
    },
    player_id: DataTypes.INTEGER,
    role: DataTypes.ENUM('admin', 'user')
  }, {
    // don't add the timestamp attributes (updatedAt, createdAt)
    timestamps: false,

    // disable the modification of table names; By default, sequelize will automatically
    // transform all passed model names (first parameter of define) into plural.
    // if you don't want that, set the following
    freezeTableName: true,

    // define the table's name
    tableName: 'doko_users',

    instanceMethods: {
      verifyPassword: function(password, cb) {
        bcrypt.compare(password, this.getDataValue('password'), function(err, isMatch) {
          if (err) return cb(err);
          cb(null, isMatch);
        });
      },
      verifyEncryptedPassword: function(password, cb) {
        if (password === this.getDataValue('password')) {
          cb(null, isMatch);
        } else {
          cb("password not valid");
        }
      }
    }
  });
  return User;
};