const express = require('express')
const app = express()
const bodyParser = require('body-parser')
var morgan = require('morgan')
const cors = require('cors')

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('build'))

morgan.token('cont', function (req, res) { 
  return JSON.stringify({name: req.body.content, number: req.body.number})
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :cont'))

let people = [
  {
    id: 1,
    name: 'Arto',
    number: '4765327245'
  },
  {
    id: 2,
    name: 'Pekka',
    number: '6234562546'
  },
  {
    id: 3,
    name: 'Martti',
    number: '2765472445'
  },
]

const generateId = () => {
  const maxId = people.length > 0
    ? Math.max(...people.map(n => n.id))
    : 0
  return maxId + 1
}

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

  if (body.content === undefined || body.content.length < 1) {
    return response.status(400).json({
      error: 'content missing'
    })
  }

  if(containsName(body.content)){
    return response.status(400).json({
      error: 'name must be unique'
    })
  }

  const pers = {
    id: randomInt(0, 1000000),
    name: body.content,
    number: body.number
  }

  people = people.concat(pers)

  response.json(pers)
})


app.get('/', (req, res) => {
  res.send('<h1>Whalecum!</h1>')
})

app.get('/info', (req, res) => {
  const howmany = people.length
  let moment = new Date().toString().replace(/\.\w*/, '');
  res.send(
    `<p>Puhelinluettelossa ${howmany} henkilon tiedot</p>
    <p> ${moment} </p>
    `
  )
})

app.get('/api/persons', (req, res) => {
  res.json(people)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = people.find(pers => pers.id === id)
  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  people = people.filter(pers => pers.id !== id);

  response.status(204).end();
});


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})