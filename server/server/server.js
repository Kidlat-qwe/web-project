const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 8000;

// Enable CORS for all origins during development
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Needed for cloud-based databases
  },
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL!"))
  .catch(err => console.error("❌ Database connection error:", err));

module.exports = pool;

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  if (req.body) console.log('Request body:', req.body);
  next();
});

// Get all students
app.get('/students', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        student_id as id,
        last_name,
        first_name,
        middle_name,
        gender,
        TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth,
        phone,
        address,
        grade_level,
        TO_CHAR(enrollment_date, 'YYYY-MM-DD') as enrollment_date
      FROM students 
      ORDER BY student_id DESC
    `);
    
    console.log('Sending students data:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Add student endpoint
app.post('/addStudent', async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      middle_name,
      gender,
      date_of_birth,
      phone,
      address,
      grade_level,
      enrollment_date
    } = req.body;

    console.log('Received student data:', req.body); // Debug log

    const result = await pool.query(
      `INSERT INTO students 
       (first_name, last_name, middle_name, gender, date_of_birth, 
        phone, address, grade_level, enrollment_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING 
         student_id,
         last_name,
         first_name,
         middle_name,
         gender,
         TO_CHAR(date_of_birth, 'YYYY-MM-DD') as date_of_birth,
         phone,
         address,
         grade_level,
         TO_CHAR(enrollment_date, 'YYYY-MM-DD') as enrollment_date`,
      [
        first_name,
        last_name,
        middle_name || '',
        gender,
        date_of_birth,
        phone || '',
        address || '',
        grade_level || 0,
        enrollment_date || new Date().toISOString()
      ]
    );
    
    console.log('Inserted student:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error details:', error); // Detailed error log
    res.status(500).json({ 
      error: 'Failed to add student',
      details: error.message,
      hint: error.hint
    });
  }
});

// Teachers
app.get('/teachers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        teacher_id,
        last_name,
        first_name,
        middle_name,
        gender,
        email,
        phone,
        department,
        TO_CHAR(hire_date, 'YYYY-MM-DD') as hire_date,
        status
      FROM teachers 
      ORDER BY teacher_id DESC
    `);
    console.log('Sending teachers data:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

app.post('/addTeacher', async (req, res) => {
  try {
    console.log('Received teacher data:', req.body);

    const requiredFields = ['first_name', 'last_name', 'gender', 'department', 'hire_date'];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        throw new Error(`Missing required field: ${field}`);
      }
    }

    // Match the exact column names and types from your database schema
    const result = await pool.query(
      `INSERT INTO teachers 
       (first_name, last_name, middle_name, gender, email, 
        phone, department, hire_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'Active')
       RETURNING *`,
      [
        req.body.first_name.substring(0, 50),
        req.body.last_name.substring(0, 50),
        req.body.middle_name?.substring(0, 50) || null,
        req.body.gender.substring(0, 10),
        req.body.email?.substring(0, 100) || null,
        req.body.phone?.substring(0, 15) || null,
        req.body.department.substring(0, 50),
        req.body.hire_date || new Date().toISOString().split('T')[0] // Use provided date or current date
      ]
    );

    console.log('Database response:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(500).json({
      error: 'Failed to add teacher',
      details: error.message,
      hint: error.hint
    });
  }
});

app.delete('/deleteTeacher/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM teachers WHERE teacher_id = $1', [id]);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
});

// Classes
app.get('/classes', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, t.last_name as teacher_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.teacher_id
      ORDER BY c.class_id DESC
    `);
    
    console.log('Sending classes data:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

app.post('/addClass', async (req, res) => {
  try {
    console.log('Received class data:', req.body);

    const { class_name, teacher_id, room_number, schedule_time, max_capacity } = req.body;
    
    // Validate required fields
    if (!class_name || !teacher_id || !room_number || !schedule_time || !max_capacity) {
      throw new Error('All fields are required');
    }

    // Validate teacher_id exists
    const teacherExists = await pool.query(
      'SELECT teacher_id FROM teachers WHERE teacher_id = $1',
      [teacher_id]
    );

    if (teacherExists.rows.length === 0) {
      throw new Error(`Teacher with ID ${teacher_id} does not exist`);
    }

    const result = await pool.query(
      `INSERT INTO classes 
       (class_name, teacher_id, room_number, schedule_time, max_capacity)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        class_name,
        parseInt(teacher_id),
        room_number,
        schedule_time,
        parseInt(max_capacity)
      ]
    );

    console.log('Added class:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding class:', error);
    res.status(500).json({
      error: 'Failed to add class',
      details: error.message,
      hint: error.hint
    });
  }
});

