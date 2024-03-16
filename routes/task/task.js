const express = require("express");
const {createTask,getallTasks, updateTaskstatus, deleteTask} = require("./controllers/taskController");
const router = express.Router();

router.route("/add").post(createTask);
router.route("/list").get(getallTasks);
router.route("/update/:id").put(updateTaskstatus);
router.route("/delete/:id").delete(deleteTask);

module.exports = router;
