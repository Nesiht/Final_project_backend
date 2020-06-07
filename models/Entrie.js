import mongoose from 'mongoose'

const Entrie = mongoose.model('Entrie', {
  title: {
    type: String,
    minlength: 2,
    maxlength: 20,
    unique: false,
    sparse: true,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  grade: {
    type: Number
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  userid: {
    type: String
  }
})

export default Entrie