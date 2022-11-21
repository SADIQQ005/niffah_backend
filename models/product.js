const { model, Schema } = require("mongoose");

const productSchema = new Schema(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "Manager",
      required: true,
    },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    ingredent: { type: String },
    image: { type: String, required: true },
  },
  { timeStamps: true }
);

module.exports = model("Product", productSchema);
