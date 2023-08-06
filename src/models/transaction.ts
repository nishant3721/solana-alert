export class TransactionParsed {
  marketplace?: string
  marketplace_program_id?: string
  event_type?: string
  seller_wallet_pubkey?: string
  seller_token_account?: string
  seller_escrow_acount?: string
  mint?: string
  metadata?: string
  amount?: number
  amount_lamports?: number
  trade_state_bump?: number
  program_as_signer_bump?: number
  collection_id?: string
  token_name?: string
  collection_name?: string
}

export class Transaction {
  _id?: string
  bt?: number
  parsed?: TransactionParsed
  createdAt?: string

  constructor(data: {
    _id?: string
    bt?: number
    parsed?: TransactionParsed
    createdAt?: string
  }) {
    if (!data) {
      data = {}
    }

    this._id = data._id || null
    this.bt = data.bt || null
    this.parsed = data.parsed || null
    this.createdAt = data.createdAt || null
  }
}
