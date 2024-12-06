import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("AssignmentModel", schema, "assignments");
export default model;