// Grades
app.get('/grades', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        grade_id,
        student_id,
        class_id,
        first_quarter,
        second_quarter,
        third_quarter,
        fourth_quarter,
        TO_CHAR(grade_date, 'YYYY-MM-DD') as grade_date
      FROM grades 
      ORDER BY grade_id DESC
    `);

    const formattedGrades = result.rows;
    console.log('Sending grades data:', formattedGrades);
    res.json(formattedGrades);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

app.post('/grades', async (req, res) => {
  try {
    const { student_id, class_id, quarter, grade, grade_date } = req.body;
    console.log('Received grade data:', req.body);

    // Map quarter to column name
    const quarterMap = {
      '1st': 'first_quarter',
      '2nd': 'second_quarter',
      '3rd': 'third_quarter',
      '4th': 'fourth_quarter'
    };

    const columnName = quarterMap[quarter];

    // Check for existing grade record
    const existingGrade = await pool.query(
      'SELECT * FROM grades WHERE student_id = $1 AND class_id = $2',
      [student_id, class_id]
    );

    let result;
    if (existingGrade.rows.length > 0) {
      // Update existing grade
      result = await pool.query(
        `UPDATE grades 
         SET ${columnName} = $1, 
             grade_date = $2
         WHERE student_id = $3 AND class_id = $4
         RETURNING *`,
        [grade, grade_date, student_id, class_id]
      );
    } else {
      // Insert new grade
      const columns = ['student_id', 'class_id', columnName, 'grade_date'];
      const values = [student_id, class_id, grade, grade_date];
      
      result = await pool.query(
        `INSERT INTO grades (${columns.join(', ')})
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        values
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Failed to process grade',
      details: error.message
    });
  }
});

// Attendance
app.get('/attendance', async (req, res) => {
  try {
    console.log('Fetching attendance records...');
    const result = await pool.query(`
      SELECT 
        a.attendance_id,
        a.student_id,
        a.class_id,
        a.status,
        TO_CHAR(a.attendance_date, 'YYYY-MM-DD') as attendance_date
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.student_id
      LEFT JOIN classes c ON a.class_id = c.class_id
      ORDER BY a.attendance_date DESC, a.attendance_id DESC
    `);
    console.log('Attendance records fetched:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in GET /attendance:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records', details: error.message });
  }
});

app.post('/attendance', async (req, res) => {
  try {
    console.log('Adding attendance record:', req.body);
    const { student_id, class_id, status, attendance_date } = req.body;
    
    if (!student_id || !class_id || !status || !attendance_date) {
      throw new Error('Missing required fields');
    }

    // Validate student exists
    const studentExists = await pool.query(
      'SELECT student_id FROM students WHERE student_id = $1',
      [student_id]
    );

    if (studentExists.rows.length === 0) {
      throw new Error(`Student with ID ${student_id} does not exist`);
    }

    // Validate class exists
    const classExists = await pool.query(
      'SELECT class_id FROM classes WHERE class_id = $1',
      [class_id]
    );

    if (classExists.rows.length === 0) {
      throw new Error(`Class with ID ${class_id} does not exist`);
    }

    // Check if attendance record already exists for this student, class, and date
    const existingRecord = await pool.query(
      `SELECT attendance_id FROM attendance 
       WHERE student_id = $1 AND class_id = $2 AND attendance_date = $3`,
      [student_id, class_id, attendance_date]
    );

    if (existingRecord.rows.length > 0) {
      throw new Error('Attendance record already exists for this student, class, and date');
    }

    const result = await pool.query(
      `INSERT INTO attendance 
       (student_id, class_id, status, attendance_date)
       VALUES ($1, $2, $3, $4)
       RETURNING 
         attendance_id,
         student_id,
         class_id,
         status,
         TO_CHAR(attendance_date, 'YYYY-MM-DD') as attendance_date`,
      [
        parseInt(student_id),
        parseInt(class_id),
        status,
        attendance_date
      ]
    );

    // Fetch the complete record with student and class names
    const completeRecord = await pool.query(`
      SELECT 
        a.attendance_id,
        a.student_id,
        s.first_name || ' ' || s.last_name as student_name,
        a.class_id,
        c.class_name,
        a.status,
        TO_CHAR(a.attendance_date, 'YYYY-MM-DD') as attendance_date
      FROM attendance a
      LEFT JOIN students s ON a.student_id = s.student_id
      LEFT JOIN classes c ON a.class_id = c.class_id
      WHERE a.attendance_id = $1
    `, [result.rows[0].attendance_id]);

    console.log('Attendance record added:', completeRecord.rows[0]);
    res.status(201).json(completeRecord.rows[0]);
  } catch (error) {
    console.error('Error in POST /attendance:', error);
    res.status(500).json({ 
      error: 'Failed to add attendance record', 
      details: error.message 
    });
  }
});

