const { model, Schema } = require("mongoose");

const cartSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    cartItems: [
      {
        meal: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true },
        itemTotal: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = model("Cart", cartSchema);
