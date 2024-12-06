import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("AssignmentModel", schema, "kanbas.assignments");
export default model;
