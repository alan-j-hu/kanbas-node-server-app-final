import Database from "../Database/index.js";

export function getEnrollments() {
  const { enrollments } = Database;
    console.log(Database.enrollments);
  return enrollments;
}

export function enrollUserInCourse(userId, courseId) {
  const { enrollments } = Database;
    console.log(Database.enrollments);
  enrollments.push({ _id: new Date().getTime().toString(), user: userId, course: courseId });
}

export function unenrollUserFromCourse(userId, courseId) {
  const { enrollments } = Database;
  Database.enrollments = enrollments.filter((e) => e.user !== userId || e.course !== courseId);
    console.log(Database.enrollments);
}
