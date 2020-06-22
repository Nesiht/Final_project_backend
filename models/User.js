import mongoose from 'mongoose'
import crypto from 'crypto'

const User = mongoose.model('User', {
  name: {
    type: String,
    minlength: 2,
    maxlength: 20,
    unique: false,
    sparse: true,
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
    minlength: 3,
    unique: true,
  },
  accessToken: {
    type: String,
    default: () => crypto.randomBytes(128).toString('hex')
  }
})

export default User