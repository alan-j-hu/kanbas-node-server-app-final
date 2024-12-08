import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        quiz_type: {
            type: String,
            enum: ["Graded Quiz", "Practice Quiz", "Survey"],
            required: true,
        },
        points: {
            type: Number,
            required: true,
            min: 0,
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Question",
            },
        ],
        shuffle_answers: {
            type: Boolean,
            default: true,
        },
        time_limit: {
            type: Number,
            default: null,
        },
        multiple_attempts: {
            type: Boolean,
            default: false,
        },
        max_attempts: {
            type: Number,
            default: 1,
        },
        show_correct_answers: {
            type: String,
            enum: ["Never", "After Due Date", "Immediately"],
            default: "Never",
        },
        access_code: {
            type: String,
            default: "",
        },
        webcam_required: {
            type: Boolean,
            default: false,
        },
        lock_questions_after_answering: {
            type: Boolean,
            default: false,
        },
        due_date: {
            type: Date,
            required: true,
        },
        available_date: {
            type: Date,
            required: true,
        },
        until_date: {
            type: Date,
            required: true,
        },
        published: {
            type: Boolean,
            default: false,
        },
        course_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseModel",
            required: true,
        },
    },
    { collection: "quizzes", timestamps: true }
);

export default quizSchema;
