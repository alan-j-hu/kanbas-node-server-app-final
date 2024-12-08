import mongoose from "mongoose";
import AttemptSchema from "./schema.js";

const AttemptModel = mongoose.model("AttemptModel", AttemptSchema);
export default AttemptModel;
