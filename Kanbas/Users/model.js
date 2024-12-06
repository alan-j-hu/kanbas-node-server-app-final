import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("UserModel", schema, "kanbas.users");
export default model;