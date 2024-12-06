import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("CourseModel", schema, "courses");
export default model;
