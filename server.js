require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const socketIO = require("socket.io");
const multer = require("multer");
const mongoose = require("mongoose");
const app = express();
const port = process.env.PORT || 200;

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (e) => {
    if (!e) {
      console.log("\x1b[36m", "Db connection successful", "\x1b[0m");
    } else {
      console.log(e, "\x1b[36m", "Db connection unsuccessful", "\x1b[0m");
    }
  }
);

app.use(express.json({ extended: false }));
// app.use(cors());
app.use(
  cors({
    origin: "*",
  })
);
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");

  res.setHeader(
    "Access-Control-Allow-Method",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  next();
});

const httpServer = http.createServer(app);
const io = socketIO(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  // console.log(`User ${socket.id} has connected`);
  socket.on("user-connect", (user) => {
    socket.join(user?._id);
    console.log(`User ${user?._id} has joined the chat`);
  });
  socket.on("try", (param) => {
    console.log("try=> ", param);
  });
  socket.on("usermsg", (message) => {
    console.log("msg=> ", message);
    io.to(message?.receiver?._id).emit("new-message", message);
    console.log("Broadcasted new-message to room:", message?.receiver?._id);
  });
  socket.on("disconnect", () => {});
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader(
    "Access-Control-Allow-Method",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  next();
});
const jwt = require("jsonwebtoken");

app.use((req, res, next) => {
  console.log(
    req.headers["x-origin"] == "http://localhost:3000" ||
      req.headers["x-origin"] == "http://localhost:3001" ||
      req.headers["x-origin"] == "https://www.staging.psymate.org" ||
      req.headers["x-origin"] == "https://www.psymate.org",
    req.path
  );
  if (
    req.path.startsWith("/login") ||
    req.path === "/lead" ||
    req.path === "/login/register" ||
    req.path === "/login/resend-otp" ||
    req.path === "/login/email" ||
    req.path === "/file/upload" ||
    req.path === "/call/users" ||
    req.path === "/call/sms" ||
    req.path === "/call/callDetails" ||
    req.headers["origin"] == "http://localhost:3000" ||
    req.headers["origin"] == "https://www.psymate.org" ||
    req.headers["origin"] == "https://www.finmate.org" ||
    req.headers["x-origin"] == "http://localhost:3001" ||
    req.headers["x-origin"] == "https://www.staging.psymate.org" ||
    req.headers["x-origin"] == "https://www.psymate.org" ||
    req.headers["x-origin"] == "https://www.karmamate.org"
  ) {
    return next();
  }

  const authorizationHeader = req.headers["authorization"];
  if (!authorizationHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }

  const token = authorizationHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token is missing" });
  }

  jwt.verify(token, "f6kvXh2sDPVCAWaT0TxPvJK3QwcCUzPy", (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: "Token is invalid" });
    }

    req.userId = decoded.userId;
    next();
  });
});

// route included
app.use("/chat", require("./routes/chat/chat.js"));

app.use("/project", require("./routes/project/project.js"));
app.use("/task", require("./routes/task/task.js"));
app.use("/payment", require("./routes/payment"));
app.use("/sendSMS", require("./routes/sendSMS"));
app.use("/email", require("./routes/emailHandler"));
app.use("/", require("./routes/client/user"));
app.use("/lead", require("./routes/client/lead"));
app.use("/user/likes", require("./routes/siteSettings/Likes"));
app.use("/user/addresses", require("./routes/siteSettings/Address"));
app.use("/user/education", require("./routes/siteSettings/user/Education"));
app.use("/shiprocket/order", require("./shiprocket/order"));
app.use("/clinical_data", require("./routes/clinc/clinical_data/index"));
app.use("/coupon", require("./routes/coupon/index"));
app.use("/login", require("./routes/login/login"));
app.use("/hr", require("./routes/hr/hr.js"));
app.use("/transactions", require("./routes/transactions"));
app.use("/assessments", require("./routes/assessment"));
app.use("/article", require("./routes/article/article"));
app.use("/feed", require("./routes/feed/feed"));
app.use("/forms", require("./routes/form/formData"));
app.use("/api/tools", require("./routes/form/newForms"));
app.use("/offers", require("./routes/siteSettings/Offers"));
app.use("/jobs", require("./routes/siteSettings/jobs"));
app.use("/videos", require("./routes/siteSettings/Videos"));
app.use("/podcast", require("./routes/siteSettings/podcast.js"));
app.use("/courses", require("./routes/siteSettings/Courses"));
app.use("/wellnessPrograms", require("./routes/siteSettings/wellnessPrograms"));
app.use("/verticles", require("./routes/siteSettings/verticles"));
app.use("/status", require("./routes/siteSettings/status"));
app.use("/disorderpage", require("./routes/siteSettings/disorderpage"));
app.use("/appointment", require("./routes/siteSettings/Appointment"));
app.use("/cart", require("./routes/siteSettings/cart"));
app.use("/permissions", require("./routes/roles/permissions"));
app.use("/invoice", require("./routes/siteSettings/invoice"));
app.use("/data", require("./routes/siteSettings/Settings"));
app.use("/orders", require("./routes/siteSettings/orders"));
app.use("/item", require("./routes/ecommerce/Item"));
app.use("/salt", require("./routes/ecommerce/salt"));
app.use("/prescriptions", require("./routes/siteSettings/prescriptions"));
app.use("/timeline", require("./routes/siteSettings/timeline"));
app.use("/ProvisionalCodes", require("./routes/siteSettings/ProvisionalCodes"));
app.use("/call", require("./routes/call"));
app.use("/getMetaTags", require("./routes/metaTags"));
app.use("/blogs", require("./routes/siteSettings/blogs"));
app.use("/specifier", require("./routes/history/symptom/common/specifiers"));
app.use("/symptoms", require("./routes/history/symptom/common/symptoms"));
app.use("/learnerStories", require("./routes/siteSettings/LearnerStories"));
app.use("/establishment", require("./routes/siteSettings/Establishments"));
app.use(
  "/appointmentTemplates",
  require("./routes/siteSettings/AppointmentTemplates")
);
app.use(
  "/academyCategories",
  require("./routes/siteSettings/AcademyCategories")
);
app.use("/testimonials", require("./routes/siteSettings/Testimonials"));
app.use("/establishment", require("./routes/siteSettings/Establishments"));
app.use("/recognize", require("./routes/siteSettings/Recognize"));
app.use("/faq", require("./routes/siteSettings/FAQ"));
app.use("/roles", require("./routes/roles/roles"));
app.use("/medicine", require("./routes/pharmacy/medicine"));
app.use("/templates", require("./routes/siteSettings/templates"));
app.use("/pharmacy", require("./routes/pharmacy/category"));
app.use("/zoho", require("./routes/zoho"));
app.use("/file", require("./routes/file"));
app.use("/sessions", require("./routes/appointment/doctor/sessions"));
app.use("/booking/appointment", require("./routes/appointment/booking"));
app.use(
  "/booking/appointment/check",
  require("./routes/appointment/booking/status/doctorCheckIn")
);
app.use("/pharmacycart", require("./routes/pharmacy/cart"));
// Add new API's
app.use("/comments", require("./routes/comments/comments"));
app.use("/combo", require("./routes/combo/combo"));

app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        message: "file is too large",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        message: "File limit reached",
      });
    }

    if (error.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        message: "File must be an image",
      });
    }
  }
});

app.get("/", (req, res) => {
  res.send("Server running!");
});

httpServer.listen(port, () => console.log(`server started on port ${port}`));
