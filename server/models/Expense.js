const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  description: String,
  amount: Number,
  paidBy: String,
  splitBetween: [String],
  image: String,
}, { timestamps: true });

module.exports = mongoose.model("Expense", expenseSchema);