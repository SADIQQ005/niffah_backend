const { model, Schema } = require("mongoose");

const managerSchema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
  },
  { timeStamps: true }
);

module.exports = model("Manager", managerSchema);
