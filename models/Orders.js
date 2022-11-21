const { model, Schema } = require("mongoose");

const orderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: {
      type: Schema.Types.ObjectId,
      ref: "Cart",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "awaiting_delivery",
        "completed",
        "cancelled",
      ],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = model("Order", orderSchema);
