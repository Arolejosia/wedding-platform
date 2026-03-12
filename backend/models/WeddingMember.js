const mongoose = require("mongoose");

const weddingMemberSchema = new mongoose.Schema({

  weddingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wedding",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  role: {
    type: String,
    default: "member"
  }

});

module.exports = mongoose.model("WeddingMember", weddingMemberSchema);