// // app.js - Main application file
// const express = require('express');
// const mysql = require('mysql2/promise');
// const cors = require('cors');
// const bodyParser = require('body-parser');
// // const path = require('path');
// const multer = require('multer');
// const csv = require('csv-parser');
// const fs = require('fs');

// const app = express();
// const PORT = process.env.PORT || 3000;

// // Middleware
// app.use(cors());
// app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));

// // File upload configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ storage });

// // Routes

// // Get lead summary counts
// app.get('/api/lead-summary', async (req, res) => {
//   try {
//     const connection = await pool.getConnection();
    
//     const [newLeads] = await connection.query(
//       "SELECT COUNT(*) as count FROM leads_database WHERE leadType = 'New' AND DATE(date_of_campaign) >= DATE_SUB(NOW(), INTERVAL 1 WEEK)"
//     );
    
//     const [existingLeads] = await connection.query(
//       "SELECT COUNT(*) as count FROM leads_database WHERE leadType = 'Existing'"
//     );
    
//     const [prospects] = await connection.query(
//       "SELECT COUNT(*) as count FROM leads_database WHERE leadType = 'Prospective'"
//     );
    
//     const [pending] = await connection.query(
//       "SELECT COUNT(*) as count FROM leads_database WHERE status = 'Pending' AND lead_update_status = 'Not Updated'"
//     );
    
//     connection.release();
    
//     res.json({
//       new: newLeads[0].count,
//       existing: existingLeads[0].count,
//       prospects: prospects[0].count,
//       pending: pending[0].count
//     });
//   } catch (error) {
//     console.error('Error fetching lead summary:', error);
//     res.status(500).json({ error: 'Failed to fetch lead summary' });
//   }
// });

// // Get pending follow-ups
// app.get('/api/pending-followups', async (req, res) => {
//   try {
//     const connection = await pool.getConnection();
    
//     const [followups] = await connection.query(
//       `SELECT id, name_of_lead, city, state, contact_number, email_id, 
//        franchise_developer_name, status, date_of_campaign, leadType
//        FROM leads_database
//        WHERE status = 'Pending' OR lead_update_status = 'Not Updated'
//        ORDER BY date_of_campaign DESC
//        LIMIT 10`
//     );
    
//     connection.release();
    
//     res.json(followups);
//   } catch (error) {
//     console.error('Error fetching pending follow-ups:', error);
//     res.status(500).json({ error: 'Failed to fetch pending follow-ups' });
//   }
// });

// // Upload leads via CSV
// app.post('/api/upload-leads', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }
    
//     const results = [];
//     const connection = await pool.getConnection();
    
//     fs.createReadStream(req.file.path)
//       .pipe(csv())
//       .on('data', (data) => results.push(data))
//       .on('end', async () => {
//         try {
//           let successCount = 0;
          
//           for (const row of results) {
//             // Format date properly if it exists
//             let campaignDate = null;
//             if (row.date_of_campaign) {
//               campaignDate = new Date(row.date_of_campaign);
//               // Check if date is valid
//               if (isNaN(campaignDate.getTime())) {
//                 campaignDate = new Date(); // Default to today if invalid
//               }
//             } else {
//               campaignDate = new Date(); // Default to today if missing
//             }
            
//             const formattedDate = campaignDate.toISOString().split('T')[0];
//             const currentMonth = campaignDate.toLocaleString('default', { month: 'long' });
//             const financialYear = campaignDate.getMonth() >= 3 ? 
//                                   campaignDate.getFullYear() : 
//                                   campaignDate.getFullYear() - 1;
            
//             await connection.query(
//               `INSERT INTO leads_database (
//                 name_of_lead, city, state, contact_number, email_id, 
//                 franchise_developer_name, source, date_of_campaign, 
//                 month, financial_year, status, notes, revenue_amount, 
//                 team_leader_assign, lead_update_status, leadType, remark
//               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
//               [
//                 row.name_of_lead || row.name || '',
//                 row.city || '',
//                 row.state || '',
//                 row.contact_number || row.phone || '',
//                 row.email_id || row.email || '',
//                 row.franchise_developer_name || '',
//                 row.source || 'CSV Import',
//                 formattedDate,
//                 row.month || currentMonth,
//                 row.financial_year || `${financialYear}-${financialYear + 1}`,
//                 row.status || 'New',
//                 row.notes || 'Imported via CSV',
//                 row.revenue_amount || 0.00,
//                 row.team_leader_assign || '',
//                 row.lead_update_status || 'Not Updated',
//                 row.leadType || 'New',
//                 row.remark || ''
//               ]
//             );
//             successCount++;
//           }
          
//           connection.release();
//           fs.unlinkSync(req.file.path); // Clean up uploaded file
          
//           res.json({ success: true, message: `Successfully imported ${successCount} leads` });
//         } catch (err) {
//           connection.release();
//           console.error('Error processing CSV:', err);
//           res.status(500).json({ error: 'Error processing CSV file' });
//         }
//       });
//   } catch (error) {
//     console.error('Error uploading leads:', error);
//     res.status(500).json({ error: 'Failed to upload leads' });
//   }
// });

