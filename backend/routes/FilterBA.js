const express = require("express");
const cors = require("cors");
const db = require("../db"); // Import database connection

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/leads", (req, res) => {
  let query = "SELECT * FROM leads WHERE 1=1";
  const filters = [];

  if (req.query.hotLeads === "true") query += " AND lead_status = 'hot'";
  if (req.query.warmLeads === "true") query += " AND lead_status = 'warm'";
  if (req.query.investmentRange) {
    query += " AND investment_range = ?";
    filters.push(req.query.investmentRange);
  }
  if (req.query.location) {
    query += " AND location = ?";
    filters.push(req.query.location);
  }
  if (req.query.lastContacted) {
    query += " AND last_contacted = ?";
    filters.push(req.query.lastContacted);
  }
  if (req.query.followUpStatus) {
    query += " AND follow_up_status = ?";
    filters.push(req.query.followUpStatus);
  }
  if (req.query.updatedData === "true") query += " AND updated_data = 1";

  db.query(query, filters, (err, results) => {
    if (err) {
      console.error("Error fetching leads:", err);
      return res.status(500).send("Server Error");
    }
    res.json(results);
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
