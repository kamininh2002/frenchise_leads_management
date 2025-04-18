const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./db.js"); // ✅ Your DB connection

dotenv.config(); // ✅ Loads environment variables

// ✅ Imports routes
const leadsRoutes = require("./routes/LeadsmanagementBA");
const dataCleaningRoutes = require("./routes/datacleaningBA");
const uploadLeadsRouter = require('./routes/uploadLeadsBA');
const bulkVerificationRouter = require("./routes/bulkverificationBA");
const emailVerificationsRouter = require("./routes/emailVerificationsBA.js");
const promotionRoutes = require('./routes/promotionBA');



const app = express();

// ✅ Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("uploads")); // ✅ Serves static uploads (if any)

// ✅ Route mappings
app.use("/api", leadsRoutes);                // e.g., /api/leads/all
app.use("/api/leads", uploadLeadsRouter);    // e.g., /api/leads/upload
app.use("/api/bulk-verification", bulkVerificationRouter); // e.g., /api/bulk-verification
app.use("/api/cleaning", dataCleaningRoutes);
app.use("/api/email-verifications", emailVerificationsRouter);
app.use("/api",promotionRoutes);


// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 Franchise Leads Management API is Running!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

module.exports = app;
