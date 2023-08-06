export class TradingBotEvent {
  _id?: string
  user_id?: string
  marketplace?: string
  token_name?: string
  collection_name?: string
  event_type?: string
  signature?: string
  mint?: string
  amount?: number
  bot_wallet?: { pubkey: string; pre_balance: number; post_balance: number }
  bot_config?: { collection_name: string }
  user_wallet?: { pubkey: string }
  result?: { signature: string; status: string; response: string }

  constructor(data: {
    _id?: string
    user_id?: string
    marketplace?: string
    token_name?: string
    collection_name?: string
    event_type?: string
    mint?: string
    signature?: string
    amount?: number
    bot_wallet?: { pubkey: string; pre_balance: number; post_balance: number }
    user_wallet?: { pubkey: string }
    result?: { signature: string; status: string; response: string }
  }) {
    data = data || {}

    this._id = data._id || null
    this.user_id = data.user_id || null
    this.marketplace = data.marketplace || null
    this.token_name = data.token_name || null
    this.collection_name = data.collection_name || null
    this.event_type = data.event_type || null
    this.mint = data.mint || null
    this.signature = data.signature || null
    this.amount = this.amount || null
    this.bot_wallet = this.bot_wallet || null
    this.user_wallet = this.user_wallet || null
    this.result = this.result || null
  }
}
