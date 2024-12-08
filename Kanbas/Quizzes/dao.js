import QuizModel from "./model.js";

// Create a new quiz
export function createQuiz(quizData) {
    return QuizModel.create(quizData);
}

// Get all quizzes by course ID
export function getQuizzesByCourseId(courseId) {
    return QuizModel.find({ course_id: courseId }).populate("questions");
}

// Get a single quiz
export function getQuizById(quizId) {
    return QuizModel.findById(quizId).populate("questions");
}

// Update a quiz
export async function updateQuiz(quizId, quizUpdates) {
    return QuizModel.findByIdAndUpdate(
        quizId,
        quizUpdates,
        { new: true, useFindAndModify: false }
    );
}

// Delete a quiz
export function deleteQuiz(quizId) {
    return QuizModel.findByIdAndDelete(quizId);
}