// Departments
app.get('/departments', async (req, res) => {
  try {
    console.log('Fetching departments...');
    const result = await pool.query(`
      SELECT 
        department_id,
        department_name,
        head_teacher_id,
        office_location,
        contact_email
      FROM departments 
      ORDER BY department_id DESC
    `);
    console.log('Departments fetched:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Error in GET /departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments', details: error.message });
  }
});

app.post('/departments', async (req, res) => {
  try {
    console.log('Adding department:', req.body);
    const { department_name, head_teacher_id, office_location, contact_email } = req.body;
    
    if (!department_name) {
      throw new Error('Department name is required');
    }

    // Validate head teacher exists if provided
    if (head_teacher_id) {
      const teacherExists = await pool.query(
        'SELECT teacher_id FROM teachers WHERE teacher_id = $1',
        [head_teacher_id]
      );

      if (teacherExists.rows.length === 0) {
        throw new Error(`Teacher with ID ${head_teacher_id} does not exist`);
      }
    }

    const result = await pool.query(
      `INSERT INTO departments 
       (department_name, head_teacher_id, office_location, contact_email)
       VALUES ($1, $2, $3, $4)
       RETURNING 
         department_id,
         department_name,
         head_teacher_id,
         office_location,
         contact_email`,
      [department_name, head_teacher_id, office_location, contact_email]
    );

    console.log('Department added:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in POST /departments:', error);
    res.status(500).json({ 
      error: 'Failed to add department', 
      details: error.message 
    });
  }
});

// Courses
app.get('/courses', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        course_id,
        course_name,
        department_id,
        credits,
        description
      FROM courses 
      ORDER BY course_id DESC
    `);
    console.log('Sending courses data:', result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

app.post('/courses', async (req, res) => {
  try {
    console.log('Adding course:', req.body);
    const { course_name, department_id, credits, description } = req.body;
    
    if (!course_name || !department_id || !credits) {
      throw new Error('Course name, department ID, and credits are required');
    }

    // Validate department exists
    const departmentExists = await pool.query(
      'SELECT department_id FROM departments WHERE department_id = $1',
      [department_id]
    );

    if (departmentExists.rows.length === 0) {
      throw new Error(`Department with ID ${department_id} does not exist`);
    }

    const result = await pool.query(
      `INSERT INTO courses 
       (course_name, department_id, credits, description)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [course_name, department_id, credits, description]
    );

    console.log('Course added:', result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error in POST /courses:', error);
    res.status(500).json({ 
      error: 'Failed to add course', 
      details: error.message 
    });
  }
});

// Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Backend is connected!' });
});

// Add this DELETE endpoint for students
app.delete('/students/:id', async (req, res) => {
  try {
    console.log('Attempting to delete student with ID:', req.params.id);
    
    // First check if student exists
    const checkStudent = await pool.query(
      'SELECT student_id FROM students WHERE student_id = $1',
      [req.params.id]
    );

    if (checkStudent.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Check for foreign key constraints (grades, attendance, etc.)
    // Delete related records first if they exist
    await pool.query('DELETE FROM grades WHERE student_id = $1', [req.params.id]);
    await pool.query('DELETE FROM attendance WHERE student_id = $1', [req.params.id]);

    // Now delete the student
    const result = await pool.query(
      'DELETE FROM students WHERE student_id = $1 RETURNING *',
      [req.params.id]
    );

    console.log('Student deleted successfully:', result.rows[0]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ 
      error: 'Failed to delete student',
      details: error.message,
      hint: error.hint
    });
  }
});

