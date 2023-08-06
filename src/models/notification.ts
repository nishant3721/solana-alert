export class Notification {
  token_mint_address?: string
  marketPlace?: string
  tokenName?: string
  collectionName?: string
  eventType?: string
  amount?: number
  imageUrl?: string

  constructor(data: {
    token_mint_address?: string
    marketPlace?: string
    tokenName?: string
    collectionName?: string
    eventType?: string
    amount?: number
    imageUrl?: string
  }) {
    if (!data) {
      data = {}
    }
    this.token_mint_address = data.token_mint_address || null
    this.marketPlace = data.marketPlace || null
    this.tokenName = data.tokenName || null
    this.collectionName = data.collectionName || null
    this.eventType = data.eventType || null
    this.amount = data.amount || null
    this.imageUrl = data.imageUrl || null
  }
}
