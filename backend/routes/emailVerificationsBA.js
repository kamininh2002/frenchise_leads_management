const express = require("express");
const router = express.Router();
const db = require("../db.js");

// Email verification regex pattern
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Simulate email verification
 * In a production environment, you would use a real email verification service
 * like Mailgun, SendGrid, or a dedicated email verification API
 */
async function simulateEmailVerification(email) {
  if (!emailRegex.test(email)) {
    return {
      status: "Format Issue",
      score: 0,
      issue: "Invalid email format",
    };
  }

  const disposableDomains = ["tempmail.com", "fakeemail.com", "throwaway.com", "mailinator.com", "yopmail.com"];
  const domain = email.split("@")[1];

  if (disposableDomains.includes(domain)) {
    return {
      status: "Undeliverable",
      score: 30,
      issue: "Disposable email domain",
    };
  }

  // Check for common typos in popular domains
  const commonDomains = {
    "gmail.com": ["gamil.com", "gmial.com", "gmali.com", "gmal.com", "gmai.com"],
    "yahoo.com": ["yaho.com", "yahooo.com", "yhaoo.com", "yaoo.com"],
    "hotmail.com": ["hotmial.com", "hotmil.com", "hotamail.com", "hotmai.com"],
    "outlook.com": ["outlok.com", "outllok.com", "outook.com", "outluk.com"]
  };

  for (const [correctDomain, typos] of Object.entries(commonDomains)) {
    if (typos.includes(domain)) {
      return {
        status: "Format Issue",
        score: 40,
        issue: `Possible typo in domain. Did you mean ${correctDomain}?`,
      };
    }
  }

  // Simulate some random verification results for demonstration
  const random = Math.random();

  if (random < 0.1) {
    return {
      status: "Undeliverable",
      score: 20,
      issue: "Mailbox not found",
    };
  } else if (random < 0.2) {
    return {
      status: "Format Issue",
      score: 50,
      issue: "Unusual format",
    };
  } else {
    return {
      status: "Valid",
      score: 90,
      issue: null,
    };
  }
}

/**
 * @route   GET /api/email-verifications
 * @desc    Get all email verification results
 * @access  Public
 */
router.get("/", (req, res) => {
  const query = `
    SELECT v.*, l.name_of_lead AS name
    FROM email_verifications v
    LEFT JOIN leads_database l ON v.lead_id = l.id
    ORDER BY v.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch email verifications", details: err.message });
    }
    
    // Format dates for frontend consumption
    const formattedResults = results.map(result => ({
      ...result,
      created_at: new Date(result.created_at).toISOString()
    }));
    
    res.json(formattedResults);
  });
});

/**
 * @route   GET /api/email-verifications/stats
 * @desc    Get email verification statistics
 * @access  Public
 */
router.get("/stats", (req, res) => {
  const query = `
    SELECT status, COUNT(*) AS count
    FROM email_verifications
    GROUP BY status
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch stats", details: err.message });
    }
    res.json(results);
  });
});

/**
 * @route   GET /api/email-verifications/lead/:leadId
 * @desc    Get email verifications for a specific lead
 * @access  Public
 */
router.get("/lead/:leadId", (req, res) => {
  const { leadId } = req.params;
  
  if (!leadId) {
    return res.status(400).json({ error: "Lead ID is required" });
  }
  
  const query = `
    SELECT v.*, l.name_of_lead AS name
    FROM email_verifications v
    LEFT JOIN leads_database l ON v.lead_id = l.id
    WHERE v.lead_id = ?
    ORDER BY v.created_at DESC
  `;
  
  db.query(query, [leadId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to fetch email verifications for lead", details: err.message });
    }
    
    // Format dates for frontend consumption
    const formattedResults = results.map(result => ({
      ...result,
      created_at: new Date(result.created_at).toISOString()
    }));
    
    res.json(formattedResults);
  });
});

/**
 * @route   POST /api/email-verifications
 * @desc    Verify a single email
 * @access  Public
 */
