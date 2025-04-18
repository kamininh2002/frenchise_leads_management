const express = require('express');
const router = express.Router();
const db = require("../db");

// Initialize database connection
// Note: Connection is already handled in db.js which is imported above

// API endpoint to fetch all leads
router.get('/leads', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM leads_database');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching leads:', error);
    res.status(500).json({ error: 'Failed to fetch leads' });
  }
});

// API endpoint to fetch leads with filtering
router.get('/api/leads/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      // If no query provided, return all leads
      const [rows] = await db.query('SELECT * FROM leads_database');
      return res.json(rows);
    }
    
    // Search across multiple fields
    const searchQuery = `%${query}%`;
    const [rows] = await db.query(
      `SELECT * FROM leads_database 
       WHERE name_of_lead LIKE ? 
       OR city LIKE ? 
       OR state LIKE ? 
       OR contact_number LIKE ? 
       OR email_id LIKE ? 
       OR franchise_developer_name LIKE ?
       OR status LIKE ?
       OR leadType LIKE ?`,
      [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery, searchQuery]
    );
    
    res.json(rows);
  } catch (error) {
    console.error('Error searching leads:', error);
    res.status(500).json({ error: 'Failed to search leads' });
  }
});

// API endpoint to get a specific lead by ID
router.get('api/leads/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM leads_database WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching lead:', error);
    res.status(500).json({ error: 'Failed to fetch lead' });
  }
});

// API endpoint to fetch templates
router.get('api/templates', async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM promotion_templates';
    let params = [];
    
    if (type) {
      query += ' WHERE type = ?';
      params.push(type);
    }
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

// API endpoint to get a specific template
router.get('api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query('SELECT * FROM promotion_templates WHERE id = ?', [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(rows[0]);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({ error: 'Failed to fetch template' });
  }
});

// API endpoint to save a new template
router.post('/api/templates', async (req, res) => {
  try {
    const { name, type, subject, body } = req.body;
    
    if (!name || !type || !body) {
      return res.status(400).json({ error: 'Name, type and body are required fields' });
    }
    
    // Default user ID (you would implement actual user authentication)
    const created_by = req.body.created_by || 1;
    
    const query = 'INSERT INTO promotion_templates (name, type, subject, body, created_by) VALUES (?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [name, type, subject || null, body, created_by]);
    
    res.status(201).json({ 
      id: result.insertId,
      name,
      type,
      subject,
      body,
      created_by,
      message: 'Template saved successfully' 
    });
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({ error: 'Failed to save template' });
  }
});

