import * as assignmentsDao from "./dao.js";

export default function AssignmentRoutes(app) {
  app.put("/api/assignment/:assignmentId", (req, res) => {
    const { assignmentId } = req.params;
    const assignmentUpdates = req.body;
    const status = assignmentDao.updateAssignment(assignmentId, assignmentUpdates);
    res.send(status);
  });
  app.delete("/api/assignment/:assignmentId", (req, res) => {
    const { assignmentId } = req.params;
    const status = assignmentDao.deleteAssignment(assignmentId);
    res.send(status);
  });
}