// Delete teacher endpoint
app.delete('/teachers/:id', async (req, res) => {
  try {
    console.log('Attempting to delete teacher with ID:', req.params.id);
    
    // Check if teacher exists
    const checkTeacher = await pool.query(
      'SELECT teacher_id FROM teachers WHERE teacher_id = $1',
      [req.params.id]
    );

    if (checkTeacher.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Delete related records first (classes taught by this teacher)
    await pool.query('UPDATE classes SET teacher_id = NULL WHERE teacher_id = $1', [req.params.id]);
    await pool.query('UPDATE departments SET head_teacher_id = NULL WHERE head_teacher_id = $1', [req.params.id]);

    // Delete the teacher
    const result = await pool.query(
      'DELETE FROM teachers WHERE teacher_id = $1 RETURNING *',
      [req.params.id]
    );

    console.log('Teacher deleted successfully:', result.rows[0]);
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ 
      error: 'Failed to delete teacher',
      details: error.message,
      hint: error.hint
    });
  }
});

// Delete class endpoint
app.delete('/classes/:id', async (req, res) => {
  try {
    console.log('Attempting to delete class with ID:', req.params.id);
    
    // Check if class exists
    const checkClass = await pool.query(
      'SELECT class_id FROM classes WHERE class_id = $1',
      [req.params.id]
    );

    if (checkClass.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Delete related records first
    await pool.query('DELETE FROM grades WHERE class_id = $1', [req.params.id]);
    await pool.query('DELETE FROM attendance WHERE class_id = $1', [req.params.id]);

    // Delete the class
    const result = await pool.query(
      'DELETE FROM classes WHERE class_id = $1 RETURNING *',
      [req.params.id]
    );

    console.log('Class deleted successfully:', result.rows[0]);
    res.json({ message: 'Class deleted successfully' });
  } catch (error) {
    console.error('Error deleting class:', error);
    res.status(500).json({ 
      error: 'Failed to delete class',
      details: error.message,
      hint: error.hint
    });
  }
});

// Delete grade endpoint
app.delete('/grades/:id', async (req, res) => {
  try {
    console.log('Attempting to delete grade with ID:', req.params.id);
    
    // Check if grade exists
    const checkGrade = await pool.query(
      'SELECT grade_id FROM grades WHERE grade_id = $1',
      [req.params.id]
    );

    if (checkGrade.rows.length === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    // Delete the grade
    const result = await pool.query(
      'DELETE FROM grades WHERE grade_id = $1 RETURNING *',
      [req.params.id]
    );

    console.log('Grade deleted successfully:', result.rows[0]);
    res.json({ message: 'Grade deleted successfully' });
  } catch (error) {
    console.error('Error deleting grade:', error);
    res.status(500).json({ 
      error: 'Failed to delete grade',
      details: error.message,
      hint: error.hint
    });
  }
});

// Delete attendance endpoint
app.delete('/attendance/:id', async (req, res) => {
  try {
    console.log('Attempting to delete attendance record with ID:', req.params.id);
    
    // Check if attendance record exists
    const checkAttendance = await pool.query(
      'SELECT attendance_id FROM attendance WHERE attendance_id = $1',
      [req.params.id]
    );

    if (checkAttendance.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    // Delete the attendance record
    const result = await pool.query(
      'DELETE FROM attendance WHERE attendance_id = $1 RETURNING *',
      [req.params.id]
    );

    console.log('Attendance record deleted successfully:', result.rows[0]);
    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({ 
      error: 'Failed to delete attendance record',
      details: error.message,
      hint: error.hint
    });
  }
});

// Delete department endpoint
app.delete('/departments/:id', async (req, res) => {
  try {
    console.log('Attempting to delete department with ID:', req.params.id);
    
    // Check if department exists
    const checkDepartment = await pool.query(
      'SELECT department_id FROM departments WHERE department_id = $1',
      [req.params.id]
    );

    if (checkDepartment.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    // Update related courses to remove department reference
    await pool.query('UPDATE courses SET department_id = NULL WHERE department_id = $1', [req.params.id]);

    // Delete the department
    const result = await pool.query(
      'DELETE FROM departments WHERE department_id = $1 RETURNING *',
      [req.params.id]
    );

    console.log('Department deleted successfully:', result.rows[0]);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    res.status(500).json({ 
      error: 'Failed to delete department',
      details: error.message,
      hint: error.hint
    });
  }
});

// Delete course endpoint
app.delete('/courses/:id', async (req, res) => {
  try {
    console.log('Attempting to delete course with ID:', req.params.id);
    
    // Check if course exists
    const checkCourse = await pool.query(
      'SELECT course_id FROM courses WHERE course_id = $1',
      [req.params.id]
    );

    if (checkCourse.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Delete the course
    const result = await pool.query(
      'DELETE FROM courses WHERE course_id = $1 RETURNING *',
      [req.params.id]
    );

    console.log('Course deleted successfully:', result.rows[0]);
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ 
      error: 'Failed to delete course',
      details: error.message,
      hint: error.hint
    });
  }
});

// Update student endpoint
app.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Updating student:', id);
    console.log('Update data:', updates);

    if (!updates.first_name || !updates.last_name) {
      return res.status(400).json({ error: 'First name and last name are required' });
    }

    const result = await pool.query(
      `UPDATE students 
       SET first_name = $1, 
           last_name = $2,
           middle_name = $3,
           gender = $4,
           date_of_birth = $5,
           phone = $6,
           address = $7,
           grade_level = $8,
           enrollment_date = $9,
           status = $10
       WHERE student_id = $11
       RETURNING *`,  
      [
        updates.first_name,
        updates.last_name,
        updates.middle_name,
        updates.gender,
        updates.date_of_birth,
        updates.phone,
        updates.address,
        updates.grade_level,
        updates.enrollment_date,
        updates.status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ 
      error: 'Failed to update student',
      details: error.message
    });
  }
});

