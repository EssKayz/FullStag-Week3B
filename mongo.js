const mongoose = require('mongoose')

if (process.argv.length < 3) {
    console.log('give password as argument')
    process.exit(1)
}

const password = process.argv[2]
const user = process.argv[3]
const numba = process.argv[4]

const url =
    `mongodb+srv://memes:${password}@cluster0-gduam.mongodb.net/persDB?retryWrites=true`


mongoose.connect(url, { useNewUrlParser: true })

const personSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Person = mongoose.model('Person', personSchema)

const person = new Person({
    name: user,
    number: numba
})

if (user == undefined || numba == undefined) {
    Person.find({}).then(result => {
        result.forEach(pers => {
            console.log(pers)
        })
        mongoose.connection.close()
    })
} else {
    person.save().then(response => {
        console.log(`adding ${response.name}, number ${response.number} to database`);
        mongoose.connection.close();
    })
}