// // Clean data (fix email/phone errors)
// app.post('/api/clean-data', async (req, res) => {
//   try {
//     const connection = await pool.getConnection();
    
//     // Fix emails without @ symbol
//     await connection.query(
//       `UPDATE leads_database SET email_id = CONCAT(SUBSTRING_INDEX(email_id, '.', 1), '@example.com')
//        WHERE email_id NOT LIKE '%@%' AND email_id LIKE '%.%' AND email_id != ''`
//     );
    
//     // Standardize phone numbers (ensure they start with proper country code)
//     await connection.query(
//       `UPDATE leads_database SET contact_number = CONCAT('91-', REGEXP_REPLACE(contact_number, '^91-|[^0-9]', ''))
//        WHERE contact_number NOT LIKE '91-%' AND contact_number != ''`
//     );
    
//     // Remove duplicate leads based on email_id
//     await connection.query(
//       `DELETE l1 FROM leads_database l1
//        INNER JOIN leads_database l2 
//        WHERE l1.id > l2.id AND l1.email_id = l2.email_id 
//        AND l1.email_id != '' AND l2.email_id != ''`
//     );
    
//     connection.release();
    
//     res.json({ success: true, message: 'Data cleaning completed successfully' });
//   } catch (error) {
//     console.error('Error cleaning data:', error);
//     res.status(500).json({ error: 'Failed to clean data' });
//   }
// });

// // Categorize leads by type
// app.post('/api/categorize', async (req, res) => {
//   try {
//     const { leadIds, leadType } = req.body;
    
//     if (!leadIds || !leadIds.length || !leadType) {
//       return res.status(400).json({ error: 'Lead IDs and lead type are required' });
//     }
    
//     const connection = await pool.getConnection();
    
//     await connection.query(
//       `UPDATE leads_database SET leadType = ? WHERE id IN (?)`,
//       [leadType, leadIds]
//     );
    
//     connection.release();
    
//     res.json({ success: true, message: `Successfully categorized ${leadIds.length} leads` });
//   } catch (error) {
//     console.error('Error categorizing leads:', error);
//     res.status(500).json({ error: 'Failed to categorize leads' });
//   }
// });

// // Filter leads by criteria
// app.get('/api/filter-leads', async (req, res) => {
//   try {
//     const { status, leadType, city, state, source, fromDate, toDate, developer } = req.query;
//     let query = 'SELECT * FROM leads_database WHERE 1=1';
//     const params = [];
    
//     if (status) {
//       query += ' AND status = ?';
//       params.push(status);
//     }
    
//     if (leadType) {
//       query += ' AND leadType = ?';
//       params.push(leadType);
//     }
    
//     if (city) {
//       query += ' AND city LIKE ?';
//       params.push(`%${city}%`);
//     }
    
//     if (state) {
//       query += ' AND state LIKE ?';
//       params.push(`%${state}%`);
//     }
    
//     if (source) {
//       query += ' AND source = ?';
//       params.push(source);
//     }
    
//     if (developer) {
//       query += ' AND franchise_developer_name LIKE ?';
//       params.push(`%${developer}%`);
//     }
    
//     if (fromDate) {
//       query += ' AND date_of_campaign >= ?';
//       params.push(fromDate);
//     }
    
//     if (toDate) {
//       query += ' AND date_of_campaign <= ?';
//       params.push(toDate);
//     }
    
//     const connection = await pool.getConnection();
//     const [results] = await connection.query(query, params);
//     connection.release();
    
//     res.json(results);
//   } catch (error) {
//     console.error('Error filtering leads:', error);
//     res.status(500).json({ error: 'Failed to filter leads' });
//   }
// });

// // Schedule follow-up
// app.post('/api/schedule-followup', async (req, res) => {
//   try {
//     const { leadId, status, notes, updateStatus } = req.body;
    
//     if (!leadId || !status) {
//       return res.status(400).json({ error: 'Lead ID and status are required' });
//     }
    
//     const connection = await pool.getConnection();
    
//     await connection.query(
//       `UPDATE leads_database SET 
//        status = ?, 
//        notes = CONCAT(IFNULL(notes, ''), '\n', ?),
//        lead_update_status = ?
//        WHERE id = ?`,
//       [status, notes || `Status updated to ${status}`, updateStatus || 'Updated', leadId]
//     );
    
//     connection.release();
    
//     res.json({ success: true, message: 'Follow-up scheduled successfully' });
//   } catch (error) {
//     console.error('Error scheduling follow-up:', error);
//     res.status(500).json({ error: 'Failed to schedule follow-up' });
//   }
// });

// // Update lead status
// app.post('/api/update-status', async (req, res) => {
//   try {
//     const { leadId, status, notes, revenue } = req.body;
    
//     if (!leadId || !status) {
//       return res.status(400).json({ error: 'Lead ID and status are required' });
//     }
    
//     const connection = await pool.getConnection();
    
