const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [String],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // optional
    required: true,
  },
});

module.exports = mongoose.model("Group", groupSchema);