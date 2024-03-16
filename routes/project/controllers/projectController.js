const { Project, validateProject } = require('../../../schemas/Project');
const catchAsyncErrors = require("../../../middleware/catchAsyncErrors");
const ApiFeatures = require("../../../middleware/apifeatures");

const createProject = catchAsyncErrors(async (req, res) => {
        const { error } = validateProject(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: error.details[0].message,
            });
        }
        const project = new Project(req.body);
        await project.save();
        res.status(201).json({
            message: "Project created successfully",
            project: project
        });
});



const getallProjects = catchAsyncErrors(async (req, res) => {
    const resultPerPage = 8;
    if (req.query.projectId) {
        const project = await Project.findById(req.query.projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        return res.status(200).json({
            project,
        });
    }
    const projectsCount = await Project.countDocuments();

    const apiFeature = new ApiFeatures(Project.find(), req.query).search().pagination(resultPerPage);

    let projects = await apiFeature.query;

    let filteredprojectsCount = projects.length;

    res.status(200).json({
        projects,
        projectsCount,
        resultPerPage,
        filteredprojectsCount,
    });
});

const updateProject = catchAsyncErrors(async (req, res) => {
    const projectId = req.params.projectId;
    const updateData = req.body;

    const project = await Project.findById(projectId);

    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const userId = req.user._id;
    if (!project.access.includes(userId)) {
        return res.status(403).json({ message: 'You do not have permission to update this project' });
    }
    project.access.push(loggedInUserId);
    Object.assign(project, updateData);
    await project.save();

    res.status(200).json({
        message: 'Project updated successfully',
        project: project
    });
});



const deleteProject = catchAsyncErrors(async (req, res) => {
    const projectId = req.params.projectId;
    const project = await Project.findById(projectId);
    const { error } = validateProject(updateData);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    if (!project) {
        return res.status(404).json({ message: 'Project not found' });
    }

    const userId = req.user._id;
    if (!project.access.includes(userId)) {
        return res.status(403).json({ message: 'You do not have permission to delete this project' });
    }

    await Project.findByIdAndDelete(projectId);
    res.status(200).json({
        message: 'Project deleted successfully'
    });
});

module.exports = { createProject, getallProjects, updateProject, deleteProject };
