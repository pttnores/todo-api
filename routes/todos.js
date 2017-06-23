"use strict";

var express = require("express");
var router = express.Router();
//var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("../db.js");
var middleware = require("../middleware.js")(db);

/* GET todos?completed=true&q=work collection */
router.get("/", middleware.requireAuthentication, function (req, res) {
    var queryParams = req.query;

    var where = {userId: req.user.get("id")};

    if (queryParams.hasOwnProperty("completed") && queryParams.completed === "true") {
        where.completed = true;
    } else if (queryParams.hasOwnProperty("completed") && queryParams.completed === "false") {
        where.completed = false;
    }

    if (queryParams.hasOwnProperty("q") && queryParams.q.length > 0) {
        where.description = {
            $like: "%" + queryParams.q + "%"
        };
    }
    console.log(where);
    db.todo.findAll({
        where: where
    }).then(function (todos) {
        return res.json(todos);
    }).catch(function (error) {
        return res.status(400).json(error);
    });
});

/* GET todos item */
router.get("/:id", middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id);
    var where = {id: todoId, userId: req.user.get("id")};

    db.todo.findOne(where).then(function (todoItem) {
        if (!!todoItem) {
            res.json(todoItem);
        } else {
            res.status(404).json({
                error: "Todo item not found"
            });
        }
    }, function (error) {
        return res.status(500).json(error);
    });
});

/* Post new todos */
router.post("/", middleware.requireAuthentication, function (req, res) {
    var body = _.pick(req.body, "description", "completed");

    db.todo.create(body).then(function (todo) {
        var b = req.user;
        req.user.addTodo(todo).then(function () {
            return todo.reload();
        }).then(function (todo) {
            return res.json(todo.toJSON());
        });
    }, function (error) {
        return res.status(400).json(error);
    }).catch(function (error) {
        return res.status(500).json(error);
    });
});

/* Update one todoitem */
router.put("/:id", middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id);
    var body = _.pick(req.body, "description", "completed");
    var attributes = {};
    var where = {id: todoId, userId: req.user.get("id")};


    if (body.hasOwnProperty("description")) {
        attributes.description = body.description.trim();
    }

    if (body.hasOwnProperty("completed")) {
        attributes.completed = body.completed;
    }

    db.todo.findOne(where).then(function (todoItem) {
        if (todoItem) {
            todoItem.update(attributes).then(function (todoItem) {
                res.json(todoItem.toJSON());
            }, function (error) {
                res.status(400).json(error);
            });
        }
        res.status(404).json({
            error: "Todo item not found"
        });
    }, function (error) {
        return res.status(500).json(error);
    });
});

/** Delete a todos item */
router.delete("/:id", middleware.requireAuthentication, function (req, res) {
    var todoId = parseInt(req.params.id);
    db.todo.destroy({
        where: {
            id: todoId,
            userId: req.user.get("id")
        }
    }).then(function (rowsDeleted) {
        if (rowsDeleted === 0) {
            return res.status(404).json({error: "No todo with id " + todoId});
        }
        return res.sendStatus(204);
    }).catch(function (error) {
        return res.status(400).json(error);
    });
});

module.exports = router;