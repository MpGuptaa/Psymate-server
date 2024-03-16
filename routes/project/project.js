const express = require('express');
const router = express.Router();
const {createProject,getallProjects, updateProject, deleteProject} = require("./controllers/projectController");

router.route('/list').get(getallProjects);
router.route('/add').post(createProject);
router.route('/update/:id').put(updateProject);
router.route('/delete/:id').delete(deleteProject);

module.exports = router;
