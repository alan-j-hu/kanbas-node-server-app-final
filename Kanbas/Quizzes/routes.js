import * as quizzesDao from "./dao.js";

export default function QuizRoutes(app) {
    // Create a new quiz
    app.post("/api/quizzes", async (req, res) => {
        try {
            const newQuiz = await quizzesDao.createQuiz(req.body);
            res.status(201).json(newQuiz);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Get all quizzes by course ID
    app.get("/api/courses/:courseId/quizzes", async (req, res) => {
        try {
            const quizzes = await quizzesDao.getQuizzesByCourseId(req.params.courseId);
            res.status(200).json(quizzes);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get a single quiz
    app.get("/api/quizzes/:quizId", async (req, res) => {
        try {
            const quiz = await quizzesDao.getQuizById(req.params.quizId);
            if (!quiz) {
                return res.status(404).json({ error: "Quiz not found." });
            }
            res.status(200).json(quiz);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update a quiz
    app.put("/api/quizzes/:quizId", async (req, res) => {
        try {
            const updatedQuiz = await quizzesDao.updateQuiz(req.params.quizId, req.body);
            if (!updatedQuiz) {
                return res.status(404).json({ error: "Quiz not found." });
            }
            res.status(200).json(updatedQuiz);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Delete a quiz
    app.delete("/api/quizzes/:quizId", async (req, res) => {
        try {
            const result = await quizzesDao.deleteQuiz(req.params.quizId);
            res.status(result ? 200 : 404).json(
                result
                    ? { message: "Quiz deleted successfully." }
                    : { error: "Quiz not found." }
            );
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
