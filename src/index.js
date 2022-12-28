const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username == username)
  const userDoesntExist = user == undefined
  if (userDoesntExist) response.status(404).json({error: "User not found!"})
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const user = users.some(user => user.username == username)
  if (user) response.status(400).json({error: "User already exists."})
  
  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(newUser)
  return response.status(201).json(newUser)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  newTodo = { 
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(newTodo)
  return response.status(201).json(newTodo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  currentToDo =  user.todos.find(todo => todo.id == id)
  if (currentToDo == undefined) {
    return response.status(404).json({error: "TODO doesn't exists!"})
  }

  indexOfToDo = user.todos.indexOf(currentToDo)
  user.todos[indexOfToDo].deadline = new Date(deadline)
  user.todos[indexOfToDo].title = title
  
  return response.status(201).json(currentToDo)
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  currentToDo =  user.todos.find(todo => todo.id == id)
  if (currentToDo == undefined) {
    return response.status(404).json({error: "TODO doesn't exists!"})
  }

  indexOfToDo = user.todos.indexOf(currentToDo)
  user.todos[indexOfToDo].done = true

  return response.status(201).json(currentToDo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  currentToDo =  user.todos.find(todo => todo.id == id)
  if (currentToDo == undefined) {
    return response.status(404).json({error: "TODO doesn't exists!"})
  }

  indexOfToDo = user.todos.indexOf(currentToDo)
  user.todos.splice(indexOfToDo, 1)

  return response.status(204).send()
});

module.exports = app;