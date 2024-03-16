const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String },
  venture: { type: String },
  user: { type: String },
  location: { type: String, required: true },
  employmentType: {
    type: String,
    enum: [
      "Full-time",
      "Part-time",
      "Contract",
      "Temporary",
      "Volunteer",
      "Internship",
      "Other",
    ],
  },
  salary: { type: String },
  experienceLevel: {
    type: String,
  },
  applicants: { type: [mongoose.Mixed], default: [] },
  workplaceType: { type: String, enum: ["Remote", "Office"] },
  industry: { type: [String] },
  skills: { type: [String] },
  tags: { type: [String] },
  educationRequired: { type: [String] },
  benefits: { type: [String] },
  expiry: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const jobApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User collection
    required: true,
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Job", // Reference to the Job collection
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const JobApplication = mongoose.model("applications", jobApplicationSchema);
const Jobs = mongoose.model("Jobs", jobSchema);

module.exports = { Jobs, JobApplication };
