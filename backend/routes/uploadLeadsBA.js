const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const multer = require('multer');
const db = require("../db"); // ✅ Correct import of db.js

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'text/csv') {
      return cb(new Error('Only CSV files are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ✅ Fix: Use db.query() in '/history'
router.get('/history', (req, res) => {
  const query = `
    SELECT 
      file_name as id, 
      DATE_FORMAT(upload_time, '%m/%d/%Y %h:%i %p') as date
      'Success' as status,
      (SELECT COUNT(*) FROM leads_database WHERE id IN 
        (SELECT JSON_EXTRACT(metadata, '$.imported_ids') FROM upload_history WHERE file_name = id)
      ) as records
    FROM upload_history
    ORDER BY upload_time DESC
    LIMIT 20
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching upload history:', err);
      return res.status(500).json({ error: 'Failed to fetch upload history' });
    }

    res.json(results);
  });
});

// ✅ Fix: Ensure correct 'INSERT INTO' syntax in '/upload'
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const leadType = req.body.leadType || 'New'; // Default to 'New'
  const importedIds = [];
  const records = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      records.push({
        name_of_lead: row.name_of_lead || row.name || '',
        city: row.city || '',
        state: row.state || '',
        contact_number: row.contact_number || row.contactNumber || row.phone || '',
        email_id: row.email_id || row.email || '',
        franchise_developer_name: row.franchise_developer_name || row.franchiseDeveloper || '',
        source: row.source || '',
        date_of_campaign: row.date_of_campaign || row.campaignDate || null,
        month: row.month || '',
        financial_year: row.financial_year || row.financialYear || '',
        status: row.status || 'Pending',
        notes: row.notes || '',
        revenue_amount: parseFloat(row.revenue_amount || 0),
        team_leader_assign: row.team_leader_assign || '',
        lead_update_status: row.lead_update_status === 'Updated' ? 'Updated' : 'Not Updated',
        leadType: leadType,
        remark: row.remark || ''
      });
    })
    .on('end', () => {
      if (records.length === 0) {
        return res.status(400).json({ error: 'Empty or invalid CSV file' });
      }
      
      // ✅ Fix: Insert records correctly
      const insertPromises = records.map(record => {
        return new Promise((resolve, reject) => {
          db.query('INSERT INTO leads_database SET ?', record, (err, result) => {
            if (err) {
              reject(err);
            } else {
              importedIds.push(result.insertId);
              resolve(result);
            }
          });
        });
      });

      Promise.all(insertPromises)
        .then(() => {
          const historyRecord = {
            file_name: req.file.originalname,
            file_path: filePath,
            metadata: JSON.stringify({ 
              imported_ids: importedIds,
              lead_type: leadType,
              total_records: records.length
            })
          };

          db.query('INSERT INTO upload_history SET ?', historyRecord, (err) => {
            if (err) {
              console.error('Error recording upload history:', err);
            }
            
            res.json({
              success: true,
              records: records.length,
              message: `Successfully imported ${records.length} records`
            });
          });
        })
        .catch(err => {
          console.error('Error inserting leads:', err);
          res.status(500).json({ error: 'Failed to insert leads data' });
        });
    })
    .on('error', (err) => {
      console.error('Error reading CSV:', err);
      res.status(500).json({ error: 'Failed to process CSV file' });
    });
});

// ✅ Fix: Use db.query() in '/add'
router.post('/add', (req, res) => {
  const leadData = {
    name_of_lead: req.body.name || '',
    city: req.body.city || '',
    state: req.body.state || '',
    contact_number: req.body.contactNumber || '',
    email_id: req.body.email || '',
    franchise_developer_name: req.body.franchiseDeveloper || '',
    source: req.body.source || '',
    date_of_campaign: req.body.campaignDate || null,
    month: req.body.month || '',
    financial_year: req.body.financialYear || '',
    status: req.body.status || 'Pending',
    notes: req.body.notes || '',
    lead_update_status: req.body.isUpdated ? 'Updated' : 'Not Updated',
    leadType: 'New'
  };

  db.query('INSERT INTO leads_database SET ?', leadData, (err, result) => {
    if (err) {
      console.error('Error adding lead:', err);
      return res.status(500).json({ error: 'Failed to add lead data', details: err.sqlMessage });
    }

    res.json({
      success: true,
      id: result.insertId,
      message: 'Lead added successfully'
    });
  });
});

module.exports = router;
