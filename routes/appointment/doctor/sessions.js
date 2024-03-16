const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Session = require("../../../schemas/Sessions");
const { User } = require("../../../schemas/User"); // Assuming this is your User model
const { Establishments } = require("../../../schemas/Establishments"); // Assuming this is your Establishment model
const { generateRandomId } = require("../../../utils/Helper");
const moment = require("moment");
const { Appointment } = require("../../../schemas/Appointment");

const validateSession = [
  body("establishmentId")
    .notEmpty()
    .withMessage("Establishment ID is required."),
  body("weekdays").isArray().withMessage("Weekdays must be an array."),
  body("startTime").notEmpty().withMessage("Start time is required."),
  body("endTime").notEmpty().withMessage("End time is required."),
  body("doctorId").notEmpty().withMessage("Doctor ID is required."),
];

router.get("/", async (req, res) => {
  try {
    const {
      doctorId,
      establishmentId,
      slotDuration,
      days,
      // alexa,
      date,
      returnSession,
    } = req.query;
    const currentDate = moment();
    const nextDates = generateDateRange(date, days, currentDate);

    // Fetch the doctor's sessions from the database
    const doctorSessions = await Session.find({ doctorId, establishmentId });

    if (returnSession) {
      return res.status(200).json(doctorSessions);
    }

    const sessionsByEstablishment = new Map();

    await Promise.all(
      doctorSessions.map(async (session) => {
        const sessionEstablishmentId = session.establishmentId;

        if (establishmentId && establishmentId !== sessionEstablishmentId) {
          return;
        }

        if (!sessionsByEstablishment.has(sessionEstablishmentId)) {
          sessionsByEstablishment.set(sessionEstablishmentId, {
            establishment: sessionEstablishmentId,
            availableMinutes: 0,
            slots: {},
          });
        }

        const establishment = sessionsByEstablishment.get(
          sessionEstablishmentId
        );

        await Promise.all(
          nextDates.map(async (date) => {
            const slots = await generateSlots(
              session,
              date,
              slotDuration,
              currentDate
            );

            slots.forEach((slot) => {
              establishment.slots[slot.date] =
                establishment.slots[slot.date] || [];
              establishment.slots[slot.date].push(slot);
            });
          })
        );

        establishment.availableMinutes = calculateAvailableMinutes(
          establishment.slots,
          slotDuration
        );
      })
    );

    const establishmentsArray = Array.from(
      sessionsByEstablishment.values()
    ).filter((establishment) => establishment.availableMinutes > 0);

    // if (alexa) {
    //   res
    //     .status(200)
    //     .json(generateAlexaResponse(establishmentsArray, slotDuration));
    // } else {
    res.status(200).json(establishmentsArray);
    // }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

function generateDateRange(date, days, currentDate) {
  const nextDates = [];
  if (date) {
    nextDates.push(moment(date));
  } else {
    const [startDay, endDay] =
      days && /^\d+\s*-\s*\d+$/.test(days)
        ? days.split("-").map(Number)
        : [1, 1];
    for (let i = startDay; i <= endDay; i++) {
      nextDates.push(currentDate.clone().add(i - 1, "days"));
    }
  }
  return nextDates;
}

async function generateSlots(session, date, slotDuration, currentDate) {
  const startTime = moment.utc(
    `${date.format("YYYY-MM-DD")}T${moment(session.startTime)
      .utc()
      .format("HH:mm:ss")}`
  );
  const endTime = moment.utc(
    `${date.format("YYYY-MM-DD")}T${moment(session.endTime)
      .utc()
      .format("HH:mm:ss")}`
  );

  const slots = [];

  while (startTime.isBefore(endTime)) {
    const slotEndTime = startTime.clone().add(slotDuration, "minutes");

    if (slotEndTime.isAfter(currentDate)) {
      const slot = {
        date: date.format("YYYY-MM-DD"),
        time: `${startTime} - ${slotEndTime}`,
        available: true,
      };

      const conflictingAppointment = await isSlotConflictingWithAppointments(
        session.doctorId,
        session.establishmentId,
        slot.date,
        startTime.toISOString(),
        slotEndTime.toISOString()
      );

      if (conflictingAppointment) {
        const appointmentDetails = await getAppointmentDetails(
          session.doctorId,
          session.establishmentId,
          slot.date,
          startTime.toISOString(),
          slotEndTime.toISOString()
        );

        // if (!alexa) {
        slot.appointment = appointmentDetails;
        slot.status = appointmentDetails.status;
        slot.available = false;
        // }
      }

      slots.push(slot);
    }

    startTime.add(slotDuration, "minutes");
  }

  return slots;
}

// Function to check if a slot is conflicting with appointments
async function isSlotConflictingWithAppointments(
  doctorId,
  establishmentId,
  appointmentDate,
  slotStartTime,
  slotEndTime
) {
  const conflictingAppointment = await Appointment.findOne({
    "doctor._id": doctorId,
    appointmentDate: appointmentDate,
    establishmentId: establishmentId,
    deleted: false,
    $or: [
      {
        $and: [
          {
            startTime: {
              $lt: new Date(
                `${appointmentDate}T${slotEndTime?.toString().split("T")[1]}`
              ),
            },
          },
          {
            endTime: {
              $gt: new Date(
                `${appointmentDate}T${slotStartTime?.toString().split("T")[1]}`
              ),
            },
          },
        ],
      },
      {
        $and: [
          {
            startTime: {
              $gte: new Date(
                `${appointmentDate}T${slotStartTime?.toString().split("T")[1]}`
              ),
            },
          },
          {
            startTime: {
              $lt: new Date(
                `${appointmentDate}T${slotEndTime?.toString().split("T")[1]}`
              ),
            },
          },
        ],
      },
    ],
  });
  return conflictingAppointment !== null;
}

// Function to get appointment details for a conflicting slot
async function getAppointmentDetails(
  doctorId,
  establishmentId,
  appointmentDate,
  slotStartTime,
  slotEndTime
) {
  const appointment = await Appointment.findOne({
    "doctor._id": doctorId,
    appointmentDate: appointmentDate,
    establishmentId: establishmentId,
    $or: [
      {
        $and: [
          {
            startTime: {
              $lt: new Date(
                `${appointmentDate}T${slotEndTime?.toString().split("T")[1]}`
              ),
            },
          },
          {
            endTime: {
              $gt: new Date(
                `${appointmentDate}T${slotStartTime?.toString().split("T")[1]}`
              ),
            },
          },
        ],
      },
      {
        $and: [
          {
            startTime: {
              $gte: new Date(
                `${appointmentDate}T${slotStartTime?.toString().split("T")[1]}`
              ),
            },
          },
          {
            startTime: {
              $lt: new Date(
                `${appointmentDate}T${slotEndTime?.toString().split("T")[1]}`
              ),
            },
          },
        ],
      },
    ],
  });
  return appointment;
}

// Function to generate Alexa response
function generateAlexaResponse(establishmentsArray, slotDuration) {
  // Extract necessary information from the establishmentsArray and format the speechOutput
  // This is a sample format, you can customize it as needed
  let speechOutput = "This doctor is available at ";
  let totalTime = 0;

  establishmentsArray.forEach((establishment) => {
    for (const dateKey in establishment.slots) {
      establishment.slots[dateKey].forEach((slot) => {
        if (slot.available) {
          totalTime += Number(slotDuration);
          speechOutput += `${slot.time}, `;
        }
      });
    }
  });

  speechOutput += `for ${slotDuration} mins each.`;
  return speechOutput;
}

router.get("/all", async (req, res) => {
  try {
    const session = await Session.find({});
    res.status(200).json(session);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

router.post("/", validateSession, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Calculate session ID (You can use a suitable algorithm)
    const sessionId = generateRandomId("mixed", 10);

    // Calculate time duration based on start and end time
    const startTime = moment(req.body.startTime).utc();
    const endTime = moment(req.body.endTime).utc();
    const durationMinutes = calculateDuration(startTime, endTime);
    // Check if the doctor exists in the User collection
    const doctor = await User.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(400).json({ error: "Doctor not found." });
    }

    // Check if the establishment exists in the Establishment collection
    const establishment = await Establishments.findById(
      req.body.establishmentId
    );
    if (!establishment) {
      return res.status(400).json({ error: "Establishment not found." });
    }
    // Check if there are overlapping sessions for the same weekday and establishment
    const overlappingSessions = await Session.find({
      establishmentId: req.body.establishmentId,
      weekdays: { $in: req.body.weekdays },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $gte: startTime, $lt: endTime },
        },
        {
          endTime: { $gt: startTime, $lte: endTime },
        },
      ],
    });

    if (overlappingSessions.length > 0) {
      return res.status(400).json({
        error:
          "A session with overlapping time already exists for this establishment and weekday.",
      });
    }

    // Create the session object with calculated values
    const session = new Session({
      ...req.body,
      sessionId,
      durationMinutes,
    });

    await session.save();

    // Send a success response with session details
    res.status(201).json({
      message: `Your session is created for ${durationMinutes} minutes from ${startTime} to ${endTime} for ${
        establishment.establishmentName
      } on ${req.body.weekdays.join(", ")}`,
      session: session,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Failed to create a session" });
  }
});

router.put("/:sessionId", validateSession, async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const sessionId = req.params.sessionId;

    // Check if the session exists
    const session = await Session.findById(sessionId);
    if (!session) {
      return res.status(404).json({ error: "Session not found." });
    }

    // Calculate time duration based on start and end time
    const startTime = moment(req.body.startTime).utc();
    const endTime = moment(req.body.endTime).utc();
    const durationMinutes = calculateDuration(startTime, endTime);

    // Check if there are overlapping sessions for the same weekday and establishment
    const overlappingSessions = await Session.find({
      establishmentId: session.establishmentId,
      weekdays: { $in: req.body.weekdays },
      _id: { $ne: sessionId }, // Exclude the current session
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $gte: startTime, $lt: endTime },
        },
        {
          endTime: { $gt: startTime, $lte: endTime },
        },
      ],
    });

    if (overlappingSessions.length > 0) {
      return res.status(400).json({
        error:
          "A session with overlapping time already exists for this establishment and weekday.",
      });
    }

    // Update the session object with the new values
    session.set({
      ...req.body,
      durationMinutes,
    });

    await session.save();

    // Send a success response with updated session details
    res.status(200).json({
      message: `Your session has been updated for ${durationMinutes} minutes from ${startTime} to ${endTime} for ${
        session.establishmentName
      } on ${req.body.weekdays.join(", ")}`,
      session: session,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Failed to update the session" });
  }
});

router.delete("/:sessionId", (req, res) => {
  const sessionId = req.params.sessionId;

  Session.deleteOne({ _id: sessionId })
    .then((success) => {
      if (success === null) {
        res.status(404).json({ status: 404, message: "User not found" });
      } else {
        res.status(200).json({
          status: 200,
          message: `Successfully deleted user`,
          data: { ...success._doc },
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        status: 500,
        message: "Server error in processing your request",
      });
    });
});
// Function to calculate time duration in minutes
function calculateDuration(startTime, endTime) {
  const diffMilliseconds = endTime - startTime;
  const durationMinutes = Math.floor(diffMilliseconds / (1000 * 60));
  return durationMinutes;
}
function calculateAvailableMinutes(slots, slotDuration) {
  let totalMinutes = 0;
  for (const dateKey in slots) {
    const uniqueSlots = Array.from(new Set(slots[dateKey])); // Remove duplicates
    const slotsInDay = uniqueSlots.length;
    totalMinutes += slotsInDay * slotDuration;
  }

  return totalMinutes;
}
function formatTime(time) {
  return moment(time).format("h:mm A");
}

module.exports = router;