// API endpoint to update a template
router.put('/api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, subject, body } = req.body;
    
    if (!name || !type || !body) {
      return res.status(400).json({ error: 'Name, type and body are required fields' });
    }
    
    const query = 'UPDATE promotion_templates SET name = ?, type = ?, subject = ?, body = ? WHERE id = ?';
    await db.query(query, [name, type, subject || null, body, id]);
    
    res.json({ 
      id: parseInt(id),
      name,
      type,
      subject,
      body,
      message: 'Template updated successfully' 
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

// API endpoint to delete a template
router.delete('api/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query('DELETE FROM promotion_templates WHERE id = ?', [id]);
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

// API endpoint to create a new promotion
router.post('api/promotions', async (req, res) => {
  try {
    const { name, type, status, scheduled_date, created_by, subject, body } = req.body;
    
    if (!name || !type || !status) {
      return res.status(400).json({ error: 'Name, type, and status are required fields' });
    }
    
    const query = 'INSERT INTO promotions (name, type, status, scheduled_date, created_by, subject, body) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const [result] = await db.query(query, [
      name, 
      type, 
      status, 
      scheduled_date || null, 
      created_by || 1, 
      subject || null, 
      body || null
    ]);
    
    res.status(201).json({ 
      id: result.insertId,
      name,
      type,
      status,
      scheduled_date,
      created_by,
      subject,
      body,
      message: 'Promotion created successfully' 
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ error: 'Failed to create promotion' });
  }
});

// API endpoint to associate leads with a promotion
router.post('api/promotions/:id/leads', async (req, res) => {
  try {
    const { id } = req.params;
    const { lead_ids } = req.body;
    
    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return res.status(400).json({ error: 'Lead IDs array is required' });
    }
    
    // Check if promotion exists
    const [promotions] = await db.query('SELECT id FROM promotions WHERE id = ?', [id]);
    if (promotions.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert each lead association
      const results = [];
      
      for (const lead_id of lead_ids) {
        // Check if lead exists
        const [leads] = await connection.query('SELECT id FROM leads_database WHERE id = ?', [lead_id]);
        if (leads.length === 0) {
          throw new Error(`Lead with ID ${lead_id} not found`);
        }
        
        // Check if association already exists
        const [existing] = await connection.query(
          'SELECT id FROM promotion_leads WHERE promotion_id = ? AND lead_id = ?', 
          [id, lead_id]
        );
        
        if (existing.length === 0) {
          // Insert new association
          const [result] = await connection.query(
            'INSERT INTO promotion_leads (promotion_id, lead_id, status) VALUES (?, ?, ?)',
            [id, lead_id, 'Pending']
          );
          
          results.push({
            id: result.insertId,
            promotion_id: parseInt(id),
            lead_id: lead_id,
            status: 'Pending'
          });
        } else {
          results.push({
            id: existing[0].id,
            promotion_id: parseInt(id),
            lead_id: lead_id,
            status: 'Already Added'
          });
        }
      }
      
      await connection.commit();
      connection.release();
      
      res.status(201).json({
        message: 'Leads added to promotion successfully',
        results
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error adding leads to promotion:', error);
    res.status(500).json({ error: `Failed to add leads to promotion: ${error.message}` });
  }
});

// API endpoint to fetch promotions (with filtering options)
router.get('/api/promotions', async (req, res) => {
  try {
    const { status, type } = req.query;
    
    let query = 'SELECT * FROM promotions';
    const params = [];
    
    // Add filters if provided
    if (status || type) {
      query += ' WHERE';
      
      if (status) {
        query += ' status = ?';
        params.push(status);
      }
      
      if (type) {
        if (status) query += ' AND';
        query += ' type = ?';
        params.push(type);
      }
    }
    
    // Add ordering
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ error: 'Failed to fetch promotions' });
  }
});

// API endpoint to get promotion details with associated leads
router.get('/api/promotions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get promotion details
    const [promotions] = await db.query('SELECT * FROM promotions WHERE id = ?', [id]);
    
    if (promotions.length === 0) {
      return res.status(404).json({ error: 'Promotion not found' });
    }
    
    const promotion = promotions[0];
    
    // Get associated leads
    const [promotionLeads] = await db.query(`
      SELECT pl.id, pl.status, pl.sent_at, pl.opened_at, 
             l.id as lead_id, l.name_of_lead, l.city, l.state, 
             l.contact_number, l.email_id
      FROM promotion_leads pl
      JOIN leads_database l ON pl.lead_id = l.id
      WHERE pl.promotion_id = ?
    `, [id]);
    
    // Get attachments
    const [attachments] = await db.query(
      'SELECT id, file_name, file_type, file_size FROM attachments WHERE promotion_id = ?', 
      [id]
    );
    
    res.json({
      ...promotion,
      leads: promotionLeads,
      attachments
    });
  } catch (error) {
    console.error('Error fetching promotion details:', error);
    res.status(500).json({ error: 'Failed to fetch promotion details' });
  }
});

