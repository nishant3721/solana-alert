const mongoose = require('mongoose');

export const TokenSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String },
    rank: { type: Number },
    ranks: { type: [] },
    collection_id: { type: mongoose.Types.ObjectId },
    collection_name: { type: String },
    attributes: { type: [] },
    image: { type: String },
    total_rarity: { type: String },
  },
  {
    timestamps: true,
  },
);
