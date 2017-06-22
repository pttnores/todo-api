"use strict";

var bcrypt = require("bcrypt");
var _ = require("underscore");

module.exports = function (sequelize, DataTypes) {
    var user = sequelize.define("user", {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        salt: {
            type: DataTypes.STRING
        },
        password_hash: {
            type: DataTypes.STRING
        },
        password: {
            type: DataTypes.VIRTUAL,
            allowNull: false,
            validate: {
                len: [7, 100]
            },
            set: function (value) {
                var salt = bcrypt.genSaltSync(10);
                var hashedPassword = bcrypt.hashSync(value, salt);

                this.setDataValue("password", value);
                this.setDataValue("salt", salt);
                this.setDataValue("password_hash", hashedPassword);
            }
        }
    }, {
        hooks: {
            beforeValidate: function (user, options) {
                // user.email
                if (typeof user.email === "string") {
                    user.email = user.email.toLowerCase();
                }
            }
        },
        classMethods: {
            authenticate: function (body) {
                return new Promise(function (resolve, reject) {
                    if (typeof body.email !== "string" || typeof body.password !== "string") {
                        return reject({error: "Wrong request"});
                    }

                    user.findOne({
                        where: {
                            email: body.email.trim()
                        }
                    }).then(function (user) {
                        if (!user) {
                            reject({error: "User not found"});
                        } else if (!bcrypt.compareSync(body.password, user.get("password_hash"))) {
                            reject({error: "Wrong password"});
                        }

                        resolve(user);

                    }, function (error) {
                        console.log(error);
                        reject(error);
                    });
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON();
                return _.pick(json, "id", "email", "createdAt", "updatedAt");
            }

        }
    });

    return user;
};