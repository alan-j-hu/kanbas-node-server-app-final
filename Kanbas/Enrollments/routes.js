import * as enrollmentsDao from "./dao.js";

export default function EnrollmentRoutes(app) {
  app.get("/api/enrollments", (req, res) => {
    const currentUser = req.session["currentUser"];
    const enrollments = enrollmentsDao.getEnrollments();
    res.json(enrollments.filter(e => e.user === currentUser._id));
  });

  app.post("/api/enrollments/:cid", (req, res) => {
    const { cid } = req.params;
    const currentUser = req.session["currentUser"];
    const newEnrollment = enrollmentsDao.enrollUserInCourse(currentUser._id, cid);
    res.json(newEnrollment);
  });

  app.delete("/api/enrollments/:cid", (req, res) => {
    const { cid } = req.params;
    const currentUser = req.session["currentUser"];
    const status = enrollmentsDao.unenrollUserFromCourse(currentUser._id, cid);
    res.send(status);
  });
}
