const mongoose = require('mongoose')

export const UserSchema = new mongoose.Schema(
  {
    walletId: { type: String },
    settings: { bot_privacy: Boolean },
  },
  {
    timestamps: true,
  },
)
