export class SnipeAlert {
  _id?: string;
  name: string;
  userId: string;
  walletId: string;
  notificationInfo: {
    via: string;
    url?: string;
    phone?: string;
    whatsapp?: string;
  };
  collectionId: string;
  collectionName: string;
  alertType: string;
  createdAt: string;
  isDisabled: boolean;
}