router.post("/", async (req, res) => {
  const { email, leadId, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  if (!leadId) {
    return res.status(400).json({ error: "Lead ID is required" });
  }

  // Check if lead exists
  const checkLeadQuery = "SELECT id, name_of_lead FROM leads_database WHERE id = ?";
  
  db.query(checkLeadQuery, [leadId], async (checkErr, leadResults) => {
    if (checkErr) {
      console.error("Database error checking lead:", checkErr);
      return res.status(500).json({ error: "Failed to check lead", details: checkErr.message });
    }
    
    if (leadResults.length === 0) {
      return res.status(404).json({ error: "Lead not found" });
    }
    
    const leadName = leadResults[0].name_of_lead;
    
    try {
      // Simulate email verification
      const verificationResult = await simulateEmailVerification(email);

      // Store verification result
      const insertQuery = `
        INSERT INTO email_verifications 
        (lead_id, email, status, score, issue, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `;
      
      db.query(insertQuery, [
        leadId, 
        email, 
        verificationResult.status, 
        verificationResult.score, 
        verificationResult.issue || null
      ], (insertErr, result) => {
        if (insertErr) {
          console.error("Error storing email verification result:", insertErr);
          return res.status(500).json({ error: "Failed to store verification result", details: insertErr.message });
        }

        // Log verification activity
        const activityQuery = `
          INSERT INTO verification_activities 
          (activity_type, lead_id, result, details, created_at) 
          VALUES (?, ?, ?, ?, NOW())
        `;
        
        db.query(activityQuery, [
          'email', 
          leadId, 
          verificationResult.status, 
          `Email verification: ${verificationResult.status} (Score: ${verificationResult.score})`
        ], (activityErr) => {
          if (activityErr) {
            console.error("Error logging verification activity:", activityErr);
            // Continue even if activity logging fails
          }
        });

        // Update lead status if verification result is not valid
        if (verificationResult.status !== "Valid") {
          const updateLeadQuery = `
            UPDATE leads_database
            SET status = ?, lead_update_status = 'Updated', notes = CONCAT(IFNULL(notes, ''), '\nEmail verification issue: ', ?)
            WHERE id = ?
          `;
          
          db.query(updateLeadQuery, [
            "Invalid-Data", 
            verificationResult.issue || "Email verification failed", 
            leadId
          ], (updateErr) => {
            if (updateErr) {
              console.error("Error updating lead status:", updateErr);
              // Continue even if lead update fails
            }
          });
        }

        // Return verification result
        res.json({
          id: result.insertId,
          lead_id: leadId,
          name: name || leadName || "Unknown",
          email,
          status: verificationResult.status,
          score: verificationResult.score,
          issue: verificationResult.issue || null,
          created_at: new Date().toISOString(),
        });
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Email verification failed", details: error.message });
    }
  });
});

/**
 * @route   POST /api/email-verifications/bulk
 * @desc    Verify multiple emails at once
 * @access  Public
 */
router.post("/bulk", async (req, res) => {
  const { leads } = req.body;

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ error: "Valid leads array is required" });
  }

  try {
    const results = [];
    const errors = [];

    // Process each lead sequentially
    for (const lead of leads) {
      const { id, email } = lead;
      
      if (!id || !email) {
        errors.push({ lead, error: "Lead ID and email are required" });
        continue;
      }

      try {
        // Simulate email verification
        const verificationResult = await simulateEmailVerification(email);

        // Store verification result
        const insertQuery = `
          INSERT INTO email_verifications 
          (lead_id, email, status, score, issue, created_at) 
          VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        const insertPromise = new Promise((resolve, reject) => {
          db.query(insertQuery, [
            id, 
            email, 
            verificationResult.status, 
            verificationResult.score, 
            verificationResult.issue || null
          ], (err, result) => {
            if (err) {
              reject(err);
              return;
            }
            
            // Update lead status if verification result is not valid
            if (verificationResult.status !== "Valid") {
              const updateLeadQuery = `
                UPDATE leads_database
                SET status = ?, lead_update_status = 'Updated', notes = CONCAT(IFNULL(notes, ''), '\nEmail verification issue: ', ?)
                WHERE id = ?
              `;
              
              db.query(updateLeadQuery, [
                "Invalid-Data", 
                verificationResult.issue || "Email verification failed", 
                id
              ]);
            }
            
            resolve({
              id: result.insertId,
              lead_id: id,
              email,
              status: verificationResult.status,
              score: verificationResult.score,
              issue: verificationResult.issue || null,
              created_at: new Date().toISOString(),
            });
          });
        });

        const result = await insertPromise;
        results.push(result);
      } catch (error) {
        errors.push({ lead, error: error.message });
      }
    }

    // Log bulk verification activity
    const activityQuery = `
      INSERT INTO verification_activities 
      (activity_type, lead_id, result, details, created_at) 
      VALUES (?, NULL, ?, ?, NOW())
    `;
    
    db.query(activityQuery, [
      'bulk_email', 
      `${results.length} successful, ${errors.length} failed`, 
      `Bulk email verification: ${leads.length} leads processed`
    ]);

    res.json({
      success: true,
      processed: leads.length,
      successful: results.length,
      failed: errors.length,
      results,
      errors,
    });
  } catch (error) {
    console.error("Bulk email verification error:", error);
    res.status(500).json({ error: "Bulk email verification failed", details: error.message });
  }
});

/**
 * @route   DELETE /api/email-verifications/:id
 * @desc    Delete an email verification record
 * @access  Public
 */
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ error: "Verification ID is required" });
  }
  
  const query = "DELETE FROM email_verifications WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ error: "Failed to delete verification record", details: err.message });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Verification record not found" });
    }
    
    res.json({ success: true, message: "Verification record deleted successfully" });
  });
});

module.exports = router;