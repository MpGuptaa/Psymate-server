const express = require("express");
const router = express.Router();
const { User } = require("../../schemas/User");
const { Attendance } = require("../../schemas/WorkTime");
const Joi = require("joi");
router.post("/clock/in", async (req, res) => {
    const { userId, timestamp } = req.body
    const requestData = Joi.object({
        userId: Joi.string().required(),

    });
    const { error } = requestData.validate({
        userId,

    });
    if (error)
        return res.status(400).json({ status: 400, message: error.message });
    try {

        const dateTime = new Date(); // Your new Date object
        const formattedDateTime = dateTime.toISOString();
        const date = formattedDateTime.split('T')[0]; // Extract date
        const time = formattedDateTime.split('T')[1].slice(0, 8); // Extract time
        const clockInTime = time
        const existingUser = await User.findOne({ userId: userId });
        if (!existingUser) {
            return res.status(400).send({
                message: "Invalid User",
            });
        }

        const today = date

        // Find or create the attendance record for the user and date
        let attendance = await Attendance.findOne({ userId, date: today });

        if (attendance) {
            const latestEntryIndex = attendance.TimeLine.length - 1;
            if (!attendance.TimeLine[latestEntryIndex].clockOutTime) {
                return res.status(400).send({
                    message: "first log-out",
                });
            }
        }
        if (!attendance) {
            attendance = new Attendance({
                userId,
                date: today,
                TimeLine: [],
            });
        }

        // Add new clock-in entry to the timeline
        attendance.TimeLine.push({ clockInTime, clockOutTime: "" });
        await attendance.save();
        existingUser.isClock = true
        await existingUser.save();
        res.status(200).send({ "success": true, "message": "Clock-in successful" });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: "Server error in processing your request",
        });
    }

});

router.post("/clock/out", async (req, res) => {
    const { userId, timestamp } = req.body
    const requestData = Joi.object({
        userId: Joi.string().required(),

    });
    const { error } = requestData.validate({
        userId,

    });
    if (error)
        return res.status(400).json({ status: 400, message: error.message });
    try {
        const dateTime = new Date(); // Your new Date object
        const formattedDateTime = dateTime.toISOString();
        const date = formattedDateTime.split('T')[0]; // Extract date
        const time = formattedDateTime.split('T')[1].slice(0, 8); // Extract time
        const clockOutTime = time
        const existingUser = await User.findOne({ userId: userId });
        if (!existingUser) {
            return res.status(400).send({
                message: "Invalid User",
            });
        }

        const today = date

        // Find or create the attendance record for the user and date
        let attendance = await Attendance.findOne({ userId, date: today });

        if (!attendance) {
            return res.status(400).send({
                message: "Attendance record not found",
            });
        }

        // Find the latest clock-in entry and update its clock-out time
        const latestEntryIndex = attendance.TimeLine.length - 1;

        if (attendance.TimeLine[latestEntryIndex].clockOutTime) {
            return res.status(400).send({
                message: "first login",
            });
        }

        function calculateTotalHours(clockInTime, clockOutTime) {
            const [startHour, startMinute, startSecond] = clockInTime.split(":").map(Number);
            const [endHour, endMinute, endSecond] = clockOutTime.split(":").map(Number);

            const startTotalMinutes = startHour * 60 + startMinute + startSecond / 60;
            const endTotalMinutes = endHour * 60 + endMinute + endSecond / 60;

            // Calculate the difference in hours
            const totalHours = (endTotalMinutes - startTotalMinutes) / 60;
            return totalHours.toFixed(1);
        }
        attendance.TimeLine[latestEntryIndex].clockOutTime = clockOutTime;

        // For simplicity, I'm assuming a function calculateTotalHours exists
        attendance.TimeLine[latestEntryIndex].totalHours = calculateTotalHours(
            attendance.TimeLine[latestEntryIndex].clockInTime,
            clockOutTime
        );

        await attendance.save();
        existingUser.isClock = false
        await existingUser.save();
        res.status(200).send({ "success": true, "message": "Clock-out successful" });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 500,
            message: "Server error in processing your request",
        });
    }

});

router.get("/attendance/:userId/:start/:end", async (req, res) => {
    const { userId, start, end } = req.params;
    const requestData = Joi.object({
        userId: Joi.string().required(),
        start: Joi.string().required(),
        end: Joi.string().required(),
    });
    const { error } = requestData.validate({
        userId,
        start,
        end,

    });
    if (error)
        return res.status(400).json({ status: 400, message: error.message });
    try {
        // Convert start and end dates to Date objects
        const startDate = start
        const endDate = end

        // Fetch attendance data for the specific userId within the date range
        const attendancedata = await Attendance.find({
            userId,
            date: { $gte: startDate, $lte: endDate }, // Filter by date range
        });
        let totalhoursperDay = []
        for (const attendance of attendancedata) {
            let totalHours = 0;

            if (attendance.TimeLine && attendance.TimeLine.length > 0) {
                for (const timeline of attendance.TimeLine) {
                    if (timeline.totalHours) {
                        totalHours += timeline.totalHours;
                    }
                }
            }
            let totalDay = totalHours / 8
            totalhoursperDay.push({ "totalHours": totalHours, "Date": attendance.date, "totalDay": parseFloat(totalDay.toFixed(1)) })
        }
        let totalHours = 0;
        let totalDay = 0;
        for (const attendance of totalhoursperDay) {

            totalHours += attendance.totalHours
            totalDay += attendance.totalDay


        }


        res.json({ "attendancedata": totalhoursperDay, "totalDay": totalDay, "totalHours": totalHours });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
});


module.exports = router;