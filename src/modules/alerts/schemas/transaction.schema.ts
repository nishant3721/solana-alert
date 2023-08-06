const mongoose = require('mongoose');

export const TransactionSchema = new mongoose.Schema(
  {
    bt: { type: Number },
    tx: {
      msg: {
        accountKeys: [{ writable: Boolean, signer: Boolean, pubkey: String }],
        instructions: [{ programId: String, data: String, accounts: [] }],
      },
    },
    parsed: {
      marketplace: String,
      marketplace_program_id: String,
      event_type: String,
      seller_wallet_pubkey: String,
      seller_token_account: String,
      seller_escrow_account: String,
      mint: String,
      metadata: String,
      amount: Number,
      amount_lamports: Number,
      trade_state_bump: Number,
      program_as_signer_bump: Number,
      collection_id: { type: mongoose.Types.ObjectId },
      token_name: String,
      collection_name: String,
    },
  },
  {
    timestamps: true,
  },
);
