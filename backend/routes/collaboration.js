const express = require('express');
const router = express.Router();
const { pool, executeQuery } = require('../config/database'); // Updated import
const { sendAdminCommunicationEmail } = require('../utils/mailer');

// POST /api/collaboration/submit - PUBLIC ENDPOINT for form submissions
router.post('/submit', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const {
      flowType,
      formData,
      additionalData = {}
    } = req.body;

    console.log('📥 Submission received:', { flowType, formData, additionalData });

    // Validate required data
    if (!flowType || !formData) {
      return res.status(400).json({
        success: false,
        message: 'Flow type and form data are required'
      });
    }

    // FIXED: Better field extraction with multiple fallbacks
    let name = formData.name || 
               formData.fullName || 
               formData.full_name || 
               formData.firstName || 
               formData.applicantName || '';

    let email = formData.email || 
                formData.emailAddress || 
                formData.email_address || 
                formData.primaryEmail || '';

    let organization = formData.organization || 
                      formData.organizationName || 
                      formData.company || 
                      formData.institution || 
                      null;

    // If applicantType is Individual, use fullName as name
    if (formData.applicantType === 'Individual' && formData.fullName) {
      name = formData.fullName;
    }
    // If applicantType is Organization, use fullName as organization and extract contact person if available
    else if (formData.applicantType === 'Organization' && formData.fullName) {
      organization = formData.fullName;
      // Try to extract contact person name if available in other fields
      name = formData.contactPerson || formData.representativeName || organization;
    }

    console.log('🔍 Extracted fields:', { name, email, organization });

    // Validate required fields
    if (!name || !email) {
      console.error('❌ Validation failed:', { name, email });
      return res.status(400).json({
        success: false,
        message: `Missing required fields. Name: "${name}", Email: "${email}"`,
        debug: { receivedFormData: formData }
      });
    }

    await connection.beginTransaction();

    // Generate UUID for the collaboration report
    const collaborationId = require('crypto').randomUUID();

    // FIXED: Ensure all form data is preserved, including original keys
    const reportData = {
      ...formData, // Keep all original form data
      ...additionalData,
      // Add computed fields for easy access
      extractedName: name,
      extractedEmail: email,
      extractedOrganization: organization
    };

    // Insert collaboration report
    const insertQuery = `
      INSERT INTO collaboration_reports (
        id,
        flow_type,
        name, 
        email,
        organization,
        report_data,
        status,
        priority,
        contact_count,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'new', 'medium', 0, NOW(), NOW())
    `;

    console.log('💾 Inserting with values:', [
      collaborationId,
      flowType,
      name,
      email,
      organization,
      'JSON data...'
    ]);

    await connection.execute(insertQuery, [
      collaborationId,
      flowType,
      name,
      email,
      organization,
      JSON.stringify(reportData)
    ]);

    // Add initial activity log
    const activityQuery = `
      INSERT INTO collaboration_activities (
        collaboration_id,
        activity_type,
        description,
        admin_user,
        metadata,
        created_at
      ) VALUES (?, 'submission', ?, 'System', ?, NOW())
    `;

    const activityDescription = `New ${flowType} request submitted via ${additionalData.submissionMethod || 'chatbot'}`;
    const activityMetadata = {
      flowType,
      submissionMethod: additionalData.submissionMethod || 'chatbot',
      completionTime: additionalData.completionTime || null,
      questionCount: additionalData.questionHistory ? additionalData.questionHistory.length : 0,
      originalFormData: formData
    };

    await connection.execute(activityQuery, [
      collaborationId,
      activityDescription,
      JSON.stringify(activityMetadata)
    ]);

    // If there's question history, try to store it (skip if table doesn't exist)
    if (additionalData.questionHistory && Array.isArray(additionalData.questionHistory)) {
      try {
        const historyQuery = `
          INSERT INTO collaboration_question_history (
            collaboration_id,
            question_key,
            question_text,
            answer,
            created_at
          ) VALUES (?, ?, ?, ?, NOW())
        `;

        for (const qh of additionalData.questionHistory) {
          await connection.execute(historyQuery, [
            collaborationId,
            qh.questionKey || '',
            qh.question || '',
            qh.answer || ''
          ]);
        }
      } catch (historyError) {
        console.warn('Question history table not found, skipping:', historyError.message);
        // Continue without failing the entire request
      }
    }

    await connection.commit();

    console.log('✅ Collaboration request submitted successfully:', collaborationId);

    res.status(201).json({
      success: true,
      message: `${flowType.charAt(0).toUpperCase() + flowType.slice(1)} request submitted successfully`,
      data: {
        collaborationId,
        submittedAt: new Date().toISOString(),
        status: 'new',
        flowType,
        extractedData: { name, email, organization }
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Error submitting collaboration request:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit collaboration request',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        code: error.code
      } : 'Internal server error'
    });
  } finally {
    connection.release();
  }
});
// FIXED ADMIN/ALL ROUTE - MySQL LIMIT/OFFSET parameter issue resolved
// Replace your current router.get('/admin/all', ...) with this version

