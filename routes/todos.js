var express = require("express");
var router = express.Router();
//var bodyParser = require("body-parser");
var _ = require("underscore");

var todos = [
  /*{id: 1, description: "Finish Node Course", completed: false},
   {id: 2, description: "Initial Deploy Node Course", completed: true},
   {id: 3, description: "Deploy Node Course V2", completed: false}*/
];

var todoNextId = 1;

/* GET todos collection */
router.get("", function (req, res, next) {
  var queryParams = req.query;
  var todoList= todos;

  if (queryParams.hasOwnProperty("completed") && queryParams.completed === "true") {
    todoList = _.where(todos, {completed: true});
  } else if (queryParams.hasOwnProperty("completed") && queryParams.completed === "false") {
    todoList = _.where(todos, {completed: false});
  }

  res.json(todoList);
});

/* GET todos item */
router.get("/:id", function (req, res, next) {
  var todoId = parseInt(req.params.id);
  var todoItem;
  //res.json("id : " + req.params.id.toString());

  if (!todoId) {
    res.status(400).json({error: "Todo item id is not a number"});
  }

  todoItem = _.findWhere(todos, {id: todoId});

  if (todoItem) {
    res.json(todoItem);
  } else {
    res.status(404).json({error: "Todo item not found"});
  }
  //res.render("index", { title: "Todo item" });
});

/* Post new todos */
router.post("", function (req, res, next) {
  var body = _.pick(req.body, "description", "completed");
  var newTodo;

  if (
    !_.isString(body.description) ||
    !body.description.trim() ||
    !_.isBoolean(body.completed)
  ) {
    return res.status(400).json({error: "Todo description should be a string and completed a boolean"});
  }

  newTodo = {
    id: todoNextId++,
    description: body.description.trim(),
    completed: body.completed
  };

  todos.push(newTodo);
  res.json(newTodo);
});

/* Post new todos */
router.put("/:id", function (req, res, next) {
  var todoId = parseInt(req.params.id);
  var todoItem = _.findWhere(todos, {id: todoId});
  var body = _.pick(req.body, "description", "completed");
  var validAttributes = {};

  if (!todoId) {
    return res.status(400).json({error: "Todo item id is not a number"});
  }

  if (!todoItem) {
    return res.status(404).json({error: "Todo item not found"});
  }

  if (body.hasOwnProperty("description") && _.isString(body.description) && body.description.trim()) {
    validAttributes = body.description.trim();
  } else if (body.hasOwnProperty("description")) {
    return res.status(400).json("Description format error");
  }

  if (body.hasOwnProperty("completed") && _.isBoolean(body.completed)) {
    validAttributes.completed = body.completed;
  } else if (body.hasOwnProperty("completed")) {
    res.status(400).json({error: "Completed must be boolean"});
  }

  _.extend(todoItem, validAttributes);
  res.json(todoItem);
});

router.delete("/:id", function (req, res, next) {
  var todoId = parseInt(req.params.id);
  var todoItem = _.findWhere(todos, {id: todoId});

  if (!todoItem) {
    res.status(404).json({error: "Todo item not found"});
  } else {
    todos = _.without(todos, todoItem);
    res.json(todoItem);
  }
});

module.exports = router;
