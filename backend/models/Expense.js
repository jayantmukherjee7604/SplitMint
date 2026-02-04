const mongoose = require("mongoose");

const splitSchema = new mongoose.Schema({
  participant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Participant",
  },
  share: Number,
});

const expenseSchema = new mongoose.Schema(
  {
    description: String,
    amount: Number,
    date: {
      type: Date,
      default: Date.now,
    },

    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },

    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
    },

    splitMode: {
      type: String,
      enum: ["equal", "custom", "percentage"],
    },

    splits: [splitSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
