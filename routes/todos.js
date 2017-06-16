var express = require('express');
var router = express.Router();
//var bodyParser = require('body-parser');

var todos = [
  /*{id: 1, description: "Finish Node Course", completed: false},
  {id: 2, description: "Initial Deploy Node Course", completed: true},
  {id: 3, description: "Deploy Node Course V2", completed: false}*/
];

var todoNextId = 1;

/* GET todos collection */
router.get('', function (req, res, next) {
  //res.render('index', { title: 'Todos Collection' });
  res.json(todos);
});

/* GET todos item */
router.get('/:id', function (req, res, next) {
  var todoId = parseInt(req.params.id);
  var todoItem;
  //res.json("id : " + req.params.id.toString());

  if (!todoId) {
    res.status(400).json({error: "Todo item id is not a number"});
  }

  todos.forEach(function (todo) {
    if (todo.id === todoId) {
      todoItem = todo;
    }
  });

  if (todoItem) {
    res.json(todoItem);
  } else {
    res.status(404).json({error: "Todo item not found"});
  }
  //res.render('index', { title: 'Todo item' });
});

/* Post new todos */
router.post('', function (req, res, next) {
  var body = req.body;
  var newTodo;

  if (body && body.description) {
    newTodo = {
      id: todoNextId++,
      description: body.description,
      completed: body.completed
    };
    todos.push(newTodo);
  } else {
    res.status(400).json({error: "Todo description is a required field"});
  }

  res.json(newTodo);
});


module.exports = router;
