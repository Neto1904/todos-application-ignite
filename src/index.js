const express = require('express');
const cors = require('cors');
const moment = require('moment');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  if(!user) {
    return response.status(400).json({message: 'User not found'})
  }
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  let user = users.find(user => user.username === username)
  if(user) {
    return response.status(400).json({
      error: 'Mensagem do erro'
    })
  }
  user ={
    name,
    username,
    id: uuidv4(),
    todos: []
  } 
  users.push(user)
  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  const todo = {
    id: uuidv4(),
    title: title,
    done: false,
    deadline: moment(deadline),
    created_at: moment()
  }
  user.todos.push(todo)
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params
  const { title, deadline } = request.body
  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: 'Not Found'})
  todo.deadline = moment(deadline)
  todo.title = title
  return response.json({title: todo.title, deadline: todo.deadline, done: todo.done})
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params
  const user = users.find(user => user.username === username)
  const todo = user.todos.find(todo => todo.id === id)
  if(!todo) return response.status(404).json({error: 'Not Found'})
  todo.done = true
  return response.json(todo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params
  const user = users.find(user => user.username === username)
  const index = user.todos.findIndex(todo => todo.id === id)
  console.log(index)
  if(index === -1) return response.status(404).json({error: 'Not Fond'})
  user.todos.splice(index,1)
  return response.status(204).json([])
});

module.exports = app;