//     let query = `UPDATE leads_database SET 
//                 status = ?, 
//                 lead_update_status = 'Updated',
//                 notes = CONCAT(IFNULL(notes, ''), '\n', ?)`;
    
//     const params = [status, notes || `Status updated to ${status}`];
    
//     if (revenue !== undefined) {
//       query += `, revenue_amount = ?`;
//       params.push(parseFloat(revenue) || 0.00);
//     }
    
//     query += ` WHERE id = ?`;
//     params.push(leadId);
    
//     await connection.query(query, params);
    
//     connection.release();
    
//     res.json({ success: true, message: 'Status updated successfully' });
//   } catch (error) {
//     console.error('Error updating status:', error);
//     res.status(500).json({ error: 'Failed to update status' });
//   }
// });

// // Get analytics data
// app.get('/api/analytics', async (req, res) => {
//   try {
//     const connection = await pool.getConnection();
    
//     // Conversion metrics
//     const [conversions] = await connection.query(
//       `SELECT 
//          month, 
//          COUNT(*) as total_leads,
//          SUM(IF(leadType = 'Existing', 1, 0)) as conversions,
//          ROUND((SUM(IF(leadType = 'Existing', 1, 0)) / COUNT(*)) * 100, 2) as conversion_rate,
//          SUM(revenue_amount) as total_revenue
//        FROM leads_database
//        GROUP BY month
//        ORDER BY STR_TO_DATE(CONCAT('1 ', month), '%d %M')`
//     );
    
//     // Lead sources
//     const [sources] = await connection.query(
//       `SELECT 
//          source,
//          COUNT(*) as count,
//          SUM(revenue_amount) as revenue
//        FROM leads_database
//        GROUP BY source
//        ORDER BY count DESC`
//     );
    
//     // Franchisee performance
//     const [franchisees] = await connection.query(
//       `SELECT 
//          franchise_developer_name,
//          COUNT(*) as total_leads,
//          SUM(IF(leadType = 'Existing', 1, 0)) as conversions,
//          SUM(revenue_amount) as revenue
//        FROM leads_database
//        WHERE franchise_developer_name != ''
//        GROUP BY franchise_developer_name
//        ORDER BY revenue DESC`
//     );
    
//     // Team leader performance
//     const [teamLeaders] = await connection.query(
//       `SELECT 
//          team_leader_assign,
//          COUNT(*) as total_leads,
//          SUM(IF(leadType = 'Existing', 1, 0)) as conversions,
//          SUM(revenue_amount) as revenue
//        FROM leads_database
//        WHERE team_leader_assign != ''
//        GROUP BY team_leader_assign
//        ORDER BY revenue DESC`
//     );
    
//     connection.release();
    
//     res.json({
//       conversions,
//       sources,
//       franchisees,
//       teamLeaders
//     });
//   } catch (error) {
//     console.error('Error fetching analytics:', error);
//     res.status(500).json({ error: 'Failed to fetch analytics' });
//   }
// });

// // Export reports
// app.get('/api/export', async (req, res) => {
//   try {
//     const { format, fromDate, toDate, status, leadType } = req.query;
    
//     if (!format) {
//       return res.status(400).json({ error: 'Export format is required' });
//     }
    
//     let query = `SELECT * FROM leads_database WHERE 1=1`;
//     const params = [];
    
//     if (fromDate) {
//       query += ' AND date_of_campaign >= ?';
//       params.push(fromDate);
//     }
    
//     if (toDate) {
//       query += ' AND date_of_campaign <= ?';
//       params.push(toDate);
//     }
    
//     if (status) {
//       query += ' AND status = ?';
//       params.push(status);
//     }
    
//     if (leadType) {
//       query += ' AND leadType = ?';
//       params.push(leadType);
//     }
    
//     const connection = await pool.getConnection();
//     const [results] = await connection.query(query, params);
//     connection.release();
    
//     if (format === 'json') {
//       res.json(results);
//     } else if (format === 'csv') {
//       // For CSV format
//       let csv = 'ID,Name,City,State,Contact Number,Email,Developer,Source,Campaign Date,Status,Revenue,Team Leader,Lead Type\n';
      
//       results.forEach(row => {
//         csv += `${row.id},"${row.name_of_lead}","${row.city}","${row.state}","${row.contact_number}","${row.email_id}","${row.franchise_developer_name}","${row.source}","${row.date_of_campaign}","${row.status}",${row.revenue_amount},"${row.team_leader_assign}","${row.leadType}"\n`;
//       });
      
//       res.setHeader('Content-Type', 'text/csv');
//       res.setHeader('Content-Disposition', 'attachment; filename=leads_export.csv');
//       res.send(csv);
//     } else if (format === 'excel') {
//       // This is a simplified version - in production, you'd use a library like exceljs
//       res.json({ error: 'Excel export requires additional libraries' });
//     }
//   } catch (error) {
//     console.error('Error exporting data:', error);
//     res.status(500).json({ error: 'Failed to export data' });
//   }
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });