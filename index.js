require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('cont', function (req, res) {
  return JSON.stringify({ name: req.body.content, number: req.body.number })
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :cont'))

function randomInt(low, high) {
  return Math.floor(Math.random() * (high - low) + low)
}

function containsName(name) {
  if (people.some(e => e.name === name)) {
    return true;
  }
  return false;
}

app.post('/api/persons', (request, response) => {
  const body = request.body

  if (body.name === undefined || body.name.length < 1) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  const pers = new Person({
    name: body.name,
    number: body.number
  })

  pers.save().then(savedPers => {
    response.json(savedPers.toJSON())
  })
})

app.get('/info', (req, res) => {
  let howmany = 0
  Person.count({}, function (err, count) {
    howmany += count
    console.log("Number of users:", howmany);
    let moment = new Date().toString().replace(/\.\w*/, '');
    res.send(
      `<p>Puhelinluettelossa ${howmany} henkilon tiedot</p>
      <p> ${moment} </p>
      `
    )
  })
})

app.get('/api/persons', (req, res) => {
  console.log('Getting shit')
  Person.find({}).then(persn => {
    console.log(persn)
    res.json(persn)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(pers => {
    response.json(pers.toJSON())
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response) => {
  Person.findByIdAndRemove(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'nonexisting id' })
  }

  next(error)
}
app.use(errorHandler)