router.get('/admin/all', async (req, res) => {
  try {
    const {
      status,
      flowType,
      priority,
      assignedTo,
      limit = 50,
      offset = 0,
      page = 1,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    console.log('📊 Admin query received:', req.query);

    // Calculate pagination first
    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const calculatedOffset = (parsedPage - 1) * parsedLimit;

    // Validate sort parameters
    const validSortColumns = ['created_at', 'updated_at', 'name', 'status', 'priority', 'flow_type'];
    const validSortOrders = ['ASC', 'DESC'];
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Build WHERE conditions and parameters array
    let whereConditions = [];
    let queryParams = [];

    if (status && status !== 'all' && status.trim() !== '') {
      whereConditions.push('status = ?');
      queryParams.push(status.trim());
    }

    if (flowType && flowType !== 'all' && flowType.trim() !== '') {
      whereConditions.push('flow_type = ?');
      queryParams.push(flowType.trim());
    }

    if (priority && priority !== 'all' && priority.trim() !== '') {
      whereConditions.push('priority = ?');
      queryParams.push(priority.trim());
    }

    if (assignedTo && assignedTo.trim() !== '') {
      whereConditions.push('assigned_to = ?');
      queryParams.push(assignedTo.trim());
    }

    if (search && search.trim() !== '') {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR organization LIKE ?)');
      const searchParam = `%${search.trim()}%`;
      queryParams.push(searchParam, searchParam, searchParam);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // FIXED: Build query with embedded LIMIT/OFFSET values instead of parameters
    // This avoids the MySQL parameter binding issue with LIMIT/OFFSET
    const query = `
      SELECT 
        id, flow_type, name, email, organization,
        status, priority, assigned_to, contact_count, 
        follow_up_date, last_contacted_at, admin_notes, 
        created_at, updated_at
      FROM collaboration_reports
      ${whereClause}
      ORDER BY ${finalSortBy} ${finalSortOrder}
      LIMIT ${parsedLimit} OFFSET ${calculatedOffset}
    `;

    // Only use queryParams for WHERE conditions, not for LIMIT/OFFSET
    console.log('🔍 Query:', query.replace(/\s+/g, ' ').trim());
    console.log('🔍 Parameter count:', queryParams.length);
    console.log('🔍 Parameters:', queryParams);

    // Execute main query with only WHERE condition parameters
    const [reports] = await pool.execute(query, queryParams);
    console.log('✅ Query executed successfully, found', reports.length, 'reports');

    // Get total count using same WHERE conditions
    const countQuery = `SELECT COUNT(*) as total FROM collaboration_reports ${whereClause}`;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / parsedLimit);

    // Process reports with safe date formatting
    const processedReports = reports.map(report => ({
      ...report,
      created_at: report.created_at ? new Date(report.created_at).toISOString() : null,
      updated_at: report.updated_at ? new Date(report.updated_at).toISOString() : null,
      last_contacted_at: report.last_contacted_at ? new Date(report.last_contacted_at).toISOString() : null,
      follow_up_date: report.follow_up_date || null
    }));

    const response = {
      success: true,
      data: {
        reports: processedReports,
        pagination: {
          total,
          limit: parsedLimit,
          offset: calculatedOffset,
          page: parsedPage,
          pages: totalPages,
          hasMore: calculatedOffset + parsedLimit < total
        }
      }
    };

    console.log('📤 Sending response with', processedReports.length, 'reports');
    res.json(response);

  } catch (error) {
    console.error('❌ Error in /admin/all route:', {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      errno: error.errno,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration requests',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        errno: error.errno
      } : 'Internal server error'
    });
  }
});

