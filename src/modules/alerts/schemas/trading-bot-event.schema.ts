import * as mongoose from 'mongoose'

export const TradingBotEventSchema = new mongoose.Schema({
  user_id: { type: String },
  marketplace: { type: String },
  token_name: { type: String },
  collection_name: { type: String },
  event_type: { type: String },
  signature: { type: String },
  mint: { type: String },
  amount: { type: Number },
  bot_wallet: {
    pubkey: { type: String },
    balance_pre: Number,
    balance_post: Number,
  },
  bot_config: {
    collection_name: { type: String },
  },
  user_wallet: { pubkey: { type: String } },
  result: {
    signature: { type: String },
    status: { type: String },
    response: { type: String },
  },
})
