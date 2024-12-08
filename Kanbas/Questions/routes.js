import {
    createQuestion,
    getQuestionsByQuizId,
    getQuestionById,
    updateQuestion,
    deleteQuestion,
} from "./dao.js";

export default function QuestionRoutes(app) {
    // Create a new question
    app.post("/api/questions", async (req, res) => {
        try {
            const newQuestion = await createQuestion(req.body);
            res.status(201).json(newQuestion);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Get all questions by quiz ID
    app.get("/api/quizzes/:quizId/questions", async (req, res) => {
        try {
            const questions = await getQuestionsByQuizId(req.params.quizId);
            res.status(200).json(questions);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Get a single question
    app.get("/api/questions/:id", async (req, res) => {
        try {
            const question = await getQuestionById(req.params.id);
            if (!question) {
                return res.status(404).json({ error: "Question not found." });
            }
            res.status(200).json(question);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // Update a question
    app.put("/api/questions/:id", async (req, res) => {
        try {
            const updatedQuestion = await updateQuestion(req.params.id, req.body);
            if (!updatedQuestion) {
                return res.status(404).json({ error: "Question not found." });
            }
            res.status(200).json(updatedQuestion);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // Delete a question
    app.delete("/api/questions/:id", async (req, res) => {
        try {
            const deletedQuestion = await deleteQuestion(req.params.id);
            if (!deletedQuestion) {
                return res.status(404).json({ error: "Question not found." });
            }
            res.status(200).json({ message: "Question deleted successfully." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });
}
