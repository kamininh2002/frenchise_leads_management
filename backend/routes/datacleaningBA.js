const express = require("express")
const router = express.Router()
const db = require("../db.js")

// Get leads for cleaning with optional status filter
router.get("/", (req, res) => {
  const { status } = req.query

  let query = `
    SELECT * FROM leads_database
    WHERE 1=1
  `

  

  // Add status filter if provided
  if (status && status !== "all") {
    const normalizedStatus = status
      .replace(/-/g, " ")         // "needs-verification" → "needs verification"
      .replace(/\b\w/g, (c) => c.toUpperCase()) // "needs verification" → "Needs Verification"
    query += ` AND status = '${normalizedStatus}'`
  }
  

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching leads for cleaning:", err)
      return res.status(500).json({ error: "Failed to fetch leads" })
    }

    res.json(results)
  })
})

// Update lead cleaning status
router.put("/:id", (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status) {
    return res.status(400).json({ error: "Status is required" })
  }

  const query = `
    UPDATE leads_database
    SET status = ?, 
        updated_at = NOW() 
    WHERE id = ?
  `

  db.query(query, [status, id], (err, result) => {
    if (err) {
      console.error("Error updating lead status:", err)
      return res.status(500).json({ error: "Failed to update lead status" })
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Lead not found" })
    }

    res.json({ message: "Lead status updated successfully", id })
  })
})

// Get lead by ID
router.get("/:id", (req, res) => {
  const { id } = req.params

  const query = "SELECT * FROM leads_database WHERE id = ?"

  db.query(query, [id], (err, results) => {
    if (err) {
      console.error("Error fetching lead:", err)
      return res.status(500).json({ error: "Failed to fetch lead" })
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Lead not found" })
    }

    res.json(results[0])
  })
})

module.exports = router
