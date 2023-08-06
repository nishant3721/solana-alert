export class Alert {
  _id?: string
  name: string
  userId: string
  notificationInfo: {
    via: string
    url?: string
    phone?: string
    whatsapp?: string
  }
  collectionId: string
  collectionName: string
  alertType: string
  createdAt: string
  isDisabled: boolean
}
