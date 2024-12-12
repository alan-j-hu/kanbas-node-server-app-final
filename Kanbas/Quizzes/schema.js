import mongoose from "mongoose";
import { baseQuestionSchema } from "../Questions/schema.js"

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
        quizType: {
            type: String,
            enum: ["GradedQuiz", "PracticeQuiz", "Survey"],
            required: true,
        },
        points: {
            type: Number,
            required: true,
            min: 0,
        },
        questions: [ baseQuestionSchema ],
        shuffleAnswers: {
            type: Boolean,
            default: true,
        },
        timeLimit: {
            type: Number,
            default: null,
        },
        multipleAttempts: {
            type: Boolean,
            default: false,
        },
        maxAttempts: {
            type: Number,
            default: 1,
        },
        showCorrectAnswers: {
            type: String,
            enum: ["Never", "AfterDueDate", "Immediately"],
            default: "Never",
        },
        accessCode: {
            type: String,
            default: "",
        },
        oneAuestionAtATime: { type: Boolean, default: false },
        webcamRequired: { type: Boolean, default: false },
        lockQuestionsAfterAnswering: {
            type: Boolean,
            default: false,
        },
        dueDate: {
            type: Date,
            required: true,
        },
        availableDate: {
            type: Date,
            required: true,
        },
        untilDate: {
            type: Date,
            required: true,
        },
        published: {
            type: Boolean,
            default: false,
        },
        courseId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CourseModel",
            required: true,
        },
    },
    { collection: "quizzes", timestamps: true }
);

export default quizSchema;
