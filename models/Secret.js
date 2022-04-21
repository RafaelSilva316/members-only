const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SecretSchema = new Schema({
  secretWord: { type: String, required: true },
});

module.exports = mongoose.model("Secret", SecretSchema);
