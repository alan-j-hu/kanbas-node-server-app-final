import mongoose from "mongoose";

// Base Question Schema
const baseQuestionSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        points: {
            type: Number,
            required: true,
            min: 0,
        },
        question: {
            type: String,
        },
    },
    { discriminatorKey: "kind", collection: "questions" }
);

// Choice Schema
const multipleChoiceSchema = new mongoose.Schema({
    choices: [
        {
            text: { type: String, required: true },
            is_correct: { type: Boolean, required: true },
        },
    ],
}, { discriminatorKey: "kind" });

// True/False Schema
const trueFalseSchema = new mongoose.Schema({
    correct_answer: { type: Boolean, required: true },
}, { discriminatorKey: "kind" });

// blank Schema
const fillInTheBlankSchema = new mongoose.Schema({
    correct_answers: [
        {
            text: { type: String, required: true },
            case_insensitive: { type: Boolean, default: false }, // Default to case-sensitive matching
        },
    ],
}, { discriminatorKey: "kind" });

// export all schemas
export {
    baseQuestionSchema,
    multipleChoiceSchema,
    trueFalseSchema,
    fillInTheBlankSchema,
};
