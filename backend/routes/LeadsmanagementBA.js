const express = require("express");
const router = express.Router();
const db = require("../db");

// ✅ Get all leads OR search leads by name/email/contact with update status filter
router.get("/leads", (req, res) => {
  const { search, location , leadType, leadsUpdateStatus,source } = req.query;
  let sql = "SELECT * FROM leads_database WHERE 1=1";
  let params = [];

  // Search filter (matches name, email, or contact number)
  if (search) {
    sql += " AND (name_of_lead LIKE ? OR email_id LIKE ? OR contact_number LIKE ?)";
    const searchQuery = `%${search}%`;
    params.push(searchQuery, searchQuery, searchQuery);
  }

  // Lead Update Status filter
  if (leadsUpdateStatus) {
    sql += " AND lead_update_status = ?";
    params.push(leadsUpdateStatus);
  }

  // Lead Type filter
  if (leadType) {
    sql += " AND lead_type = ?";
    params.push(leadType);
  }

  // Lead Source filter
  if (source) {
    sql += " AND source = ?";
    params.push(source);
  }

  // Location filter (checks city or state)
  if (location) {
    sql += " AND (city LIKE ? OR state LIKE ?)";
    const locationQuery = `%${location}%`;
    params.push(locationQuery, locationQuery);
  }

  
  sql += " ORDER BY id DESC";

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Error fetching leads:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// ✅ Get lead details by ID
router.get("/leads/:id", (req, res) => {
  const leadId = req.params.id;
  const sql = "SELECT * FROM leads_database WHERE id = ?";
  
  db.query(sql, [leadId], (err, results) => {
    if (err) {
      console.error("Error fetching lead details:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    res.json(results[0]);
  });
});

// ✅ Filter leads by status
router.get("/leads/filtered", (req, res) => {
  const { status } = req.query;

  if (!status) {
    return res.status(400).json({ error: "Status parameter is required" });
  }

  const sql = "SELECT * FROM leads_database WHERE status = ?";
  
  db.query(sql, [status], (err, results) => {
    if (err) {
      console.error("Error fetching filtered leads:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// ✅ Filter leads by lead type
router.get("/leads/type", (req, res) => {
  const { leadType } = req.query;

  if (!leadType) {
    return res.status(400).json({ error: "Lead type parameter is required" });
  }

  const sql = "SELECT * FROM leads_database WHERE leadType = ?";
  
  db.query(sql, [leadType], (err, results) => {
    if (err) {
      console.error("Error fetching leads by type:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});

// ✅ Add new lead
router.post("/leads", (req, res) => {
  const {
    name_of_lead, city, state, contact_number, email_id,
    franchise_developer_name, source, date_of_campaign, month,
    financial_year, status, notes, revenue_amount,
    team_leader_assign, lead_update_status, leadType, remark
  } = req.body;

  const sql = `INSERT INTO leads_database 
    (name_of_lead, city, state, contact_number, email_id, 
    franchise_developer_name, source, date_of_campaign, month, 
    financial_year, status, notes, revenue_amount, 
    team_leader_assign, lead_update_status, leadType, remark)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    name_of_lead, city, state, contact_number, email_id,
    franchise_developer_name, source, date_of_campaign, month,
    financial_year, status, notes, revenue_amount,
    team_leader_assign, lead_update_status, leadType, remark
  ];

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error inserting lead:", err);
      return res.status(500).json({ error: "Database insert error" });
    }
    res.json({ message: "✅ Lead added successfully", id: result.insertId });
  });
});

// ✅ Update lead - Enhanced to update all fields
router.put("/leads/:id", (req, res) => {
  const leadId = req.params.id;
  const {
    name_of_lead, city, state, contact_number, email_id,
    franchise_developer_name, source, date_of_campaign, month,
    financial_year, status, notes, revenue_amount,
    team_leader_assign, lead_update_status, leadType, remark
  } = req.body;

  const sql = `UPDATE leads_database 
    SET 
      name_of_lead = ?,
      city = ?,
      state = ?,
      contact_number = ?,
      email_id = ?,
      franchise_developer_name = ?,
      source = ?,
      date_of_campaign = ?,
      month = ?,
      financial_year = ?,
      status = ?,
      notes = ?,
      revenue_amount = ?,
      team_leader_assign = ?,
      lead_update_status = ?,
      leadType = ?,
      remark = ?
    WHERE id = ?`;

  const values = [
    name_of_lead, city, state, contact_number, email_id,
    franchise_developer_name, source, date_of_campaign, month,
    financial_year, status, notes, revenue_amount,
    team_leader_assign, lead_update_status, leadType, remark,
    leadId
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error("Error updating lead:", err);
      return res.status(500).json({ error: "Database update error" });
    }
    res.json({ message: "✅ Lead updated successfully" });
  });
});




// ✅ Delete lead
router.delete("/leads/:id", (req, res) => {
  const leadId = req.params.id;
  const sql = "DELETE FROM leads_database WHERE id = ?";

  db.query(sql, [leadId], (err) => {
    if (err) {
      console.error("Error deleting lead:", err);
      return res.status(500).json({ error: "Database delete error" });
    }
    res.json({ message: "✅ Lead deleted successfully" });
  });
});

// ✅ Count leads
router.get("/leads/count", (req, res) => {
  const sql = "SELECT COUNT(*) AS totalLeads FROM leads_database";
  
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error fetching lead count:", err);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(result[0]);
  });
});

module.exports = router;