// API endpoint to send messages (update status in database)
router.post('/api/messages/send', async (req, res) => {
  try {
    const { promotion_id, lead_ids, type, content } = req.body;
    
    if (!promotion_id || !lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0 || !type || !content) {
      return res.status(400).json({ error: 'Promotion ID, lead IDs array, type, and content are required' });
    }
    
    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      const results = [];
      const now = new Date();
      
      // Insert message records for each lead
      for (const lead_id of lead_ids) {
        // Insert message
        const [messageResult] = await connection.query(
          'INSERT INTO messages (promotion_id, lead_id, type, content, status, sent_at) VALUES (?, ?, ?, ?, ?, ?)',
          [promotion_id, lead_id, type, content, 'Sent', now]
        );
        
        // Update promotion_leads status
        await connection.query(
          'UPDATE promotion_leads SET status = ?, sent_at = ? WHERE promotion_id = ? AND lead_id = ?',
          ['Sent', now, promotion_id, lead_id]
        );
        
        results.push({
          id: messageResult.insertId,
          promotion_id,
          lead_id,
          type,
          status: 'Sent',
          sent_at: now
        });
      }
      
      await connection.commit();
      connection.release();
      
      res.status(201).json({
        message: 'Messages sent successfully',
        results
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error sending messages:', error);
    res.status(500).json({ error: 'Failed to send messages' });
  }
});

// API endpoint to schedule messages
router.post('/api/messages/schedule', async (req, res) => {
  try {
    const { name, type, subject, body, lead_ids, scheduled_date } = req.body;
    
    if (!name || !type || !body || !lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0 || !scheduled_date) {
      return res.status(400).json({ error: 'Name, type, body, lead IDs array, and scheduled date are required' });
    }
    
    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();
    
    try {
      // Create promotion with Scheduled status
      const [promotionResult] = await connection.query(
        'INSERT INTO promotions (name, type, status, scheduled_date, subject, body) VALUES (?, ?, ?, ?, ?, ?)',
        [name, type, 'Scheduled', scheduled_date, subject || null, body]
      );
      
      const promotion_id = promotionResult.insertId;
      
      // Associate leads with promotion
      for (const lead_id of lead_ids) {
        await connection.query(
          'INSERT INTO promotion_leads (promotion_id, lead_id, status) VALUES (?, ?, ?)',
          [promotion_id, lead_id, 'Pending']
        );
      }
      
      await connection.commit();
      connection.release();
      
      res.status(201).json({
        message: 'Messages scheduled successfully',
        promotion_id,
        scheduled_date,
        lead_count: lead_ids.length
      });
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Error scheduling messages:', error);
    res.status(500).json({ error: 'Failed to schedule messages' });
  }
});

// API endpoint to upload attachments (file handling logic to be implemented)
router.post('/api/attachments', async (req, res) => {
  try {
    // Note: In a real implementation, you would use multer or another 
    // file upload middleware to handle the file upload
    const { promotion_id, file_name, file_path, file_size, file_type } = req.body;
    
    if (!promotion_id || !file_name || !file_path || !file_size || !file_type) {
      return res.status(400).json({ error: 'All attachment fields are required' });
    }
    
    const [result] = await db.query(
      'INSERT INTO attachments (promotion_id, file_name, file_path, file_size, file_type) VALUES (?, ?, ?, ?, ?)',
      [promotion_id, file_name, file_path, file_size, file_type]
    );
    
    res.status(201).json({
      id: result.insertId,
      promotion_id,
      file_name,
      file_type,
      file_size,
      message: 'Attachment uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading attachment:', error);
    res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

// API endpoint to save email verifications
router.post('/api/verifications/email', async (req, res) => {
  try {
    const { lead_id, email, status, score, issue } = req.body;
    
    if (!email || !status) {
      return res.status(400).json({ error: 'Email and status are required fields' });
    }
    
    const [result] = await db.query(
      'INSERT INTO email_verifications (lead_id, email, status, score, issue, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [lead_id || null, email, status, score || null, issue || null]
    );
    
    res.status(201).json({
      id: result.insertId,
      lead_id,
      email,
      status,
      score,
      issue,
      created_at: new Date(),
      message: 'Email verification saved successfully'
    });
  } catch (error) {
    console.error('Error saving email verification:', error);
    res.status(500).json({ error: 'Failed to save email verification' });
  }
});

module.exports = router;