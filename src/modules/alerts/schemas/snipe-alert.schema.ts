const mongoose = require('mongoose');

export const SnipeAlertSchema = new mongoose.Schema(
  {
    name: { type: String },
    userId: { type: mongoose.Types.ObjectId },
    walletId: { type: String },
    notificationInfo: {
      via: String,
      url: String,
      phone: String,
      whatsapp: String,
    },
    createdAt: { type: Date, default: null },
    isDisabled: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);
