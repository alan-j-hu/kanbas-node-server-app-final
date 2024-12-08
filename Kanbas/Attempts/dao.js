import model from "./model.js";

// Create a new attempt
export function createAttempt(attemptData) {
    delete attemptData._id;
    return model.create(attemptData);
}

// Get all attempts by quiz ID
export function findAttemptsByQuizId(quizId) {
    return model.find({ quiz_id: quizId }).populate("user_id").populate("quiz_id");
}

// Get all attempts by user ID and quiz ID
export function findAttemptsByUserAndQuiz(userId, quizId) {
    return model.find({ user_id: userId, quiz_id: quizId });
}

// Get attempt by ID
export function findAttemptById(attemptId) {
    return model.findById(attemptId).populate("user_id").populate("quiz_id");
}

// Update an attempt
export function updateAttempt(attemptId, attemptUpdates) {
    return model.updateOne({ _id: attemptId }, attemptUpdates);
}

// Delete an attempt
export function deleteAttempt(attemptId) {
    return model.deleteOne({ _id: attemptId });
}

// Get attempt with quiz and questions
export async function getAttemptWithQuizAndQuestions(attemptId) {
    return model
        .findById(attemptId)
        .populate({
            path: "quiz_id",
            populate: {
                path: "questions",
            },
        })
        .populate("user_id");
}

