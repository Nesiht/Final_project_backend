import mongoose from 'mongoose'
import crypto from 'crypto'

// Name, Password, CreatedAt, Email, AccessToken
const User = mongoose.model('User', {
  name:{
    type: String,
    unique: true,
    required: true,
    minlength: 2,
    maxlength: 20
  },
  password: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  email: {
    type: String,
    unique: true,
    minlength: 3
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})

export default User