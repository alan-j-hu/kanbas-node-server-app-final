import {
    BaseQuestionModel,
    MultipleChoiceQuestionModel,
    TrueFalseQuestionModel,
    FillInTheBlankQuestionModel,
} from "./model.js";

// Create question
export function createQuestion(questionData) {
    const { type } = questionData;
    switch (type) {
        case "Multiple Choice":
            return MultipleChoiceQuestionModel.create(questionData);
        case "True/False":
            return TrueFalseQuestionModel.create(questionData);
        case "Fill in the Blank":
            return FillInTheBlankQuestionModel.create(questionData);
        default:
            throw new Error("Invalid question type.");
    }
}

// Get all questions
export function getQuestionsByQuizId(quizId) {
    return BaseQuestionModel.find({ quiz_id: quizId });
}

// Get question by ID
export function getQuestionById(id) {
    return BaseQuestionModel.findById(id);
}

// Delete question
export function deleteQuestion(id) {
    return BaseQuestionModel.findByIdAndDelete(id);
}

// Update question
export async function updateQuestion(questionId, questionUpdates) {

    const question = await BaseQuestionModel.findById(questionId);
    if (!question) {
        throw new Error("Question not found.");
    }

    // Update the question based on its type
    switch (question.type) {
        case "Multiple Choice":
            return MultipleChoiceQuestionModel.updateOne({ _id: questionId }, { $set: questionUpdates });
        case "True/False":
            return TrueFalseQuestionModel.updateOne({ _id: questionId }, { $set: questionUpdates });
        case "Fill in the Blank":
            return FillInTheBlankQuestionModel.updateOne({ _id: questionId }, { $set: questionUpdates });
        default:
            throw new Error("Invalid question type.");
    }
}

