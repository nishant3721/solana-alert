const mongoose = require('mongoose');

export const AlertSchema = new mongoose.Schema(
  {
    name: { type: String },
    userId: { type: String },
    walletId: { type: String },
    notificationInfo: {
      via: String,
      url: String,
      phone: String,
      whatsapp: String,
    },
    collectionId: { type: String },
    collectionName: { type: String },
    alertType: { type: String },
    createdAt: { type: Date, default: null },
    isDisabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
