import mongoose from "mongoose";
const assignmentSchema = new mongoose.Schema(
  {
    title: String,
    course: { type: mongoose.Schema.Types.ObjectId, ref: "CourseModel" },
    start: { type: Date, default: Date.now },
    due: { type: Date, default: Date.now },
    until: { type: Date, default: Date.now },
    points: Number,
    description: String
  },
  { collection: "assignments" }
);
export default assignmentSchema;
