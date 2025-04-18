const express = require("express");
const router = express.Router();
const db = require("../db.js");

// Get leads for bulk verification
router.get("/", (req, res) => {
  const query = `
    SELECT * FROM leads_database
    WHERE status = 'Pending' OR status = 'Needs-Verification'
    LIMIT 100
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error("Error fetching leads for bulk verification:", err);
      return res.status(500).json({ error: "Failed to fetch leads" });
    }

    res.json(results);
  });
});

// Process bulk verification
router.post("/", async (req, res) => {
  const { options, leads } = req.body;
  console.log('Route hit');

  if (!leads || !Array.isArray(leads) || leads.length === 0) {
    return res.status(400).json({ error: "No leads provided for verification" });
  }

  try {
    const results = {
      total: leads.length,
      processed: 0,
      successful: 0,
      failed: 0,
      emailResults: [],
      phoneResults: [],
      duplicateResults: [],
      dataEnrichmentResults: [],
    };

    // Process each verification type if selected
    if (options.email) {
      await processEmailVerification(leads, results);
    }

    if (options.phone) {
      await processPhoneVerification(leads, results);
    }

    if (options.duplicate) {
      await processDuplicateDetection(leads, results);
    }

    if (options.data) {
      await processDataEnrichment(leads, results);
    }

    // Log verification activity
    await logVerificationActivity(options, results);

    res.json({
      message: "Bulk verification completed",
      results,
    });
  } catch (error) {
    console.error("Bulk verification error:", error);
    res.status(500).json({ error: "Bulk verification failed" });
  }
});

// Process email verification for multiple leads
async function processEmailVerification(leads, results) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  for (const lead of leads) {
    const email = lead.email_id || lead.email;

    if (!email) {
      results.failed++;
      continue;
    }

    try {
      const isValidFormat = emailRegex.test(email);
      const verificationResult = await simulateEmailVerification(email);

      const query = `
        INSERT INTO email_verifications 
        (lead_id, email, status, score, issue, created_at) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `;

      await new Promise((resolve, reject) => {
        db.query(
          query,
          [lead.id, email, verificationResult.status, verificationResult.score, verificationResult.issue || null],
          (err, result) => {
            if (err) {
              console.error("Error storing email verification result:", err);
              reject(err);
              return;
            }

            const updateLeadQuery = `
              UPDATE leads_database 
              SET status = ?, 
                  updated_at = NOW() 
              WHERE id = ?
            `;

            db.query(
              updateLeadQuery,
              [verificationResult.status === "Valid" ? "Verified" : "Invalid-Data", lead.id],
              (updateErr) => {
                if (updateErr) {
                  console.error("Error updating lead status:", updateErr);
                  reject(updateErr);
                  return;
                }

                results.emailResults.push({
                  lead_id: lead.id,
                  email,
                  status: verificationResult.status,
                  score: verificationResult.score,
                  issue: verificationResult.issue || null,
                });

                results.processed++;
                results.successful++;
                resolve();
              },
            );
          },
        );
      });
    } catch (error) {
      console.error(`Email verification error for lead ${lead.id}:`, error);
      results.failed++;
    }
  }
}

// Simulate email verification (in a real app, you'd use an email verification service)
async function simulateEmailVerification(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      status: "Format Issue",
      score: 0,
      issue: "Invalid email format",
    };
  }

  const disposableDomains = ["tempmail.com", "fakeemail.com", "throwaway.com"];
  const domain = email.split("@")[1];

  if (disposableDomains.includes(domain)) {
    return {
      status: "Undeliverable",
      score: 30,
      issue: "Disposable email domain",
    };
  }

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

// Process phone verification for multiple leads
async function processPhoneVerification(leads, results) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;

  for (const lead of leads) {
    const phone = lead.contact_number || lead.phone;

    if (!phone) {
      results.failed++;
      continue;
    }

    try {
      const isValidFormat = phoneRegex.test(phone.replace(/\D/g, ""));
      const status = isValidFormat ? (Math.random() < 0.8 ? "Valid" : "Invalid") : "Format Issue";
      const issue = status === "Valid" ? null : status === "Invalid" ? "Number not in service" : "Invalid format";

      results.phoneResults.push({
        lead_id: lead.id,
        phone,
        status,
        issue,
      });

      results.processed++;
      results.successful++;
    } catch (error) {
      console.error(`Phone verification error for lead ${lead.id}:`, error);
      results.failed++;
    }
  }
}

// Process duplicate detection for multiple leads
async function processDuplicateDetection(leads, results) {
  const allLeads = await new Promise((resolve, reject) => {
    db.query("SELECT * FROM leads_database", (err, results) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(results);
    });
  });

  for (const lead of leads) {
    try {
      const duplicates = allLeads.filter((otherLead) => {
        if (otherLead.id === lead.id) return false;

        const emailMatch = lead.email_id && otherLead.email_id && lead.email_id.toLowerCase() === otherLead.email_id.toLowerCase();
        const phoneMatch = lead.contact_number && otherLead.contact_number && lead.contact_number.replace(/\D/g, "") === otherLead.contact_number.replace(/\D/g, "");
        const nameMatch = lead.name_of_lead && otherLead.name_of_lead && (
          lead.name_of_lead.toLowerCase() === otherLead.name_of_lead.toLowerCase() ||
          lead.name_of_lead.toLowerCase().includes(otherLead.name_of_lead.toLowerCase()) ||
          otherLead.name_of_lead.toLowerCase().includes(lead.name_of_lead.toLowerCase())
        );

        return emailMatch || phoneMatch || nameMatch;
      });

      if (duplicates.length > 0) {
        results.duplicateResults.push({
          lead_id: lead.id,
          duplicates: duplicates.map((d) => ({ id: d.id, name: d.name_of_lead, email: d.email_id })),
          count: duplicates.length,
        });
      }

      results.processed++;
      results.successful++;
    } catch (error) {
      console.error(`Duplicate detection error for lead ${lead.id}:`, error);
      results.failed++;
    }
  }
}

// Process data enrichment for multiple leads
async function processDataEnrichment(leads, results) {
  for (const lead of leads) {
    try {
      const enrichedData = {};
      let enrichmentCount = 0;

      if (!lead.company_name) {
        const email = lead.email_id || lead.email;
        if (email && email.includes("@")) {
          const domain = email.split("@")[1];
          if (!domain.includes("gmail.com") && !domain.includes("yahoo.com") && !domain.includes("hotmail.com")) {
            enrichedData.company_name = domain.split(".")[0].charAt(0).toUpperCase() + domain.split(".")[0].slice(1);
            enrichmentCount++;
          }
        }
      }

      if (!lead.job_title) {
        enrichedData.job_title = "Manager";
        enrichmentCount++;
      }

      if (!lead.industry) {
        enrichedData.industry = "Technology";
        enrichmentCount++;
      }

      if (enrichmentCount > 0) {
        const updateFields = Object.keys(enrichedData)
          .map((key) => `${key} = '${enrichedData[key]}'`)
          .join(", ");

        const updateQuery = `
          UPDATE leads_database 
          SET ${updateFields}, updated_at = NOW() 
          WHERE id = ?
        `;

        await new Promise((resolve, reject) => {
          db.query(updateQuery, [lead.id], (err) => {
            if (err) {
              console.error("Error updating lead with enriched data:", err);
              reject(err);
              return;
            }
            resolve();
          });
        });

        results.dataEnrichmentResults.push({
          lead_id: lead.id,
          enriched_fields: Object.keys(enrichedData),
          count: enrichmentCount,
        });
      }

      results.processed++;
      results.successful++;
    } catch (error) {
      console.error(`Data enrichment error for lead ${lead.id}:`, error);
      results.failed++;
    }
  }
}

// Log verification activity
async function logVerificationActivity(options, results) {
  const activityTypes = [];

  if (options.email) activityTypes.push("Email Verification");
  if (options.phone) activityTypes.push("Phone Verification");
  if (options.duplicate) activityTypes.push("Duplicate Detection");
  if (options.data) activityTypes.push("Data Enrichment");

  const activityType = activityTypes.join(", ");
  const description = `Processed ${results.total} leads: ${results.successful} successful, ${results.failed} failed`;

  const query = `
    INSERT INTO verification_activities 
    (activity_type, description, leads_processed, created_at) 
    VALUES (?, ?, ?, NOW())
  `;

  return new Promise((resolve, reject) => {
    db.query(query, [activityType, description, results.total], (err) => {
      if (err) {
        console.error("Error logging verification activity:", err);
        reject(err);
        return;
      }
      resolve();
    });
  });
}

module.exports = router;
