const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  user: mongoose.Mixed,
  createdBy: mongoose.Mixed,
  items: [mongoose.Mixed],
  payment: [mongoose.Mixed],
  amtPaid: { type: mongoose.Mixed },
  address: { type: mongoose.Mixed },
  company: { type: mongoose.Mixed },
  invoiceId: { type: String },
  notes: { type: String },
  date: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
      "refund",
    ],
    default: "confirmed",
  },
  title: {
    type: String,
    default: "Paid for Order at Psymate",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = { Invoice };