// ALTERNATIVE: If you prefer to keep using parameters, here's a version with proper integer conversion
router.get('/admin/all-alt', async (req, res) => {
  try {
    const {
      status,
      flowType,
      priority,
      assignedTo,
      limit = 50,
      page = 1,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Calculate pagination
    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const calculatedOffset = (parsedPage - 1) * parsedLimit;

    // Build WHERE conditions
    let whereConditions = [];
    let queryParams = [];

    if (status && status !== 'all' && status.trim() !== '') {
      whereConditions.push('status = ?');
      queryParams.push(status.trim());
    }

    if (flowType && flowType !== 'all' && flowType.trim() !== '') {
      whereConditions.push('flow_type = ?');
      queryParams.push(flowType.trim());
    }

    if (priority && priority !== 'all' && priority.trim() !== '') {
      whereConditions.push('priority = ?');
      queryParams.push(priority.trim());
    }

    if (assignedTo && assignedTo.trim() !== '') {
      whereConditions.push('assigned_to = ?');
      queryParams.push(assignedTo.trim());
    }

    if (search && search.trim() !== '') {
      whereConditions.push('(name LIKE ? OR email LIKE ? OR organization LIKE ?)');
      const searchParam = `%${search.trim()}%`;
      queryParams.push(searchParam, searchParam, searchParam);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Use a different approach - build the query in two steps
    const baseQuery = `
      SELECT id, flow_type, name, email, organization,
             status, priority, assigned_to, contact_count, 
             follow_up_date, last_contacted_at, admin_notes, 
             created_at, updated_at
      FROM collaboration_reports
      ${whereClause}
      ORDER BY ${validSortColumns.includes(sortBy) ? sortBy : 'created_at'} ${validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC'}
    `;

    // Execute query and then slice results (for smaller datasets)
    const [allReports] = await pool.execute(baseQuery, queryParams);
    
    // Apply pagination in JavaScript (suitable for smaller result sets)
    const reports = allReports.slice(calculatedOffset, calculatedOffset + parsedLimit);
    const total = allReports.length;
    
    // If you have large datasets, you might want to use a different approach
    // But for now this avoids the LIMIT/OFFSET parameter issue
    
    const processedReports = reports.map(report => ({
      ...report,
      created_at: report.created_at ? new Date(report.created_at).toISOString() : null,
      updated_at: report.updated_at ? new Date(report.updated_at).toISOString() : null,
      last_contacted_at: report.last_contacted_at ? new Date(report.last_contacted_at).toISOString() : null
    }));

    res.json({
      success: true,
      data: {
        reports: processedReports,
        pagination: {
          total,
          limit: parsedLimit,
          page: parsedPage,
          pages: Math.ceil(total / parsedLimit),
          hasMore: calculatedOffset + parsedLimit < total
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in alternative admin route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration requests',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// SIMPLE TEST ROUTE to verify the fix works
router.get('/admin/test-pagination', async (req, res) => {
  try {
    // Test the fixed approach
    const query = `
      SELECT id, name, email, created_at 
      FROM collaboration_reports 
      ORDER BY created_at DESC 
      LIMIT 5 OFFSET 0
    `;
    
    const [reports] = await pool.execute(query, []); // No parameters for LIMIT/OFFSET
    
    res.json({
      success: true,
      message: 'Pagination test successful',
      count: reports.length,
      data: reports
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Pagination test failed',
      error: error.message
    });
  }
});






// Alternative simplified version if the above still has issues
router.get('/admin/all-simple', async (req, res) => {
  try {
    const { 
      limit = 20, 
      page = 1,
      status = 'all',
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (parsedPage - 1) * parsedLimit;

    // Simple query without complex WHERE conditions
    let baseQuery = `
      SELECT id, flow_type, name, email, organization,
             status, priority, assigned_to, contact_count,
             follow_up_date, last_contacted_at, admin_notes,
             created_at, updated_at
      FROM collaboration_reports
    `;

    let queryParams = [];
    
    // Add status filter if not 'all'
    if (status && status !== 'all') {
      baseQuery += ' WHERE status = ?';
      queryParams.push(status);
    }

    // Add ordering and pagination
    const validSort = ['created_at', 'updated_at', 'name', 'status'].includes(sortBy) ? sortBy : 'created_at';
    const validOrder = ['ASC', 'DESC'].includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
    
    baseQuery += ` ORDER BY ${validSort} ${validOrder} LIMIT ? OFFSET ?`;
    queryParams.push(parsedLimit, offset);

    console.log('🔍 Simple Query:', baseQuery.replace(/\s+/g, ' ').trim());
    console.log('🔍 Simple Query Parameters:', queryParams);

    const [reports] = await pool.execute(baseQuery, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM collaboration_reports';
    let countParams = [];
    
    if (status && status !== 'all') {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        reports: reports.map(report => ({
          ...report,
          created_at: report.created_at ? new Date(report.created_at).toISOString() : null,
          updated_at: report.updated_at ? new Date(report.updated_at).toISOString() : null,
          last_contacted_at: report.last_contacted_at ? new Date(report.last_contacted_at).toISOString() : null
        })),
        pagination: {
          total,
          limit: parsedLimit,
          page: parsedPage,
          pages: Math.ceil(total / parsedLimit),
          hasMore: offset + parsedLimit < total
        }
      }
    });

  } catch (error) {
    console.error('❌ Error in simple admin route:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});




// Debug tool to identify parameter mismatches in collaboration routes
// Add this to your collaboration.js file for debugging

// ENHANCED DEBUGGING FUNCTION
const debugQuery = (query, params, queryName = 'Unknown') => {
  const placeholderCount = (query.match(/\?/g) || []).length;
  const paramCount = params.length;
  
  console.log(`\n=== QUERY DEBUG: ${queryName} ===`);
  console.log('📝 Query:', query.replace(/\s+/g, ' ').trim());
  console.log('🔢 Placeholders found:', placeholderCount);
  console.log('🔢 Parameters provided:', paramCount);
  console.log('📋 Parameters:', params);
  
  if (placeholderCount !== paramCount) {
    console.error('❌ MISMATCH DETECTED!');
    console.error(`Expected ${placeholderCount} parameters, got ${paramCount}`);
    return false;
  } else {
    console.log('✅ Parameter count matches');
    return true;
  }
};

// SAFE QUERY EXECUTOR
const safeExecute = async (pool, query, params, queryName = 'Query') => {
  try {
    const isValid = debugQuery(query, params, queryName);
    if (!isValid) {
      throw new Error(`Parameter mismatch in ${queryName}`);
    }
    
    const [result] = await pool.execute(query, params);
    console.log(`✅ ${queryName} executed successfully`);
    return result;
  } catch (error) {
    console.error(`❌ ${queryName} failed:`, {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState
    });
    throw error;
  }
};

// COMPREHENSIVE DEBUG ROUTE
router.get('/admin/debug/query-test', async (req, res) => {
  try {
    console.log('\n🧪 Starting comprehensive query debug test...');
    
    const testResults = {};
    
    // Test 1: Simple query with no parameters
    console.log('\n--- Test 1: No parameters ---');
    try {
      const query1 = 'SELECT COUNT(*) as total FROM collaboration_reports';
      const params1 = [];
      const result1 = await safeExecute(pool, query1, params1, 'Test 1 - Count All');
      testResults.test1 = { status: 'PASS', count: result1[0].total };
    } catch (error) {
      testResults.test1 = { status: 'FAIL', error: error.message };
    }

    // Test 2: Single parameter query
    console.log('\n--- Test 2: Single parameter ---');
    try {
      const query2 = 'SELECT COUNT(*) as total FROM collaboration_reports WHERE status = ?';
      const params2 = ['new'];
      const result2 = await safeExecute(pool, query2, params2, 'Test 2 - Status Filter');
      testResults.test2 = { status: 'PASS', count: result2[0].total };
    } catch (error) {
      testResults.test2 = { status: 'FAIL', error: error.message };
    }

    // Test 3: Multiple parameters query
    console.log('\n--- Test 3: Multiple parameters ---');
    try {
      const query3 = 'SELECT COUNT(*) as total FROM collaboration_reports WHERE status = ? AND flow_type = ?';
      const params3 = ['new', 'collaborate'];
      const result3 = await safeExecute(pool, query3, params3, 'Test 3 - Multiple Filters');
      testResults.test3 = { status: 'PASS', count: result3[0].total };
    } catch (error) {
      testResults.test3 = { status: 'FAIL', error: error.message };
    }

    // Test 4: LIKE query (search simulation)
    console.log('\n--- Test 4: LIKE parameters ---');
    try {
      const query4 = 'SELECT COUNT(*) as total FROM collaboration_reports WHERE name LIKE ? OR email LIKE ?';
      const searchTerm = '%test%';
      const params4 = [searchTerm, searchTerm];
      const result4 = await safeExecute(pool, query4, params4, 'Test 4 - Search Query');
      testResults.test4 = { status: 'PASS', count: result4[0].total };
    } catch (error) {
      testResults.test4 = { status: 'FAIL', error: error.message };
    }

    // Test 5: Pagination query
    console.log('\n--- Test 5: Pagination parameters ---');
    try {
      const query5 = `
        SELECT id, name, email, status, created_at 
        FROM collaboration_reports 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      const params5 = [10, 0];
      const result5 = await safeExecute(pool, query5, params5, 'Test 5 - Pagination');
      testResults.test5 = { status: 'PASS', count: result5.length };
    } catch (error) {
      testResults.test5 = { status: 'FAIL', error: error.message };
    }

    // Test 6: Complex query simulation (like your admin/all route)
    console.log('\n--- Test 6: Complex admin query simulation ---');
    try {
      const whereConditions = [];
      const queryParams = [];
      
      // Simulate filters
      const status = 'new';
      const flowType = 'collaborate';
      
      if (status && status !== 'all') {
        whereConditions.push('status = ?');
        queryParams.push(status);
      }
      
      if (flowType && flowType !== 'all') {
        whereConditions.push('flow_type = ?');
        queryParams.push(flowType);
      }
      
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      
      const query6 = `
        SELECT id, flow_type, name, email, organization,
               status, priority, assigned_to, contact_count, 
               follow_up_date, last_contacted_at, admin_notes, 
               created_at, updated_at
        FROM collaboration_reports
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;
      
      const params6 = [...queryParams, 20, 0];
      const result6 = await safeExecute(pool, query6, params6, 'Test 6 - Admin Query Simulation');
      testResults.test6 = { status: 'PASS', count: result6.length };
    } catch (error) {
      testResults.test6 = { status: 'FAIL', error: error.message };
    }

    // Test 7: Your exact problematic query pattern
    console.log('\n--- Test 7: Exact problem reproduction ---');
    try {
      // Simulate the exact conditions that might be causing your issue
      const req_query = {
        status: '',  // Empty string that might cause issues
        flowType: '',
        priority: '',
        assignedTo: '',
        search: '',
        limit: '20',
        page: '1'
      };

      const whereConditions = [];
      const queryParams = [];

      if (req_query.status && req_query.status !== 'all' && req_query.status.trim() !== '') {
        whereConditions.push('status = ?');
        queryParams.push(req_query.status.trim());
      }

      if (req_query.flowType && req_query.flowType !== 'all' && req_query.flowType.trim() !== '') {
        whereConditions.push('flow_type = ?');
        queryParams.push(req_query.flowType.trim());
      }

      if (req_query.search && req_query.search.trim() !== '') {
        whereConditions.push('(name LIKE ? OR email LIKE ? OR organization LIKE ?)');
        const searchParam = `%${req_query.search.trim()}%`;
        queryParams.push(searchParam, searchParam, searchParam);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
      const parsedLimit = parseInt(req_query.limit, 10) || 20;
      const parsedPage = parseInt(req_query.page, 10) || 1;
      const calculatedOffset = (parsedPage - 1) * parsedLimit;

      const query7 = `
        SELECT id, flow_type, name, email, organization,
               status, priority, assigned_to, contact_count, 
               follow_up_date, last_contacted_at, admin_notes, 
               created_at, updated_at
        FROM collaboration_reports
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `;

      const mainQueryParams = [...queryParams, parsedLimit, calculatedOffset];
      const result7 = await safeExecute(pool, query7, mainQueryParams, 'Test 7 - Problem Reproduction');
      testResults.test7 = { status: 'PASS', count: result7.length };
    } catch (error) {
      testResults.test7 = { status: 'FAIL', error: error.message };
    }

    // Summary
    const passedTests = Object.values(testResults).filter(t => t.status === 'PASS').length;
    const totalTests = Object.keys(testResults).length;

    console.log(`\n📊 Test Summary: ${passedTests}/${totalTests} tests passed`);

    res.json({
      success: true,
      summary: `${passedTests}/${totalTests} tests passed`,
      testResults,
      recommendations: [
        passedTests === totalTests ? 
          '✅ All tests passed! The parameter mismatch might be in a specific request scenario.' :
          '❌ Some tests failed. Check the failed tests for parameter issues.',
        'Try calling your actual /admin/all endpoint with various query parameters',
        'Check your frontend requests to ensure they\'re not sending unexpected parameters',
        'Consider adding the safeExecute function to your actual routes for better debugging'
      ]
    });

  } catch (error) {
    console.error('❌ Debug test suite failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Debug test suite encountered an error'
    });
  }
});

// ENHANCED ADMIN/ALL ROUTE WITH DEBUGGING
router.get('/admin/all-debug', async (req, res) => {
  try {
    console.log('\n🔍 DEBUG: Enhanced admin/all route started');
    console.log('📥 Request query:', req.query);

    const {
      status,
      flowType,
      priority,
      assignedTo,
      limit = 20,
      page = 1,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    // Parse and validate
    const parsedLimit = Math.min(parseInt(limit, 10) || 20, 100);
    const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
    const calculatedOffset = (parsedPage - 1) * parsedLimit;

    console.log('📊 Parsed values:', {
      parsedLimit,
      parsedPage,
      calculatedOffset
    });

    // Build conditions with detailed logging
    let whereConditions = [];
    let queryParams = [];

    console.log('\n🏗️ Building WHERE conditions:');

    if (status && status !== 'all' && status.trim() !== '') {
      console.log('➕ Adding status condition:', status.trim());
      whereConditions.push('status = ?');
      queryParams.push(status.trim());
    } else {
      console.log('⏭️ Skipping status condition:', { status, isEmpty: !status || status === 'all' || status.trim() === '' });
    }

    if (flowType && flowType !== 'all' && flowType.trim() !== '') {
      console.log('➕ Adding flowType condition:', flowType.trim());
      whereConditions.push('flow_type = ?');
      queryParams.push(flowType.trim());
    } else {
      console.log('⏭️ Skipping flowType condition:', { flowType, isEmpty: !flowType || flowType === 'all' || flowType.trim() === '' });
    }

    if (priority && priority !== 'all' && priority.trim() !== '') {
      console.log('➕ Adding priority condition:', priority.trim());
      whereConditions.push('priority = ?');
      queryParams.push(priority.trim());
    } else {
      console.log('⏭️ Skipping priority condition:', { priority, isEmpty: !priority || priority === 'all' || priority.trim() === '' });
    }

    if (assignedTo && assignedTo.trim() !== '') {
      console.log('➕ Adding assignedTo condition:', assignedTo.trim());
      whereConditions.push('assigned_to = ?');
      queryParams.push(assignedTo.trim());
    } else {
      console.log('⏭️ Skipping assignedTo condition:', { assignedTo, isEmpty: !assignedTo || assignedTo.trim() === '' });
    }

    if (search && search.trim() !== '') {
      console.log('➕ Adding search condition:', search.trim());
      whereConditions.push('(name LIKE ? OR email LIKE ? OR organization LIKE ?)');
      const searchParam = `%${search.trim()}%`;
      queryParams.push(searchParam, searchParam, searchParam);
    } else {
      console.log('⏭️ Skipping search condition:', { search, isEmpty: !search || search.trim() === '' });
    }

    console.log('\n📋 Final conditions:', whereConditions);
    console.log('📋 Query parameters so far:', queryParams);

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Validate sort parameters
    const validSortColumns = ['created_at', 'updated_at', 'name', 'status', 'priority', 'flow_type'];
    const validSortOrders = ['ASC', 'DESC'];
    const finalSortBy = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const finalSortOrder = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';

    // Build main query
    const mainQuery = `
      SELECT id, flow_type, name, email, organization,
             status, priority, assigned_to, contact_count, 
             follow_up_date, last_contacted_at, admin_notes, 
             created_at, updated_at
      FROM collaboration_reports
      ${whereClause}
      ORDER BY ${finalSortBy} ${finalSortOrder}
      LIMIT ? OFFSET ?
    `;

    const mainQueryParams = [...queryParams, parsedLimit, calculatedOffset];

    // Execute with debugging
    console.log('\n🚀 Executing main query...');
    const reports = await safeExecute(pool, mainQuery, mainQueryParams, 'Main Query');

    // Build and execute count query
    const countQuery = `SELECT COUNT(*) as total FROM collaboration_reports ${whereClause}`;
    const countQueryParams = [...queryParams]; // No pagination params

    console.log('\n🔢 Executing count query...');
    const countResult = await safeExecute(pool, countQuery, countQueryParams, 'Count Query');
    const total = countResult[0].total;

    console.log(`\n✅ Queries successful! Found ${reports.length} reports out of ${total} total`);

    // Process and return results
    const processedReports = reports.map(report => ({
      ...report,
      created_at: report.created_at ? new Date(report.created_at).toISOString() : null,
      updated_at: report.updated_at ? new Date(report.updated_at).toISOString() : null,
      last_contacted_at: report.last_contacted_at ? new Date(report.last_contacted_at).toISOString() : null
    }));

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      success: true,
      debug: {
        queryConditions: whereConditions.length,
        parameterCount: mainQueryParams.length,
        searchUsed: !!search,
        filtersApplied: {
          status: !!status && status !== 'all',
          flowType: !!flowType && flowType !== 'all',
          priority: !!priority && priority !== 'all',
          assignedTo: !!assignedTo,
          search: !!search
        }
      },
      data: {
        reports: processedReports,
        pagination: {
          total,
          limit: parsedLimit,
          page: parsedPage,
          pages: totalPages,
          hasMore: calculatedOffset + parsedLimit < total
        }
      }
    });

  } catch (error) {
    console.error('❌ Enhanced admin route error:', error);
    res.status(500).json({
      success: false,
      message: 'Enhanced admin route failed',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        code: error.code,
        stack: error.stack
      } : 'Internal server error'
    });
  }
});


// Enhanced debug routes
router.get('/admin/debug/simple', async (req, res) => {
  try {
    console.log('🧪 Running comprehensive debug test...');
    
    // Test 1: Database connection
    const [connectionTest] = await pool.execute('SELECT 1 as test, NOW() as current_time');
    console.log('✅ Database connection OK');

    // Test 2: Table exists and structure
    const [tableCheck] = await pool.execute("SHOW TABLES LIKE 'collaboration_reports'");
    console.log('✅ Table check:', tableCheck.length > 0 ? 'EXISTS' : 'NOT FOUND');

    // Test 3: Row count and sample data
    const [countResult] = await pool.execute('SELECT COUNT(*) as total FROM collaboration_reports');
    const totalRows = countResult[0].total;
    console.log('✅ Total rows:', totalRows);

    // Test 4: Get sample data with more fields
    const [sampleData] = await pool.execute(`
      SELECT 
        id, name, email, organization, flow_type, status, priority,
        JSON_EXTRACT(report_data, '$.applicantType') as applicant_type,
        JSON_EXTRACT(report_data, '$.country') as country,
        created_at, updated_at
      FROM collaboration_reports 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    console.log('✅ Sample data:', sampleData);

    // Test 5: Check for recent submissions
    const [recentData] = await pool.execute(`
      SELECT COUNT(*) as recent_count
      FROM collaboration_reports 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `);

    res.json({
      success: true,
      debug: {
        connectionTest: connectionTest[0],
        tableExists: tableCheck.length > 0,
        totalRows,
        recentSubmissions: recentData[0].recent_count,
        sampleData: sampleData.map(row => ({
          ...row,
          applicant_type: row.applicant_type ? JSON.parse(row.applicant_type) : null,
          country: row.country ? JSON.parse(row.country) : null
        })),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('❌ Debug test failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        sqlState: error.sqlState,
        stack: error.stack
      }
    });
  }
});

// Raw data dump route
router.get('/admin/debug/raw', async (req, res) => {
  try {
    const [reports] = await pool.execute(`
      SELECT * FROM collaboration_reports 
      ORDER BY created_at DESC 
      LIMIT 10
    `);
    
    // Parse JSON fields for easier reading
    const processedReports = reports.map(report => ({
      ...report,
      report_data: typeof report.report_data === 'string' 
        ? JSON.parse(report.report_data) 
        : report.report_data
    }));
    
    res.json({ 
      success: true, 
      totalFound: reports.length,
      rawData: processedReports 
    });
  } catch (error) {
    console.error('❌ Raw data fetch failed:', error);
    res.status(500).json({ 
      success: false, 
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    });
  }
});

// Test database write route
router.post('/admin/debug/test-write', async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const testId = require('crypto').randomUUID();
    const testData = {
      testField: 'Test submission',
      timestamp: new Date().toISOString(),
      source: 'debug-test'
    };

    await connection.execute(`
      INSERT INTO collaboration_reports (
        id, flow_type, name, email, organization, report_data,
        status, priority, contact_count, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'new', 'medium', 0, NOW(), NOW())
    `, [
      testId,
      'collaborate',
      'Test User',
      'test@example.com',
      'Test Organization',
      JSON.stringify(testData)
    ]);

    await connection.commit();
    
    res.json({
      success: true,
      message: 'Test record created successfully',
      testId,
      testData
    });

  } catch (error) {
    await connection.rollback();
    console.error('❌ Test write failed:', error);
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
        stack: error.stack
      }
    });
  } finally {
    connection.release();
  }
});

// Rest of the routes remain the same...

// POST /api/collaboration/admin/:id/contact
router.post('/admin/:id/contact', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id: collaborationId } = req.params;
    const {
      contactType = 'email',
      subject,
      message,
      contactMethod = '',
      scheduleFollowUp = false,
      followUpDate = null,
      updateStatus = false,
      newStatus = null
    } = req.body;

    // Validate required fields
    if (!subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Subject and message are required'
      });
    }

    // Get collaboration details
    const [collaboration] = await connection.execute(
      'SELECT * FROM collaboration_reports WHERE id = ?',
      [collaborationId]
    );

    if (collaboration.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration request not found'
      });
    }

    const report = collaboration[0];
    await connection.beginTransaction();

    // 1. Add contact record
    const contactQuery = `
      INSERT INTO collaboration_contacts (
        collaboration_id, contact_type, subject, message,
        contact_method, admin_user, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, NOW())
    `;

    await connection.execute(contactQuery, [
      collaborationId,
      contactType,
      subject,
      message,
      contactMethod || report.email,
      req.user?.name || 'Admin'
    ]);

    // 2. Update contact count and last contacted timestamp
    const updateReportQuery = `
      UPDATE collaboration_reports 
      SET 
        contact_count = contact_count + 1,
        last_contacted_at = NOW(),
        follow_up_date = ?,
        status = COALESCE(?, status),
        updated_at = NOW()
      WHERE id = ?
    `;

    await connection.execute(updateReportQuery, [
      scheduleFollowUp ? followUpDate : report.follow_up_date,
      updateStatus ? newStatus : null,
      collaborationId
    ]);

    // 3. Log activity
    const activityQuery = `
      INSERT INTO collaboration_activities (
        collaboration_id, activity_type, description,
        admin_user, metadata, created_at
      ) VALUES (?, 'contact_made', ?, ?, ?, NOW())
    `;

    const activityDescription = `${contactType.toUpperCase()} contact made: ${subject}`;
    const activityMetadata = {
      contactType,
      subject,
      messageLength: message.length,
      contactMethod: contactMethod || report.email,
      followUpScheduled: scheduleFollowUp,
      followUpDate,
      statusUpdated: updateStatus,
      newStatus: updateStatus ? newStatus : null
    };

    await connection.execute(activityQuery, [
      collaborationId,
      activityDescription,
      req.user?.name || 'Admin',
      JSON.stringify(activityMetadata)
    ]);

    // 4. Send email if contact type is email
    if (contactType === 'email') {
      try {
        await sendAdminCommunicationEmail({
          recipientEmail: report.email,
          recipientName: report.name,
          subject,
          message
        });

        // Log successful email
        await connection.execute(
          `INSERT INTO collaboration_activities (
            collaboration_id, activity_type, description,
            admin_user, metadata, created_at
          ) VALUES (?, 'contact_made', ?, ?, ?, NOW())`,
          [
            collaborationId,
            'Email sent successfully',
            req.user?.name || 'System',
            JSON.stringify({ emailSent: true, recipient: report.email })
          ]
        );

      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        
        // Log email failure but don't fail the whole operation
        await connection.execute(
          `INSERT INTO collaboration_activities (
            collaboration_id, activity_type, description,
            admin_user, metadata, created_at
          ) VALUES (?, 'contact_made', ?, ?, ?, NOW())`,
          [
            collaborationId,
            'Email sending failed',
            req.user?.name || 'System',
            JSON.stringify({ 
              emailSent: false, 
              error: emailError.message,
              recipient: report.email 
            })
          ]
        );

        await connection.commit();
        return res.status(207).json({
          success: true,
          message: 'Contact record created but email sending failed',
          warning: 'Email could not be sent - please try alternative contact method',
          emailError: emailError.message
        });
      }
    }

    await connection.commit();

    res.json({
      success: true,
      message: `Contact record added successfully${contactType === 'email' ? ' and email sent' : ''}`,
      data: {
        collaborationId,
        contactType,
        contactCount: report.contact_count + 1,
        lastContactedAt: new Date().toISOString(),
        followUpScheduled: scheduleFollowUp,
        followUpDate: scheduleFollowUp ? followUpDate : report.follow_up_date,
        statusUpdated: updateStatus,
        newStatus: updateStatus ? newStatus : report.status
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error adding contact record:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to add contact record',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

// GET /api/collaboration/admin/:id/contacts - Get contact history
router.get('/admin/:id/contacts', async (req, res) => {
  try {
    const { id: collaborationId } = req.params;
    const { limit = 50 } = req.query;

    const query = `
      SELECT 
        id, contact_type, subject, message, contact_method,
        response_received, response_date, admin_user, created_at
      FROM collaboration_contacts 
      WHERE collaboration_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const [contacts] = await pool.execute(query, [collaborationId, parseInt(limit)]);

    res.json({
      success: true,
      data: {
        collaborationId,
        contacts,
        total: contacts.length
      }
    });

  } catch (error) {
    console.error('Error fetching contact history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact history',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// PUT /api/collaboration/admin/:id/status - Update status and notes
router.put('/admin/:id/status', async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id: collaborationId } = req.params;
    const {
      status,
      priority,
      adminNotes,
      assignedTo,
      followUpDate
    } = req.body;

    // Get current report for comparison
    const [currentReport] = await connection.execute(
      'SELECT * FROM collaboration_reports WHERE id = ?',
      [collaborationId]
    );

    if (currentReport.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration request not found'
      });
    }

    const current = currentReport[0];
    await connection.beginTransaction();

    // Update report
    const updateQuery = `
      UPDATE collaboration_reports 
      SET 
        status = COALESCE(?, status),
        priority = COALESCE(?, priority),
        admin_notes = COALESCE(?, admin_notes),
        assigned_to = ?,
        follow_up_date = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await connection.execute(updateQuery, [
      status,
      priority, 
      adminNotes,
      assignedTo || null,
      followUpDate || null,
      collaborationId
    ]);

    // Log changes as activities
    const changes = [];
    if (status && status !== current.status) {
      changes.push(`Status changed from '${current.status}' to '${status}'`);
    }
    if (priority && priority !== current.priority) {
      changes.push(`Priority changed from '${current.priority}' to '${priority}'`);
    }
    if (assignedTo !== current.assigned_to) {
      const from = current.assigned_to || 'Unassigned';
      const to = assignedTo || 'Unassigned';
      changes.push(`Assignment changed from '${from}' to '${to}'`);
    }
    if (adminNotes && adminNotes !== current.admin_notes) {
      changes.push('Admin notes updated');
    }
    if (followUpDate !== current.follow_up_date) {
      changes.push(`Follow-up date ${followUpDate ? `set to ${followUpDate}` : 'cleared'}`);
    }

    // Log activity for each change
    for (const change of changes) {
      const activityType = change.includes('Status') ? 'status_change' :
                          change.includes('Priority') ? 'priority_changed' :
                          change.includes('Assignment') ? 'assigned' :
                          change.includes('Follow-up') ? 'follow_up_scheduled' :
                          'note_added';

      await connection.execute(
        `INSERT INTO collaboration_activities (
          collaboration_id, activity_type, description,
          admin_user, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, NOW())`,
        [
          collaborationId,
          activityType,
          change,
          req.user?.name || 'Admin',
          JSON.stringify({ 
            previousValues: {
              status: current.status,
              priority: current.priority,
              assignedTo: current.assigned_to,
              followUpDate: current.follow_up_date
            },
            newValues: {
              status,
              priority,
              assignedTo,
              followUpDate
            }
          })
        ]
      );
    }

    await connection.commit();

    res.json({
      success: true,
      message: 'Status updated successfully',
      changes: changes.length,
      data: {
        collaborationId,
        status: status || current.status,
        priority: priority || current.priority,
        assignedTo: assignedTo !== undefined ? assignedTo : current.assigned_to,
        followUpDate: followUpDate !== undefined ? followUpDate : current.follow_up_date,
        adminNotes: adminNotes || current.admin_notes,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error updating collaboration status:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
});

// GET /api/collaboration/admin/:id - Get single collaboration with full details
router.get('/admin/:id', async (req, res) => {
  try {
    const { id: collaborationId } = req.params;

    // Get main report
    const [reportResult] = await pool.execute(
      'SELECT * FROM collaboration_reports WHERE id = ?',
      [collaborationId]
    );

    if (reportResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Collaboration request not found'
      });
    }

    const report = reportResult[0];

    // Get activities
    const [activities] = await pool.execute(
      `SELECT * FROM collaboration_activities 
       WHERE collaboration_id = ? 
       ORDER BY created_at DESC`,
      [collaborationId]
    );

    // Get contacts
    const [contacts] = await pool.execute(
      `SELECT * FROM collaboration_contacts 
       WHERE collaboration_id = ? 
       ORDER BY created_at DESC`,
      [collaborationId]
    );

    // Parse JSON data
    const processedReport = {
      ...report,
      report_data: typeof report.report_data === 'string' 
        ? JSON.parse(report.report_data) 
        : report.report_data,
      activities,
      contacts
    };

    res.json({
      success: true,
      data: processedReport
    });

  } catch (error) {
    console.error('Error fetching collaboration details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch collaboration details',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/collaboration/admin/statistics - Get dashboard statistics
router.get('/admin/statistics', async (req, res) => {
  try {
    const [recentStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_reports,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 END) as this_month,
        COUNT(CASE WHEN status IN ('new', 'under_review') THEN 1 END) as pending_review,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN priority = 'urgent' THEN 1 END) as urgent_priority
      FROM collaboration_reports
    `);

    const [followUpStats] = await pool.execute(`
      SELECT 
        COUNT(CASE WHEN follow_up_date < CURDATE() AND status NOT IN ('completed', 'declined') THEN 1 END) as overdue,
        COUNT(CASE WHEN follow_up_date = CURDATE() THEN 1 END) as due_today,
        COUNT(CASE WHEN follow_up_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 END) as due_this_week
      FROM collaboration_reports
    `);

    const [statusBreakdown] = await pool.execute(`
      SELECT status, COUNT(*) as count
      FROM collaboration_reports
      GROUP BY status
    `);

    const [flowTypeBreakdown] = await pool.execute(`
      SELECT flow_type, COUNT(*) as count
      FROM collaboration_reports
      GROUP BY flow_type
    `);

    res.json({
      success: true,
      data: {
        recentStats: recentStats[0],
        followUpStats: followUpStats[0],
        statusBreakdown,
        flowTypeBreakdown
      }
    });

  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
module.exports = { debugQuery, safeExecute };

module.exports = router;