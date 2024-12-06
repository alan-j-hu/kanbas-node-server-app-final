import mongoose from "mongoose";
import schema from "./schema.js";
const model = mongoose.model("EnrollmentModel", schema, "kanbas.enrollments");
export default model;
