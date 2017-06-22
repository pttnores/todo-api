"use strict";

var bcrypt = require("bcrypt");
var _ = require("underscore");
var cryptojs = require("crypto-js");
var jwt = require("jsonwebtoken");

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
            },
            findByToken: function (token) {
                return new Promise(function (resolve, reject) {
                    try {
                        var decodedJWT = jwt.verify(token, "elkjqwe654");
                        var bytes = cryptojs.AES.decrypt(decodedJWT.token, "abc123!@#!");
                        var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

                        user.findById(tokenData.id).then(function (user) {
                            if (user) {
                                resolve(tokenData);
                            } else {
                                reject();
                            }
                        }, function (error) {
                            reject(error);
                        });

                    } catch (error) {
                        reject(error);
                    }
                });
            }
        },
        instanceMethods: {
            toPublicJSON: function () {
                var json = this.toJSON();
                return _.pick(json, "id", "email", "createdAt", "updatedAt");
            },
            generateToken: function (type) {
                if (!_.isString(type)) {
                    return undefined;
                }
                try {
                    var stringData = JSON.stringify({id: this.get("id"), type: type});
                    var encryptedData = cryptojs.AES.encrypt(stringData, "abc123!@#!").toString();
                    var token = jwt.sign({token: encryptedData}, "elkjqwe654");
                    return token;
                } catch (error) {
                    console.log(error);
                    return undefined;
                }
            }

        }
    });

    return user;
};