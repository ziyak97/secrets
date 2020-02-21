require('dotenv').config()

const express = require('express')
const ejs = require('ejs')
const mongoose = require('mongoose')
const encrypt = require('mongoose-encryption')

const app = express()
const port = process.env.PORT || 3000

const encKey = process.env.SOME_32BYTE_BASE64_STRING
const sigKey = process.env.SOME_64BYTE_BASE64_STRING

app.use(express.static('public'))
app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: true }))

mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true })

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(encrypt, {
    encryptionKey: encKey,
    signingKey: sigKey,
    encryptedFields: ['password'],
    excludeFromEncryption: ['email'],
    additionalAuthenticatedFields: ['email']
})

const User = new mongoose.model('User', userSchema)

app.get('/', (req, res) => {
    res.render('home')
})

app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/register', (req, res) => {
    res.render('register')
})

app.post('/register', (req, res) => {
    const newUser = User({
        email: req.body.username,
        password: req.body.password
    })

    newUser.save(err => {
        if (err) {
            console.log(err)
        } else {
            res.render('secrets')
        }
    })
})

app.post('/login', (req, res) => {
    const username = req.body.username
    const password = req.body.password

    User.findOne({ email: username }, (err, foundUser) => {
        if (err) {
            console.error(err)
        } else if (foundUser) {
            if (foundUser.password === password) {
                res.render('secrets')
            }
        }
    })
})

app.listen(port, () => console.log(`Listening on port ${port}`))