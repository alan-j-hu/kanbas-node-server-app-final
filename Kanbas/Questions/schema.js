import mongoose from "mongoose";

// Base Question Schema
const baseQuestionSchema = new mongoose.Schema(
    {
        quiz_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "QuizModel",
            required: true,
        },
        type: {
            type: String,
            enum: ["Multiple Choice", "True/False", "Fill in the Blank"],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        points: {
            type: Number,
            required: true,
            min: 0,
        },
        explanation: {
            type: String,
        },
        hints: {
            type: [String],
        },
    },
    { discriminatorKey: "type", collection: "questions" }
);

// Choice Schema
const multipleChoiceSchema = new mongoose.Schema({
    choices: [
        {
            text: { type: String, required: true },
            is_correct: { type: Boolean, required: true },
        },
    ],
});

// True/False Schema
const trueFalseSchema = new mongoose.Schema({
    correct_answer: { type: Boolean, required: true },
});

// blank Schema
const fillInTheBlankSchema = new mongoose.Schema({
    correct_answers: [
        {
            text: { type: String, required: true },
            case_insensitive: { type: Boolean, default: false }, // Default to case-sensitive matching
        },
    ],
});

// export all schemas
export {
    baseQuestionSchema,
    multipleChoiceSchema,
    trueFalseSchema,
    fillInTheBlankSchema,
};
