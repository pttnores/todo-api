var express = require("express");
var router = express.Router();
//var bodyParser = require("body-parser");
var _ = require("underscore");
var db = require("../db.js");

/* GET todos?completed=true&q=work collection */
router.get("", function(req, res, next) {
  var queryParams = req.query;

  var where = {};

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
router.get("/:id", function(req, res, next) {
  var todoId = parseInt(req.params.id);

  db.todo.findById(todoId).then(function (todoItem) {
    if (!!todoItem) {
      res.json(todoItem);
    } else {
      res.status(404).json({
        error: "Todo item not found"
      });
    }
  },function (error) {
    return res.status(500).json(error);
  });
});

/* Post new todos */
router.post("", function(req, res, next) {
  var body = _.pick(req.body, "description", "completed");

  db.todo.create(body).then(function (todo) {
    return res.json(todo.toJSON());
  }).catch(function (error) {
    return res.status(400).json(error);
  });
});

/* Post new todos */
router.put("/:id", function(req, res, next) {
  var todoId = parseInt(req.params.id);
  var body = _.pick(req.body, "description", "completed");

  db.todo.findById(todoId).then(function (todoItem) {
    if (todoItem) {
      if (body.hasOwnProperty("description")) {
        todoItem.description = body.description.trim();
      }

      if (body.hasOwnProperty("completed") && _.isBoolean(body.completed)) {
        todoItem.completed = body.completed;
      } else if (body.hasOwnProperty("completed")) {
        res.status(400).json({
          error: "Completed must be boolean"
        });
      }

      todoItem.save().then(function () {
        res.json(todoItem);
      });
    } else {
      res.status(404).json({
        error: "Todo item not found"
      });
    }
  }).catch(function (error) {
    return res.status(400).json(error);
  });
});
/** Delete a todos item */
router.delete("/:id", function(req, res, next) {
  var todoId = parseInt(req.params.id);
  db.todo.destroy({
    where: {
      id: todoId
    }
  }).then(function (todoItem) {
    return res.json(todoItem);
  }).catch(function (error) {
    return res.status(400).json(error);
  });
});

db.sequelize.sync();

module.exports = router;