import * as dao from "./dao.js";
import * as courseDao from "../Courses/dao.js";
import * as enrollmentsDao from "../Enrollments/dao.js";
import * as quizzesDao from "../Quizzes/dao.js";
import * as questionsDao from "../Questions/dao.js";
import * as attemptsDao from "../Attempts/dao.js";

export default function UserRoutes(app) {
  const createUser = async (req, res) => {
    const user = await dao.createUser(req.body);
    res.json(user);
  };

  const deleteUser = async (req, res) => {
    const status = await dao.deleteUser(req.params.userId);
    res.json(status);
  };

  const findAllUsers = async (req, res) => {
    const { role, name } = req.query;
    if (role) {
      const users = await dao.findUsersByRole(role);
      res.json(users);
      return;
    }
    if (name) {
      const users = await dao.findUsersByPartialName(name);
      res.json(users);
      return;
    }
    const users = await dao.findAllUsers();
    res.json(users);
  };

  const findUserById = async (req, res) => {
    const user = await dao.findUserById(req.params.userId);
    res.json(user);
  };

  const updateUser = async (req, res) => {
    const { userId } = req.params;
    const userUpdates = req.body;
    await dao.updateUser(userId, userUpdates);
    const currentUser = req.session["currentUser"];
    if (currentUser && currentUser._id === userId) {
      req.session["currentUser"] = { ...currentUser, ...userUpdates };
    }
    res.json(currentUser);
  };

  const signin = async (req, res) => {
    const { username, password } = req.body;
    const all = await dao.findAllUsers();
    console.log(all);
    const currentUser = await dao.findUserByCredentials(username, password);
    if (currentUser) {
      req.session["currentUser"] = currentUser;
      res.json(currentUser);
    } else {
      res.status(401).json({ message: "Unable to login. Try again later." });
    }
  };
  const signup = async (req, res) => {
    const user = await dao.findUserByUsername(req.body.username);
    if (user) {
      res.status(400).json({ message: "Username already taken" });
      return;
    }
    const currentUser = await dao.createUser(req.body);
    req.session["currentUser"] = currentUser;
    res.json(currentUser);
  };
  const signout = (req, res) => {
    req.session.destroy();
    res.sendStatus(200);
  };
  const profile = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    res.json(currentUser);
  };
  app.post("/api/users", createUser);
  app.get("/api/users", findAllUsers);
  app.get("/api/users/:userId", findUserById);
  app.put("/api/users/:userId", updateUser);
  app.delete("/api/users/:userId", deleteUser);
  app.post("/api/users/signup", signup);
  app.post("/api/users/signin", signin);
  app.post("/api/users/signout", signout);
  app.post("/api/users/profile", profile);

  const findCoursesForUser = async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      res.sendStatus(401);
      return;
    }
    if (currentUser.role === "ADMIN") {
      const courses = await courseDao.findAllCourses();
      res.json(courses);
      return;
    }
    let { uid } = req.params;
    if (uid === "current") {
      uid = currentUser._id;
    }
    const courses = await enrollmentsDao.findCoursesForUser(uid);
    res.json(courses);
  };
  const enrollUserInCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.enrollUserInCourse(uid, cid);
    res.send(status);
  };
  const unenrollUserFromCourse = async (req, res) => {
    let { uid, cid } = req.params;
    if (uid === "current") {
      const currentUser = req.session["currentUser"];
      uid = currentUser._id;
    }
    const status = await enrollmentsDao.unenrollUserFromCourse(uid, cid);
    res.send(status);
  };
  app.post("/api/users/:uid/courses/:cid", enrollUserInCourse);
  app.delete("/api/users/:uid/courses/:cid", unenrollUserFromCourse);
  app.get("/api/users/:uid/courses", findCoursesForUser);

  const createCourse = (req, res) => {
    const currentUser = req.session["currentUser"];
    const newCourse = courseDao.createCourse(req.body);
    enrollmentsDao.enrollUserInCourse(currentUser._id, newCourse._id);
    res.json(newCourse);
  };
  app.post("/api/users/current/courses", createCourse);

  /**
 * --------------------------
 * Teacher Functionalities
 * --------------------------
 */

  // Teacher creates a new quiz
  app.post("/api/users/current/courses/:courseId/quizzes", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.sendStatus(403);
      return;
    }
    const { courseId } = req.params;
    const quizData = {
      ...req.body,
      course_id: courseId,
      created_by: currentUser._id,
    };

    try {
      const newQuiz = await quizzesDao.createQuiz(quizData);
      res.status(201).json(newQuiz);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Teacher updates a quiz
  app.put("/api/users/current/quizzes/:quizId", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.sendStatus(403);
      return;
    }
    const { quizId } = req.params;

    try {
      const updatedQuiz = await quizzesDao.updateQuiz(quizId, req.body);
      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }
      res.json(updatedQuiz);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  // Teacher deletes a quiz
  app.delete("/api/users/current/quizzes/:quizId", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.sendStatus(403);
      return;
    }
    const { quizId } = req.params;

    try {
      const result = await quizzesDao.deleteQuiz(quizId);
      res.status(result ? 200 : 404).json(
        result
          ? { message: "Quiz deleted successfully." }
          : { error: "Quiz not found." }
      );
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all questions for a quiz
  app.get("/api/users/current/quizzes/:quizId/questions", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.sendStatus(401);
      return;
    }
    const { quizId } = req.params;

    try {
      const questions = await questionsDao.getQuestionsByQuizId(quizId);
      res.status(200).json(questions);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher adds a new question to a quiz
  app.post("/api/users/current/quizzes/:quizId/questions", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }

    const { quizId } = req.params;
    const { type, title, question, points, choices, correct_answers } = req.body;

    // Ensure required fields are provided
    if (!type || !title || !question || !points) {
      return res
        .status(400)
        .json({ error: "Missing required fields: type, title, question, or points." });
    }

    const questionData = {
      quiz_id: quizId,
      type,
      title,
      question,
      points,
      choices: type === "Multiple Choice" ? choices : undefined,
      correct_answers: type === "Fill in the Blank" ? correct_answers : undefined,
    };

    try {
      // Create the new question
      const newQuestion = await questionsDao.createQuestion(questionData);

      // Link the new question to the quiz
      const updatedQuiz = await quizzesDao.updateQuiz(quizId, { $push: { questions: newQuestion._id } });

      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }

      res.status(201).json({
        message: "Question added and linked to quiz successfully.",
        question: newQuestion,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher gets a question by ID
  app.put("/api/users/current/quizzes/:quizId/questions/:questionId", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.sendStatus(403);
      return;
    }
    const { questionId } = req.params;

    try {
      const updatedQuestion = await questionsDao.updateQuestion(questionId, req.body);
      if (!updatedQuestion) {
        return res.status(404).json({ error: "Question not found." });
      }
      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


  // Teacher updates a question
  app.put("/api/users/current/quizzes/:quizId/questions/:questionId", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      res.sendStatus(403);
      return;
    }
    const { questionId } = req.params;
    const { question, points, choices, correct_answers } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question field is required." });
    }

    try {
      const updatedQuestion = await questionsDao.updateQuestion(questionId, {
        question,
        points,
        choices,
        correct_answers,
      });
      if (!updatedQuestion) {
        return res.status(404).json({ error: "Question not found." });
      }
      res.status(200).json(updatedQuestion);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });


  // Teacher deletes a question
  app.delete("/api/users/current/quizzes/:quizId/questions/:questionId", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }

    const { quizId, questionId } = req.params;

    try {
      // Delete the question
      const deletedQuestion = await questionsDao.deleteQuestion(questionId);
      if (!deletedQuestion) {
        return res.status(404).json({ error: "Question not found." });
      }

      // Delete the question ID from the quiz's questions array
      const updatedQuiz = await quizzesDao.updateQuiz(quizId, {
        $pull: { questions: questionId },
      });

      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found or not updated." });
      }

      res.status(200).json({
        message: "Question deleted successfully and removed from quiz.",
        deletedQuestion,
        updatedQuiz,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher gets all attempts for a quiz
  app.get("/api/users/current/courses/:courseId/quizzes/:quizId/attempts", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }

    const { quizId } = req.params;

    try {
      const attempts = await attemptsDao.findAttemptsByQuizId(quizId);
      res.status(200).json(attempts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher gets a preview of a quiz
  app.get("/api/users/current/quizzes/:quizId/preview", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }
    const { quizId } = req.params;

    try {
      const quiz = await quizzesDao.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }

      const questions = await questionsDao.getQuestionsByQuizId(quizId);

      // Retrieve only the latest attempt
      const lastAttempt = await attemptsDao
        .findAttemptsByUserAndQuiz(currentUser._id, quizId)
        .sort({ end_time: -1 })
        .limit(1)
        .exec();

      res.status(200).json({
        quiz,
        questions,
        lastAttempt: lastAttempt.length > 0 ? lastAttempt[0] : null,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher submits a preview attempt for a quiz
  app.post("/api/users/current/quizzes/:quizId/preview/submit", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }
    const { quizId } = req.params;
    const { answers } = req.body;

    try {

      const questions = await questionsDao.getQuestionsByQuizId(quizId);

      let totalScore = 0;

      const processedAnswers = questions.map((question) => {
        const userAnswer = answers.find(
          (ans) => ans.question_id.toString() === question._id.toString()
        );

        let isCorrect = false;
        if (!userAnswer) {
          // No answer provided for this question
          return { question_id: question._id, answer: null, is_correct: false };
        }

        // Check if the answer is correct based on the question type
        if (question.type === "Multiple Choice") {
          isCorrect = question.choices.some(
            (choice) => choice.text === userAnswer.answer && choice.is_correct
          );
        } else if (question.type === "True/False") {
          isCorrect = userAnswer.answer === question.correct_answer;
        } else if (question.type === "Fill in the Blank") {
          isCorrect = question.correct_answers.some((correct) => {
            if (correct.case_insensitive) {
              // If case-insensitive, convert both to lowercase
              return correct.text.toLowerCase() === userAnswer.answer.toLowerCase();
            }
            // Otherwise, compare as is
            return correct.text === userAnswer.answer;
          });
        }

        // Calculate the total score
        if (isCorrect) {
          totalScore += question.points;
        }

        return { question_id: question._id, answer: userAnswer.answer, is_correct: isCorrect };
      });

      // Create a new attempt record
      const newAttempt = await attemptsDao.createAttempt({
        quiz_id: quizId,
        user_id: currentUser._id,
        answers: processedAnswers,
        score: totalScore,
        submitted: true,
        start_time: new Date(),
        end_time: new Date(),
      });

      res.status(201).json(newAttempt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher publishes a quiz
  app.put("/api/users/current/quizzes/:quizId/publish", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }

    const { quizId } = req.params;

    try {
      const updatedQuiz = await quizzesDao.updateQuiz(quizId, { published: true });
      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }
      res.status(200).json({ message: "Quiz published successfully." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher unpublishes a quiz
  app.put("/api/users/current/quizzes/:quizId/unpublish", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }

    const { quizId } = req.params;

    try {
      const updatedQuiz = await quizzesDao.updateQuiz(quizId, { published: false });
      if (!updatedQuiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }
      res.status(200).json({ message: "Quiz unpublished successfully." });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher updates a question, 
  // functionally the same as PUT /api/users/current/quizzes/:quizId/questions/:questionId but using PATCH makes it more RESTful
  app.patch("/api/users/current/quizzes/:quizId/questions/:questionId", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }

    const { questionId } = req.params;
    const questionUpdates = req.body;

    try {
      const updatedQuestion = await questionsDao.updateQuestion(questionId, questionUpdates);
      if (!updatedQuestion) {
        return res.status(404).json({ error: "Question not found or update failed." });
      }
      res.status(200).json({ message: "Question updated successfully.", updatedQuestion });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Teacher gets all quizzes for a course
  app.get("/api/users/current/courses/:courseId/quizzes", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser || currentUser.role !== "FACULTY") {
      return res.sendStatus(403); // Forbidden
    }

    const { courseId } = req.params;

    try {
      const quizzes = await quizzesDao.getQuizzesByCourseId(courseId);

      // Return all quizzes without filtering
      const detailedQuizzes = await Promise.all(
        quizzes.map(async (quiz) => {
          const questions = await questionsDao.getQuestionsByQuizId(quiz._id);

          return {
            ...quiz._doc,
            questionCount: questions.length,
          };
        })
      );

      res.status(200).json(detailedQuizzes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  /**
   * --------------------------
   * Student Functionalities
   * --------------------------
   */

  // Student starts a new attempt for a quiz
  app.post("/api/users/current/courses/:courseId/quizzes/:quizId/attempts", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.sendStatus(401); // Unauthorized
    }

    const { quizId } = req.params;
    const { access_code } = req.body; // Get access code from request body

    try {
      const quiz = await quizzesDao.getQuizById(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }

      // Dynamic quiz availability check
      const now = new Date();
      if (now < new Date(quiz.available_date)) {
        return res
          .status(403)
          .json({ error: `Quiz is not available until ${quiz.available_date}.` });
      }
      if (now > new Date(quiz.until_date)) {
        return res.status(403).json({ error: "Quiz is closed." });
      }

      // Validate access code if required
      if (quiz.access_code && quiz.access_code.trim() !== "") {
        if (access_code !== quiz.access_code) {
          return res.status(403).json({ error: "Invalid access code." });
        }
      }

      // Get all attempts for the current user and quiz
      const attempts = await attemptsDao.findAttemptsByUserAndQuiz(currentUser._id, quizId);

      // Check if multiple attempts are allowed
      if (!quiz.multiple_attempts && attempts.length > 0) {
        return res
          .status(403)
          .json({ error: "Multiple attempts are not allowed for this quiz." });
      }

      if (quiz.multiple_attempts && attempts.length >= quiz.max_attempts) {
        return res
          .status(403)
          .json({ error: "Maximum attempts reached. Cannot start a new attempt." });
      }

      // Create a new attempt
      const newAttempt = await attemptsDao.createAttempt({
        quiz_id: quizId,
        user_id: currentUser._id,
        start_time: new Date(),
        submitted: false,
        score: 0,
      });

      res.status(201).json(newAttempt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Student submits a quiz attempt
  app.patch("/api/users/current/attempts/:attemptId/submit", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.sendStatus(401); // Unauthorized
    }

    const { attemptId } = req.params;
    const { answers } = req.body;

    try {
      // Get the attempt by ID
      const attempt = await attemptsDao.findAttemptById(attemptId);

      // Check if the attempt exists
      if (!attempt) {
        return res.status(404).json({ error: "Attempt not found." });
      }

      // Check if the attempt is already submitted
      if (attempt.submitted) {
        return res.status(403).json({ error: "Attempt already submitted." });
      }

      // Get the quiz associated with the attempt
      const quiz = await quizzesDao.getQuizById(attempt.quiz_id);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found." });
      }

      // Check if the quiz has a time limit and if the time limit is exceeded
      if (quiz.time_limit) {
        const now = new Date();
        const timeElapsed = (now - new Date(attempt.start_time)) / (1000 * 60); // in minutes
        if (timeElapsed > quiz.time_limit) {
          return res.status(403).json({
            error: `Time limit exceeded. You had ${quiz.time_limit} minutes to complete the quiz.`,
          });
        }
      }

      // Get all questions associated with the quiz
      const questions = await questionsDao.getQuestionsByQuizId(attempt.quiz_id);

      // Calculate the total score and check each answer
      let totalScore = 0;
      const processedAnswers = questions.map((question) => {
        const userAnswer = answers.find(
          (ans) => ans.question_id.toString() === question._id.toString()
        );

        let isCorrect = false;
        if (!userAnswer) {
          // No answer provided for this question
          return { question_id: question._id, answer: null, is_correct: false };
        }

        // Check if the answer is correct based on the question type
        if (question.type === "Multiple Choice") {
          isCorrect = question.choices.some(
            (choice) => choice.text === userAnswer.answer && choice.is_correct
          );
        } else if (question.type === "True/False") {
          isCorrect = userAnswer.answer === question.correct_answer;
        } else if (question.type === "Fill in the Blank") {
          isCorrect = question.correct_answers.some((correct) => {
            if (correct.case_insensitive) {
              return correct.text.toLowerCase() === userAnswer.answer.toLowerCase();
            }
            return correct.text === userAnswer.answer;
          });
        }

        if (isCorrect) {
          totalScore += question.points;
        }

        return { question_id: question._id, answer: userAnswer.answer, is_correct: isCorrect };
      });

      // Update the attempt with the processed answers and total score
      const updatedAttempt = await attemptsDao.updateAttempt(attemptId, {
        answers: processedAnswers, // Store the detailed answers
        submitted: true,
        score: totalScore,
        end_time: new Date(),
      });

      res.status(200).json(updatedAttempt);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Student gets all attempts for a quiz
  app.get("/api/users/current/quizzes/:quizId/attempts", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.sendStatus(401); // Unauthorized
    }

    const { quizId } = req.params;

    try {
      const attempts = await attemptsDao.findAttemptsByUserAndQuiz(currentUser._id, quizId);
      res.status(200).json(attempts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Student gets all published quizzes for a course
  app.get("/api/users/current/courses/:courseId/quizzes/student", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.sendStatus(401); // Unauthorized
    }

    const { courseId } = req.params;

    try {
      const quizzes = await quizzesDao.getQuizzesByCourseId(courseId);

      // Filter only published quizzes and calculate status
      const detailedQuizzes = await Promise.all(
        quizzes
          .filter((quiz) => quiz.published) // Only include published quizzes
          .map(async (quiz) => {
            const questions = await questionsDao.getQuestionsByQuizId(quiz._id);
            const attempts = await attemptsDao.findAttemptsByUserAndQuiz(
              currentUser._id,
              quiz._id
            );

            let status;
            const now = new Date();
            if (now < new Date(quiz.available_date)) {
              status = `Not Available Until ${quiz.available_date}`;
            } else if (now > new Date(quiz.until_date)) {
              status = "Closed";
            } else {
              status = "Available";
            }

            return {
              ...quiz._doc,
              questionCount: questions.length,
              status,
              lastScore: attempts.length > 0 ? attempts[attempts.length - 1].score : null,
            };
          })
      );

      res.status(200).json(detailedQuizzes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


  // Student gets the result of the last attempt for a quiz
  app.get("/api/users/current/quizzes/:quizId/result", async (req, res) => {
    const currentUser = req.session["currentUser"];
    if (!currentUser) {
      return res.sendStatus(401);
    }

    const { quizId } = req.params;

    try {
      const attempts = await attemptsDao.findAttemptsByUserAndQuiz(currentUser._id, quizId);

      if (attempts.length === 0) {
        return res.status(404).json({ error: "No attempts found for this quiz." });
      }

      const lastAttempt = attempts[attempts.length - 1];

      const questions = await questionsDao.getQuestionsByQuizId(quizId);

      const detailedResults = questions.map((question) => {
        const userAnswer = lastAttempt.answers.find(
          (answer) => answer.question_id.toString() === question._id.toString()
        );

        return {
          question_id: question._id,
          title: question.title,
          points: question.points,
          correct_answer:
            question.type === "Multiple Choice"
              ? question.choices.find((choice) => choice.is_correct).text
              : question.type === "True/False"
                ? question.correct_answer
                : question.correct_answers.map((answer) => answer.text),
          user_answer: userAnswer ? userAnswer.answer : null,
          is_correct: userAnswer ? userAnswer.is_correct : false,
        };
      });

      res.status(200).json({
        score: lastAttempt.score,
        detailedResults,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });


}