// Update grades endpoint
app.put('/grades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!updates.student_id || !updates.class_id) {
      return res.status(400).json({ error: 'Student ID and Class ID are required' });
    }

    const result = await pool.query(
      `UPDATE grades 
       SET student_id = $1,
           class_id = $2,
           first_quarter = $3,
           second_quarter = $4,
           third_quarter = $5,
           fourth_quarter = $6,
           grade_date = $7
       WHERE grade_id = $8
       RETURNING *`,
      [
        updates.student_id,
        updates.class_id,
        updates.first_quarter,
        updates.second_quarter,
        updates.third_quarter,
        updates.fourth_quarter,
        updates.grade_date,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating grade:', error);
    res.status(500).json({ 
      error: 'Failed to update grade',
      details: error.message
    });
  }
});

// Update attendance endpoint
app.put('/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    if (!updates.student_id || !updates.class_id || !updates.attendance_date) {
      return res.status(400).json({ error: 'Student ID, Class ID, and Attendance Date are required' });
    }

    const result = await pool.query(
      `UPDATE attendance 
       SET student_id = $1,
           class_id = $2,
           attendance_date = $3,
           status = $4
       WHERE attendance_id = $5
       RETURNING *`,
      [
        updates.student_id,
        updates.class_id,
        updates.attendance_date,
        updates.status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ 
      error: 'Failed to update attendance',
      details: error.message
    });
  }
});

// Add these endpoints to handle API requests
app.get('/api/students', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM students ORDER BY student_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

app.get('/api/teachers', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teachers ORDER BY teacher_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
});

app.get('/api/grades', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grades ORDER BY grade_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching grades:', error);
    res.status(500).json({ error: 'Failed to fetch grades' });
  }
});

app.get('/api/classes', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes ORDER BY class_id');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// Add individual record endpoints
app.get('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM ${table} WHERE ${table.slice(0, -1)}_id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error fetching ${table} record:`, error);
    res.status(500).json({ error: `Failed to fetch ${table} record` });
  }
});

// Add update endpoint
app.put('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  const updates = req.body;
  
  try {
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(
      `UPDATE ${table} 
       SET ${setClause} 
       WHERE ${table.slice(0, -1)}_id = $${values.length} 
       RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error(`Error updating ${table} record:`, error);
    res.status(500).json({ error: `Failed to update ${table} record` });
  }
});

// Add delete endpoint
app.delete('/api/:table/:id', async (req, res) => {
  const { table, id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM ${table} WHERE ${table.slice(0, -1)}_id = $1 RETURNING *`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Record not found' });
    }
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    console.error(`Error deleting ${table} record:`, error);
    res.status(500).json({ error: `Failed to delete ${table} record` });
  }
});

// Add these PUT endpoints for each table

// Update teacher
app.put('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const result = await pool.query(
      `UPDATE teachers 
       SET first_name = $1, 
           last_name = $2,
           middle_name = $3,
           gender = $4,
           email = $5,
           phone = $6,
           department = $7,
           hire_date = $8,
           status = $9
       WHERE teacher_id = $10
       RETURNING *`,
      [
        updates.first_name,
        updates.last_name,
        updates.middle_name,
        updates.gender,
        updates.email,
        updates.phone,
        updates.department,
        updates.hire_date,
        updates.status,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
});

