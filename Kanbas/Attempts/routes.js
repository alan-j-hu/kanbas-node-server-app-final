import {
    createAttempt,
    findAttemptsByQuizId,
    findAttemptById,
    updateAttempt,
    deleteAttempt,
} from "./dao.js";

export default function AttemptsRoutes(app) {
    // create new attempt
    app.post("/api/attempts", async (req, res) => {
        try {
            const newAttempt = await createAttempt(req.body);
            res.status(201).json(newAttempt);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // get all attempts by quiz id
    app.get("/api/quizzes/:quizId/attempts", async (req, res) => {
        const { quizId } = req.params;
        try {
            const attempts = await findAttemptsByQuizId(quizId);
            res.status(200).json(attempts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // get attempt by id
    app.get("/api/attempts/:attemptId", async (req, res) => {
        const { attemptId } = req.params;
        try {
            const attempt = await findAttemptById(attemptId);
            if (!attempt) {
                return res.status(404).json({ error: "Attempt not found." });
            }
            res.status(200).json(attempt);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // update attempt
    app.put("/api/attempts/:attemptId", async (req, res) => {
        const { attemptId } = req.params;
        try {
            const updatedAttempt = await updateAttempt(attemptId, req.body);
            if (!updatedAttempt) {
                return res.status(404).json({ error: "Attempt not found." });
            }
            res.status(200).json(updatedAttempt);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    });

    // delete attempt
    app.delete("/api/attempts/:attemptId", async (req, res) => {
        const { attemptId } = req.params;
        try {
            const result = await deleteAttempt(attemptId);
            if (result.deletedCount === 0) {
                return res.status(404).json({ error: "Attempt not found." });
            }
            res.status(200).json({ message: "Attempt deleted successfully." });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });

    // submit attempt
    app.post("/api/attempts/:attemptId/submit", async (req, res) => {
        const { attemptId } = req.params;

        try {
            const attempt = await getAttemptWithQuizAndQuestions(attemptId);
            if (!attempt) {
                return res.status(404).json({ error: "Attempt not found." });
            }

            if (attempt.submitted) {
                return res.status(400).json({ error: "Attempt already submitted." });
            }

            const { answers } = req.body;
            let totalScore = 0;

            // Process the answers
            const processedAnswers = attempt.quiz_id.questions.map((question) => {
                const userAnswer = answers.find(
                    (ans) => ans.question_id.toString() === question._id.toString()
                );

                if (!userAnswer) return { question_id: question._id, is_correct: false };

                let isCorrect = false;
                if (question.type === "Multiple Choice") {
                    isCorrect = question.choices.some(
                        (choice) => choice.text === userAnswer.answer && choice.is_correct
                    );
                } else if (question.type === "True/False") {
                    isCorrect = userAnswer.answer === question.correct_answer;
                } else if (question.type === "Fill in the Blank") {
                    isCorrect = question.correct_answers.some(
                        (correct) => correct.toLowerCase() === userAnswer.answer.toLowerCase()
                    );
                }

                if (isCorrect) totalScore += question.points;

                return { ...userAnswer, is_correct: isCorrect };
            });

            // Update the attempt
            const updatedAttempt = await updateAttempt(attemptId, {
                submitted: true,
                score: totalScore,
                answers: processedAnswers,
                end_time: new Date(),
            });

            res.status(200).json(updatedAttempt);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    });


}
