import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import mongoose from 'mongoose'
import bcrypt from 'bcrypt-nodejs'
import User from './models/User'
import Entrie from './models/Entrie'

const listEndpoints = require('express-list-endpoints')

const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/workout"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const port = process.env.PORT || 8080
const app = express()

app.use(cors())
app.use(bodyParser.json())

// Reset and rebuild databse
if (process.env.RESET_USER) {

  const deleteDatabase = async () => {
      await User.deleteMany();
      console.log(`Deleting User database`)
  };
  deleteDatabase();
}

if (process.env.RESET_ENTRIE) {

  const deleteDatabase = async () => {
      await Entrie.deleteMany();
      console.log(`Deleting Entrie database`)
  };
  deleteDatabase();
}

if (process.env.RESET_DATABASE) {

  const deleteDatabase = async () => {
      await User.deleteMany();
      await Entrie.deleteMany();
      console.log(`Deleting all data`)
  };
  deleteDatabase();
}

// Authenticator function, later used on line 57 to only accept authorized user to the enpoint example.
const authenticateUser = async (req, res, next) =>{
  const user = await User.findOne({accessToken: req.header('Authorization')})
  if(user){
    req.user = user
    next()
  } else {
    res.status(403).json({message: 'permission denied' ,loggetOut: true})
  }
}

// Registration endpoint using name, email and password to create user.
app.post('/users', async (req, res) => {
  try {
    const { name, email, password } = req.body
    const user = await new User({ name, email, password: bcrypt.hashSync(password) })
    const saved = await user.save()

    res.status(201).json({ userId: saved._id, accessToken: saved.accessToken })
  } catch(err) {
    res.status(401).json({ message: 'Cant create user, email already exists', err })
  }
})

// Example of checking if user is already authenticated
app.get('/secrets', authenticateUser)
app.get('/secrets', async (req, res) => {
  res.json({ message: 'Super secret endpoint with your accesstoken and user id!' })
})

// Validate user trying to log in. if username and password is correct it will respond with userid and accesstoken for frontend to use later
app.post('/sessions', async (req, res) => {
  const user = await User.findOne({ email: req.body.email })

  if(user && bcrypt.compareSync(req.body.password, user.password)) {
    res.json({ userId: user._id, accessToken: user.accessToken })
  } else {
    res.json({ message: 'User not found', notFound: true})
  }
})

// Get all entries by userid. Entpoint is secure
app.get('/entries/:userid', authenticateUser)
app.get('/entries/:userid', async (req, res) => {
  const { userid } = req.params

  let entriesByUser = await Entrie.find({ userid })

  if ( entriesByUser.length > 0 ) {
    res.json(entriesByUser)
  } else {
    res.status(404).json({ message: `No entries found by user: ${userid}`})
  }

  res.send('This is the entries endpoint')
})

// Testing
app.get('/entries/', async (req, res) => {
  res.send('This is the entries endpoint')
})


// Post new entries. At the moment only title, text, grade and userid is required. The enpoint is secure
app.post('/entries/', authenticateUser)
app.post('/entries/', async (req, res) => {
  try{
    const { title, text, grade, userid } = req.body
    const entrie = await new Entrie({ title, text, grade, userid })
    const saved = await entrie.save()
    res.status(201).json({ message: 'Successful saved', entryId: saved._id })
  } catch(err) {
    res.status(401).json({ message: 'Cant save new entry' , err })
  }
})


app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
