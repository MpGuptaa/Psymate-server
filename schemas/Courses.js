const mongoose = require("mongoose");

const CoursesSchema = new mongoose.Schema({
  id: String, // unique identifier for the course
  displayName: String, // name of the course
  instructor: String, // name of the instructor who teaches the course
  description: String, // brief description of the course
  price: Number, // price of the course in USD
  duration: mongoose.Mixed, // duration of the course in weeks
  rating: Number, // average rating of the course on a scale of 1-5
  studentsEnrolled: Number, // number of students enrolled in the course
  topics: [mongoose.Mixed], // array of topics covered in the course
  photoUrl: String,
  thumbnail: String,
  videoUrl: String,
  thumbnail: String,
  meta: [mongoose.Mixed],
  lessons: [mongoose.Mixed],
  level: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "expert"],
    default: "beginner",
  },
  access: {
    type: String,
    enum: ["lifetime", "limited", "once"],
    default: "once",
  },
  certificate: String,
  status: {
    type: String,
    enum: ["published", "draft", "pending", "rejected", "expired"],
    default: "draft",
  },
  isLocked: { type: Boolean, default: true },
  language: [mongoose.Mixed],
  quizzes: String,
  overview: { type: String, default: "" },
  agenda: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Courses = mongoose.model("Courses", CoursesSchema);

module.exports = { Courses };
