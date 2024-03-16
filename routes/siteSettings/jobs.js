const express = require("express");
const router = express.Router();
const { Jobs, JobApplication } = require("../../schemas/Jobs");
const { paginateQuery } = require("../../utils/Helper");
const { ObjectId } = require("mongodb");
const { Keyword } = require("../../schemas/Keywords");
const { User } = require("../../schemas/User");
const mongoose = require("mongoose");

router.get("/", async (req, res) => {
  const {
    search,
    searchBy,
    userId,
    page = 1,
    limit = 5,
    exact,
    isArray,
    applied,
  } = req.query;
  // Convert 'page' and 'limit' to integers
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);
  let query = {};

  if (search && searchBy) {
    if (exact === "true") {
      if (searchBy == "_id") {
        query[searchBy] = new ObjectId(search);
      } else {
        query[searchBy] = search;
      }
    } else if (isArray === "true") {
      query[searchBy] = { $in: [search] };
    } else {
      query[searchBy] = { $regex: search, $options: "i" };
    }
  }

  try {
    const totalDocuments = await Jobs.countDocuments(query);

    const paginatedQuery = paginateQuery(
      Jobs.find(query),
      parsedPage, // Use the parsed integer value
      parsedLimit // Use the parsed integer value
    );

    const jobs = await paginatedQuery.exec();

    const jobsWithUsers = await Promise.all(
      jobs.map(async (job) => {
        const user = await User.findOne({
          $or: [{ _id: job.venture }, { _id: job.company }],
        });

        // Check if the user has applied for this job
        const isApplied = userId
          ? await JobApplication.findOne({
              user: new ObjectId(userId),
              job: job._id,
            })
          : false;

        if (applied === "true" && !!isApplied) {
          return {
            ...job._doc,
            userDetails: user,
            isApplied: true, // Set to true when applied is 'true' and user has applied
          };
        } else if (!applied) {
          // When applied is not provided or set to 'false', return all jobs
          return {
            ...job._doc,
            userDetails: user,
            isApplied: !!isApplied, // Convert to boolean
          };
        }

        // For cases where applied is 'true' but the user has not applied, skip this job
        return null;
      })
    );

    // Filter out null values (jobs where applied is 'true' but user hasn't applied)
    const filteredJobsWithUsers = jobsWithUsers.filter((job) => job !== null);

    // Send the filtered results
    res.status(200).json({
      status: 200,
      message: "Success",
      data: filteredJobsWithUsers,
      total: totalDocuments,
      totalPages: Math.ceil(totalDocuments / parsedLimit), // Use parsedLimit
      currentPage: parsedPage, // Use parsedPage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/candidates/:jobId", async (req, res) => {
  try {
    const jobId = req.params.jobId;

    // Find the job details
    const job = await Jobs.findById(jobId);

    if (!job) {
      return res.status(404).json({
        status: 404,
        message: "Job not found",
      });
    }

    // Find the applicants for the job
    const jobApplications = await JobApplication.find({ job: jobId });

    // Collect details of the applicants
    const candidates = [];

    for (const application of jobApplications) {
      const user = await User.findById(application.user); // Replace "User" with your user model
      candidates.push({
        userId: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }

    res.status(200).json({
      status: 200,
      message: "Candidates for the job",
      data: candidates,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/recruiters/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    // Find job applications for the user
    const jobApplications = await JobApplication.find({ user: userId })
      .skip((page - 1) * limit)
      .limit(limit);
    // Extract job IDs from the applications
    const jobIds = jobApplications.map((application) => application.job);

    // Find jobs with the extracted job IDs
    const jobs = await Jobs.find({ _id: { $in: jobIds } });

    // Extract company or venture IDs from the jobs
    const companyOrVentureIds = jobs.map((job) => job.company || job.venture);
    // Find companies or ventures with the extracted IDs
    var companiesOrVentures = [];
    companyOrVentureIds.map(async (id) => {
      const data = await User.find({
        _id: new ObjectId(id),
      });
      console.log(companyOrVentureIds, data);
      companiesOrVentures.push(data);
    });

    console.log(jobs);

    // Paginate the results
    const totalItems = companiesOrVentures.length;
    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = page;

    const paginatedCompaniesOrVentures = companiesOrVentures.slice(
      (page - 1) * limit,
      page * limit
    );

    res.status(200).json({
      status: 200,
      message: "Retrieved applied companies or ventures for the user",
      data: paginatedCompaniesOrVentures,
      totalItems,
      totalPages,
      currentPage,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/top-locations", async (req, res) => {
  try {
    const { page, limit } = req.query;

    const locationJobCounts = await Jobs.aggregate([
      {
        $group: {
          _id: "$location",
          jobCount: { $sum: 1 },
          companies: { $addToSet: "$company" },
          ventures: { $addToSet: "$venture" },
        },
      },
      {
        $project: {
          _id: 1,
          jobCount: 1,
          entities: { $concatArrays: ["$companies", "$ventures"] },
        },
      },
      { $sort: { jobCount: -1 } },
      { $limit: parseInt(limit, 10) || 10 }, // You can adjust the limit as needed
    ]);

    const topLocations = locationJobCounts.map((location) => ({
      location: location._id,
      jobCount: location.jobCount,
      entities: location.entities,
    }));

    res.status(200).json({
      status: 200,
      message: "Success",
      data: topLocations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/top-recruiters", async (req, res) => {
  try {
    const { page = 1, limit = 5, isArray, exact, search, searchBy } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    var query = {};
    if (search && searchBy) {
      if (exact === "true") {
        if (searchBy == "_id") {
          query[searchBy] = new ObjectId(search);
        } else {
          query[searchBy] = search;
        }
      } else if (isArray === "true") {
        query[searchBy] = { $in: [search] };
      } else {
        query[searchBy] = { $regex: search, $options: "i" };
      }
    }

    const recruiterJobCounts = await Jobs.aggregate([
      { $group: { _id: "$user", jobCount: { $sum: 1 } } },
      { $sort: { jobCount: -1 } },
      { $limit: parseInt(limit, 10) || 10 }, // You can adjust the limit as needed
    ]);

    const recruiterIds = recruiterJobCounts.map((recruiter) => recruiter._id);
    query["_id"] = { $in: recruiterIds };
    const recruiters = await paginateQuery(
      User.find(query),
      parsedPage, // Use the parsed integer value
      parsedLimit // Use the parsed integer value
    ).exec();
    const recruitersWithJobCount = recruiters.map((recruiter) => {
      const matchingCount = recruiterJobCounts.find(
        (count) => count._id.toString() === recruiter._id.toString()
      );
      return {
        ...recruiter._doc,
        jobCount: matchingCount ? matchingCount.jobCount : 0,
      };
    });

    res.status(200).json({
      status: 200,
      message: "Success",
      data: recruitersWithJobCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/similar-jobs", async (req, res) => {
  try {
    const { ids, limit, page } = req.query;
    const jobIds = Array.isArray(ids) ? ids : [ids]; // Convert to array if not already
    const pageNumber = parseInt(page || 1, 10);
    const itemsPerPage = parseInt(limit || 5, 10);

    const targetJobs = await Jobs.find({ _id: { $in: jobIds } });

    const similarJobs = await Jobs.aggregate([
      { $match: { _id: { $nin: jobIds } } },
      { $unwind: "$tags" },
      {
        $match: {
          $or: [
            { tags: { $in: targetJobs.flatMap((job) => job.tags) } },
            { user: { $in: targetJobs.map((job) => job.user) } },
            { company: { $in: targetJobs.map((job) => job.company) } },
            { venture: { $in: targetJobs.map((job) => job.venture) } },
            { salary: { $in: targetJobs.map((job) => job.salary) } },
            {
              employmentType: {
                $in: targetJobs.map((job) => job.employmentType),
              },
            },
            {
              workplaceType: {
                $in: targetJobs.map((job) => job.workplaceType),
              },
            },
            { location: { $in: targetJobs.map((job) => job.location) } },
          ],
        },
      },
      { $group: { _id: "$_id", job: { $first: "$$ROOT" } } },
    ]);

    const totalCount = similarJobs.length;
    const totalPages = Math.ceil(totalCount / itemsPerPage);
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalCount);
    const results = similarJobs.slice(startIndex, endIndex);

    res.status(200).json({
      status: 200,
      message: "Success",
      data: results,
      totalResults: totalCount,
      totalPages: totalPages,
      currentPage: pageNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/company-details/:id", async (req, res) => {
  try {
    const jobId = req.params.id;

    const job = await Jobs.findById(jobId);
    if (!job) {
      return res.status(404).json({
        status: 404,
        message: "Job not found",
      });
    }

    const [venture, company, user] = await Promise.all([
      job.venture ? User.findById(job.venture) : null,
      job.company ? User.findById(job.company) : null,
      User.findById(job.user),
    ]);

    const result = {
      venture:
        venture && venture._id.toString() === job.venture ? venture : null,
      company:
        company && company._id.toString() === job.company ? company : null,
      user: user && user._id.toString() === job.user ? user : null,
    };

    res.status(200).json({
      status: 200,
      message: "Success",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.get("/keywords", async (req, res) => {
  try {
    const { type, keyword } = req.query;

    let query = {};
    if (type) {
      query.type = type;
    }
    if (keyword) {
      query.keyword = { $regex: keyword, $options: "i" };
    }
    const keywords = await Keyword.find(query);
    res.json({
      status: 200,
      message: "Success",
      data: keywords,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.post("/apply/:jobId/:userId", async (req, res) => {
  try {
    const jobId = req.params.jobId;
    const userId = req.params.userId;

    // Validate if jobId and userId are valid ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(jobId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        status: 400,
        message: "Invalid jobId or userId",
      });
    }

    // Check if the job and user exist
    const job = await Jobs.findById(jobId);
    const user = await User.findById(userId);

    if (!job || !user) {
      return res.status(404).json({
        status: 404,
        message: "Job or user not found",
      });
    }

    // Check if the user has already applied to this job
    const existingApplication = await JobApplication.findOne({
      user: userId,
      job: jobId,
    });

    if (existingApplication) {
      return res.status(400).json({
        status: 400,
        message: "User has already applied to this job",
      });
    }

    // Create a new job application document
    const jobApplication = new JobApplication({
      user: userId,
      job: jobId,
    });

    await jobApplication.save();

    res.status(200).json({
      status: 200,
      message: "User has successfully applied to the job",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

router.post("/", async (req, res) => {
  const data = req.body.data;
  if (!data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    // Generate a random ID or other fields if needed
    const newJob = new Jobs(data);

    try {
      const result = await newJob.save();

      // Update or insert keywords (tags, skills, industry, benefits, salary ranges)
      updateKeywords(data.tags, "tags");
      updateKeywords(data.skills, "skills");
      updateKeywords([data.industry], "industry");
      updateKeywords(data.benefits, "benefits");
      updateKeywords([data.salary], "salary");
      updateKeywords([data.employmentType], "employmentType");
      updateKeywords([data.workplaceType], "workplaceType");
      updateKeywords([data.location], "location");
      updateKeywords([data.experienceLevel], "experienceLevel");

      // experienceLevel
      res.json({
        status: "200",
        message: "Success",
        data: { Job: result },
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Error In adding to Jobs" });
    }
  }
});

router.put("/", async (req, res) => {
  const id = req.query.id;
  const data = req.body.data;
  if (!id || !data) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    try {
      const result = await Jobs.findOneAndUpdate(
        { _id: id },
        { ...data },
        { new: true }
      );

      if (!result) {
        res.status(400).json({
          status: 400,
          message: "Job does not exist",
        });
      } else {
        res.status(200).json({
          status: 200,
          message: "Successfully updated job data",
          data: { ...result._doc },
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "Error. Please try again",
      });
    }
  }
});

router.delete("/", async (req, res) => {
  const id = req.query.id;
  if (!id) {
    res.status(401).json({ status: 401, message: "Invalid details" });
  } else {
    try {
      const success = await Jobs.findOneAndDelete({ _id: id });

      if (!success) {
        res.status(200).json({
          status: 200,
          message: "Job does not exist",
        });
      } else {
        res.status(200).json({
          status: 200,
          message: `Successfully deleted job`,
          data: { ...success._doc },
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: 500,
        message: "Server error in processing your request",
      });
    }
  }
});

router.get("/search", async (req, res) => {
  try {
    const {
      keyword,
      page = 1,
      limit = 5,
      search,
      searchBy,
      exact,
      isArray,
    } = req.query;

    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    var searchQuery = {};
    if (keyword) {
      searchQuery = {
        $or: [
          { title: { $regex: keyword, $options: "i" } }, // Title field
          { industry: { $regex: keyword, $options: "i" } }, // Industry field
          { skills: { $in: [keyword] } }, // Skills field (array)
          { tags: { $in: [keyword] } }, // Tags field (array)
          { benefits: { $in: [keyword] } }, // Benefits field (array)
          { educationRequired: { $in: [keyword] } }, // EducationRequired field (array)
          { workplaceType: { $regex: keyword, $options: "i" } }, // WorkplaceType field
          { salary: { $regex: keyword, $options: "i" } }, // Salary field
          { experienceLevel: { $regex: keyword, $options: "i" } }, // ExperienceLevel field
          { location: { $regex: keyword, $options: "i" } }, // Location field
          { employmentType: { $regex: keyword, $options: "i" } }, // EmploymentType field
        ],
      };
    }
    if (search && searchBy) {
      if (exact === "true") {
        if (searchBy == "_id") {
          searchQuery[searchBy] = new ObjectId(search);
        } else {
          searchQuery[searchBy] = search;
        }
      } else if (isArray === "true") {
        searchQuery[searchBy] = { $in: [search] };
      } else {
        searchQuery[searchBy] = { $regex: search, $options: "i" };
      }
    }

    // Perform the search using the searchQuery
    // const searchResults = await Jobs.find(searchQuery);
    const paginatedQuery = paginateQuery(
      Jobs.find(searchQuery),
      parsedPage, // Use the parsed integer value
      parsedLimit // Use the parsed integer value
    );

    const searchResults = await paginatedQuery.exec();

    res.status(200).json({
      status: 200,
      message: "Search results",
      data: searchResults,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 500,
      message: "Server error in processing your request",
    });
  }
});

async function updateKeywords(keywords, type) {
  console.log(keywords, type);
  if (!keywords || !type) {
    return;
  }

  for (const keyword of keywords) {
    try {
      await Keyword.findOneAndUpdate(
        { keyword, type },
        { $inc: { count: 1 } },
        { upsert: true }
      );
    } catch (error) {
      console.error("Error updating keyword:", error);
    }
  }
}
module.exports = router;
