import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
    question_id: { type: mongoose.Schema.Types.ObjectId, ref: "QuestionModel", required: true },
    answer: { type: String, required: true },
    is_correct: { type: Boolean, required: true },
});

const AttemptSchema = new mongoose.Schema(
    {
        quiz_id: { type: mongoose.Schema.Types.ObjectId, ref: "QuizModel", required: true },
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "UserModel", required: true },
        start_time: { type: Date, required: true },
        end_time: { type: Date },
        score: { type: Number, required: true, default: 0  },
        submitted: { type: Boolean, default: false },
        answers: [AnswerSchema], 
    },
    { timestamps: true, collection: "attempts" }
);

export default AttemptSchema;
