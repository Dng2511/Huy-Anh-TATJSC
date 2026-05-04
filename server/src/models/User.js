import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, required: true, default: 'user' },
    access: { type: String, required: true, default: 'read' },
    status: { type: String, required: true, default: 'active' },
  },
  { timestamps: true }
)

userSchema.methods.verifyPassword = async function (password) {
  return bcrypt.compare(password, this.passwordHash)
}

userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export const User = mongoose.model('User', userSchema)
