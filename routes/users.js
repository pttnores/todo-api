"use strict";

var express = require("express");
var router = express.Router();
var _ = require("underscore");
var db = require("../db.js");
var middleware = require("../middleware.js")(db);

router.get("/", middleware.requireAuthentication, function (req, res) {
    var queryParams = req.query;

    var where = {};

    if (queryParams.hasOwnProperty("email") && queryParams.email.length > 0) {
        where.email = queryParams.email.toString();
    }
    console.log(where);
    db.user.findAll({
        where: where
    }).then(function (users) {
        return res.json(users);
    }).catch(function (error) {
        return res.status(400).json(error);
    });
});

/* GET user*/
router.get("/:id", middleware.requireAuthentication, function (req, res) {
    var userId = parseInt(req.params.id);

    db.user.findById(userId).then(function (user) {
        if (!!user) {
            res.json(user.toPublicJSON());
        } else {
            res.status(404).json({
                error: "User not found"
            });
        }
    }, function (error) {
        return res.status(500).json(error);
    });
});

/* Post create new user */
router.post("/", /*middleware.requireAuthentication,*/ function (req, res) {
    var body = _.pick(req.body, "email", "password");

    db.user.create(body).then(function (user) {
        return res.json(user.toPublicJSON());
    }).catch(function (error) {
        console.log(error);
        return res.status(400).json(error);
    });
});

/* Update one user */
router.put("/:id", middleware.requireAuthentication, function (req, res) {
    var userId = parseInt(req.params.id);
    var body = _.pick(req.body, "email", "password");
    var attributes = {};

    if (body.hasOwnProperty("password")) {
        attributes.password = body.password.trim();
    }

    if (body.hasOwnProperty("email")) {
        attributes.email = body.email;
    }

    db.user.findById(userId).then(function (user) {
        if (user) {
            user.update(attributes).then(function (user) {
                return res.json(user.toPublicJSON());
            }, function (error) {
                return res.status(400).json(error);
            });
        } else {
            res.status(404).json({
                error: "User not found"
            });
        }
    }, function (error) {
        return res.status(500).json(error);
    });
});

/** Delete a user */
router.delete("/:id", middleware.requireAuthentication, function (req, res) {
    var userId = parseInt(req.params.id);
    db.user.destroy({
        where: {
            id: userId
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            return res.status(404).json({error: "No user for id " + userId});
        }
        return res.sendStatus(204);
    }).catch(function (error) {
        return res.status(400).json(error);
    });
});

/* Post create new user */
router.post("/login", function (req, res) {
    var body = _.pick(req.body, "email", "password");

    db.user.authenticate(body).then(function (user) {
        var token = user.generateToken("authentication");
        if (token) {
            return res.header("Auth", token).json(user.toPublicJSON());
        } else {
            return res.sendStatus(401);
        }
    }, function (error) {
        console.log(error);
        return res.sendStatus(401);
    });
});

module.exports = router;