// Update class
app.put('/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const result = await pool.query(
      `UPDATE classes 
       SET class_name = $1,
           teacher_id = $2,
           room_number = $3,
           schedule_time = $4,
           max_capacity = $5
       WHERE class_id = $6
       RETURNING *`,
      [
        updates.class_name,
        updates.teacher_id,
        updates.room_number,
        updates.schedule_time,
        updates.max_capacity,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating class:', error);
    res.status(500).json({ error: 'Failed to update class' });
  }
});

// Update department endpoint
app.put('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Updating department:', id);
    console.log('Update data:', updates);

    if (!updates.department_name) {
      return res.status(400).json({ error: 'Department name is required' });
    }

    const result = await pool.query(
      `UPDATE departments 
       SET department_name = $1,
           head_teacher_id = $2,
           office_location = $3,
           contact_email = $4
       WHERE department_id = $5
       RETURNING *`,
      [
        updates.department_name,
        updates.head_teacher_id,
        updates.office_location,
        updates.contact_email,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    console.log('Department updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating department:', error);
    res.status(500).json({ 
      error: 'Failed to update department',
      details: error.message,
      hint: error.hint
    });
  }
});

// Update course endpoint
app.put('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    console.log('Updating course:', id);
    console.log('Update data:', updates);

    if (!updates.course_name) {
      return res.status(400).json({ error: 'Course name is required' });
    }

    const result = await pool.query(
      `UPDATE courses 
       SET course_name = $1,
           department_id = $2,
           credits = $3,
           description = $4
       WHERE course_id = $5
       RETURNING *`,
      [
        updates.course_name,
        updates.department_id,
        updates.credits,
        updates.description,
        id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    console.log('Course updated successfully:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ 
      error: 'Failed to update course',
      details: error.message,
      hint: error.hint
    });
  }
});

// Add PATCH endpoints for partial updates

// Patch student endpoint
app.patch('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Build dynamic SET clause based on provided fields
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const query = `
      UPDATE students 
      SET ${setClause} 
      WHERE student_id = $${values.length}
      RETURNING *`;
    
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error patching student:', error);
    res.status(500).json({ 
      error: 'Failed to update student',
      details: error.message 
    });
  }
});

// Patch teacher endpoint
app.patch('/teachers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(`
      UPDATE teachers 
      SET ${setClause} 
      WHERE teacher_id = $${values.length}
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error patching teacher:', error);
    res.status(500).json({ 
      error: 'Failed to update teacher',
      details: error.message 
    });
  }
});

// Patch class endpoint
app.patch('/classes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(`
      UPDATE classes 
      SET ${setClause} 
      WHERE class_id = $${values.length}
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Class not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error patching class:', error);
    res.status(500).json({ 
      error: 'Failed to update class',
      details: error.message 
    });
  }
});

// Patch grade endpoint
app.patch('/grades/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(`
      UPDATE grades 
      SET ${setClause} 
      WHERE grade_id = $${values.length}
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Grade not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error patching grade:', error);
    res.status(500).json({ 
      error: 'Failed to update grade',
      details: error.message 
    });
  }
});

// Patch attendance endpoint
app.patch('/attendance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(`
      UPDATE attendance 
      SET ${setClause} 
      WHERE attendance_id = $${values.length}
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error patching attendance:', error);
    res.status(500).json({ 
      error: 'Failed to update attendance',
      details: error.message 
    });
  }
});

// Patch department endpoint
app.patch('/departments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(`
      UPDATE departments 
      SET ${setClause} 
      WHERE department_id = $${values.length}
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Department not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error patching department:', error);
    res.status(500).json({ 
      error: 'Failed to update department',
      details: error.message 
    });
  }
});

// Patch course endpoint
app.patch('/courses/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const setClause = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 1}`)
      .join(', ');
    
    const values = [...Object.values(updates), id];
    
    const result = await pool.query(`
      UPDATE courses 
      SET ${setClause} 
      WHERE course_id = $${values.length}
      RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error patching course:', error);
    res.status(500).json({ 
      error: 'Failed to update course',
      details: error.message 
    });
  }
});

// Add a test connection function
const testDatabaseConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Successfully connected to the database');
    client.release();
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
};

// Modify the server startup
app.listen(port, async () => {
  try {
    await testDatabaseConnection();
    console.log(`Server running on http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log(`- GET  http://localhost:${port}/students`);
    console.log(`- POST http://localhost:${port}/addStudent`);
    console.log(`- GET  http://localhost:${port}/test`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
}); 
