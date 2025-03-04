import React, { useState, useEffect } from "react";
import axios from 'axios';
import "./App.css";
import "./styles.css";
import { useNavigate, useLocation } from 'react-router-dom';
import Dashboard from './components/Dashboard';


const App = () => {
  const [students, setStudents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showAddRecord, setShowAddRecord] = useState(false);
  
  // Add new state for search
  const [searchTerm, setSearchTerm] = useState("");
  
  // Update API_URL to match server port
  const API_BASE_URL = 'http://localhost:8000';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeDB, setActiveDB] = useState('school'); // 'school', 'academic', or 'admin'
  const [activeTable, setActiveTable] = useState('students');
  const [isDropdownOpen, setIsDropdownOpen] = useState({
    school: false,
    academic: false,
    admin: false,
    settings: false
  });

  // Add states for teachers and classes  
  const [teachers, setTeachers] = useState([]);

  const [classes, setClasses] = useState([]);

  // Add grades state
  const [grades, setGrades] = useState([]);

  // Add attendance state
  const [attendance, setAttendance] = useState([]);

  // Add these states for the dashboard
  const [showDashboard, setShowDashboard] = useState(true);


  // Add state for confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Add state for departments
  const [departments, setDepartments] = useState([]);

  // Add state for courses
  const [courses, setCourses] = useState([
  ]);

  // Add this state for tracking selected records
  const [selectedRecords, setSelectedRecords] = useState([]);

  // Add this state for editing
  const [editingGrade, setEditingGrade] = useState(null);

  // Add these states for editing
  const [editingRecord, setEditingRecord] = useState(null);
  const [showEditForm, setShowEditForm] = useState(false);

  // Add this function at the top level of your App component
  const getStudentNameById = (studentId) => {
    const student = students.find(s => (s.student_id || s.id) === studentId);
    if (student) {
      return `${student.first_name} ${student.last_name}`;
    }
    return 'Unknown Student';
  };

  // Add this function next to getStudentNameById
  const getClassNameById = (classId) => {
    const classItem = classes.find(c => c.class_id === classId);
    if (classItem) {
      return `${classItem.class_name}`;
    }
    return 'Unknown Class';
  };

  // Add this function next to getStudentNameById and getClassNameById
  const getTeacherNameById = (teacherId) => {
    const teacher = teachers.find(t => t.teacher_id === teacherId);
    if (teacher) {
      return `${teacher.first_name} ${teacher.last_name}`;
    }
    return 'Unknown Teacher';
  };

  // Add this function next to other getter functions
  const getDepartmentNameById = (departmentId) => {
    const department = departments.find(d => d.department_id === departmentId);
    if (department) {
      return `${department.department_name}`;
    }
    return 'Unknown Department';
  };

  // Update the AddRecordForm component
  const AddRecordForm = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      middle_name: '',
      gender: 'Male',
      date_of_birth: '',
      phone: '',
      address: '',
      grade_level: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      status: 'Active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Add New Student</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label htmlFor="first_name">First Name*</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label htmlFor="last_name">Last Name*</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label htmlFor="middle_name">Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label htmlFor="gender">Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="prompt-field">
              <label htmlFor="date_of_birth">Date of Birth*</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label htmlFor="phone">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label htmlFor="address">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label htmlFor="grade_level">Grade Level</label>
              <input
                type="number"
                name="grade_level"
                min="1"
                max="12"
                value={formData.grade_level}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label htmlFor="enrollment_date">Enrollment Date*</label>
              <input
                type="date"
                name="enrollment_date"
                value={formData.enrollment_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label htmlFor="status">Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Transferred">Transferred</option>
                <option value="Graduated">Graduated</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Update the AddTeacherForm component
  const AddTeacherForm = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      first_name: '',
      last_name: '',
      middle_name: '',
      gender: 'Male',
      email: '',
      phone: '',
      department: '',
      hire_date: new Date().toISOString().split('T')[0],
      status: 'Active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <form onSubmit={handleSubmit} className="prompt-form">
            <div className="prompt-field">
              <label>First Name*</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Last Name*</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </div>

            <div className="prompt-field">
              <label>Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="prompt-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div className="prompt-field">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            <div className="prompt-field">
              <label>Department*</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Hire Date*</label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                required
                style={{ backgroundColor: '#e9ecef' }}
              />
            </div>

            <div className="prompt-field">
              <label>Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Retired">Retired</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>

            <div className="button-container">
              <button type="submit" className="save-button">Save</button>
              <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add these styles
  const styles = `
    .prompt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .prompt-modal {
      background: white;
      padding: 20px;
      border-radius: 5px;
      width: 400px;
    }

    .prompt-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .prompt-field {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .prompt-field label {
      font-weight: normal;
      color: #000;
    }

    .prompt-field input,
    .prompt-field select {
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 14px;
    }

    .button-container {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-top: 20px;
    }

    .save-button {
      background: #dc3545;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 4px;
      cursor: pointer;
    }

    .cancel-button {
      background: #6c757d;
      color: white;
      border: none;
      padding: 8px 20px;
      border-radius: 4px;
      cursor: pointer;
    }

    .prompt-field input[type="email"],
    .prompt-field input[type="text"][name="phone"] {
      background-color: #e9ecef;
    }
  `;

  // Handler functions
  const navigate = useNavigate();
  const location = useLocation();

  const handleDashboard = () => {
    setShowDashboard(true);
    navigate('/dashboard');
  };

  const handleSignOut = () => {
    setShowConfirmDialog(true);
  };

  const confirmSignOut = () => {
    localStorage.removeItem('userToken');
    navigate('/login');
  };

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:8000/students');
      console.log('Raw student data:', response.data); // Debug log
      if (response.data) {
        setStudents(response.data);
        setError(null);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to fetch students');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTableSelect = async (db, table) => {
    setShowDashboard(false);
    setActiveDB(db);
    setActiveTable(table);
    setIsLoading(true);
    
    try {
      let response;
      switch (table) {
        case 'students':
          response = await axios.get(`${API_BASE_URL}/students`);
          setStudents(response.data);
          break;
        case 'teachers':
          response = await axios.get(`${API_BASE_URL}/teachers`);
          setTeachers(response.data);
          break;
        case 'classes':
          response = await axios.get(`${API_BASE_URL}/classes`);
          setClasses(response.data);
          break;
        case 'grades':
          response = await axios.get(`${API_BASE_URL}/grades`);
          setGrades(response.data);
          break;
        case 'attendance':
          response = await axios.get(`${API_BASE_URL}/attendance`);
          setAttendance(response.data);
          break;
        case 'departments':
          response = await axios.get(`${API_BASE_URL}/departments`);
          setDepartments(response.data);
          break;
        case 'courses':
          response = await axios.get(`${API_BASE_URL}/courses`);
          setCourses(response.data);
          break;
        default:
          response = await axios.get(`${API_BASE_URL}/api/${table}`);
      }
      console.log(`Fetched ${table} data:`, response.data);
      setFilteredData(response.data);
      setError(null);
    } catch (error) {
      console.error(`Error fetching ${table}:`, error);
      setError(`Failed to fetch ${table}: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
    
    navigate(`/${table}`);
  };
  
  const handleRefresh = async () => {
    try {
      let response;
      switch (activeTable) {
        case 'students':
          response = await axios.get(`${API_BASE_URL}/students`);
          setStudents(response.data);
          setFilteredData(response.data);
          break;
        case 'teachers':
          response = await axios.get(`${API_BASE_URL}/teachers`);
          setTeachers(response.data);
          setFilteredData(response.data);
          break;
        case 'classes':
          response = await axios.get(`${API_BASE_URL}/classes`);
          setClasses(response.data);
          setFilteredData(response.data);
          break;
        case 'grades':
          response = await axios.get(`${API_BASE_URL}/grades`);
          setGrades(response.data);
          setFilteredData(response.data);
          break;
        case 'attendance':
          response = await axios.get(`${API_BASE_URL}/attendance`);
          setAttendance(response.data);
          setFilteredData(response.data);
          break;
        case 'departments':
          response = await axios.get(`${API_BASE_URL}/departments`);
          setDepartments(response.data);
          setFilteredData(response.data);
          break;
        case 'courses':
          response = await axios.get(`${API_BASE_URL}/courses`);
          setCourses(response.data);
          setFilteredData(response.data);
          break;
        default:
          response = await axios.get(`${API_BASE_URL}/api/${activeTable}`);
      }
      console.log(`Refreshed ${activeTable} data:`, response.data);
      setError(null);
    } catch (error) {
      console.error(`Error refreshing ${activeTable} data:`, error);
      setError(`Failed to refresh ${activeTable} data`);
    }
  };

  const handleAddRecord = async (formData) => {
    try {
      console.log('Sending data:', formData); // Debug log
      
      // Format dates properly
      const processedData = {
        ...formData,
        date_of_birth: formData.date_of_birth ? new Date(formData.date_of_birth).toISOString().split('T')[0] : null,
        enrollment_date: formData.enrollment_date ? new Date(formData.enrollment_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
      };

      const response = await axios.post('http://localhost:8000/addStudent', processedData);
      
      if (response.data) {
        console.log('Success:', response.data);
        setStudents(prev => [...prev, response.data]);
        setShowAddRecord(false);
        alert('Student added successfully!');
        await fetchStudents(); // Refresh the list
      }
    } catch (error) {
      console.error('Error adding student:', error);
      const errorMessage = error.response?.data?.details || error.message;
      alert(`Failed to add student: ${errorMessage}`);
    }
  };

  // Add this function to handle record selection
  const handleRecordSelection = (id) => {
    setSelectedRecords(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(recordId => recordId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  // Add this function to handle record deletion
  const handleDeleteRecord = async () => {
    if (selectedRecords.length === 0) {
      alert('Please select records to delete');
      return;
    }

    if (!confirm('Are you sure you want to delete the selected records?')) {
      return;
    }

    try {
      for (const id of selectedRecords) {
        const response = await axios.delete(`${API_BASE_URL}/${activeTable}/${id}`);
        if (response.status === 200) {
          console.log(`Successfully deleted ${activeTable} record with ID: ${id}`);
        }
      }

      // Refresh the data after deletion
      switch (activeTable) {
        case 'students':
          await fetchStudents();
          break;
        case 'teachers':
          await fetchTeachers();
          break;
        case 'classes':
          await fetchClasses();
          break;
        case 'departments':
          await fetchDepartments();
          break;
        case 'courses':
          await fetchCourses();
          break;
        case 'grades':
          await fetchGrades();
          break;
        case 'attendance':
          await fetchAttendance();
          break;
      }

      setSelectedRecords([]); // Clear selection after deletion
      alert('Selected records deleted successfully');
    } catch (error) {
      console.error('Error deleting records:', error);
      alert(`Failed to delete records: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleExportData = async () => {
    try {
      const csvContent = "data:text/csv;charset=utf-8," + 
        "ID,Last Name,First Name,Middle Name,Gender,Date of Birth,Phone,Address,Grade,Enrollment Date\n" +
        students.map(student => 
          Object.values(student).join(",")
        ).join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "students_data.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data');
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Add filtered data functions for each table type
  const getFilteredData = () => {
    const searchQuery = searchTerm.toLowerCase();
    
    switch (activeTable) {
      case 'students':
        return students.filter(student => 
          student.student_id?.toString().toLowerCase().includes(searchQuery) ||
          student.id?.toString().toLowerCase().includes(searchQuery)  // Adding this for backward compatibility
        );
      
      case 'teachers':
        return teachers.filter(teacher => 
          teacher.teacher_id?.toString().toLowerCase().includes(searchQuery)
        );
      
      case 'classes':
        return classes.filter(class_item => 
          class_item.class_id?.toString().toLowerCase().includes(searchQuery)
        );
      
      case 'grades':
        return grades.filter(grade => 
          grade.grade_id?.toString().toLowerCase().includes(searchQuery)
        );
      
      case 'attendance':
        return attendance.filter(record => 
          record.attendance_id?.toString().toLowerCase().includes(searchQuery)
        );
      
      case 'departments':
        return departments.filter(department => 
          department.department_id?.toString().toLowerCase().includes(searchQuery)
        );
      
      case 'courses':
        return courses.filter(course => 
          course.course_id?.toString().toLowerCase().includes(searchQuery)
        );
      
      default:
        return [];
    }
  };

  const toggleDropdown = (db) => {
    setIsDropdownOpen(prev => ({
      ...prev,
      [db]: !prev[db]
    }));
  };

  // Add useEffect to handle initial route
  useEffect(() => {
    const path = location.pathname.substring(1); // Remove leading slash
    if (path === 'dashboard') {
      setShowDashboard(true);
    } else if (path !== '') {
      setShowDashboard(false);
      setActiveTable(path);
      // Set appropriate DB based on table
      if (['students', 'teachers', 'classes'].includes(path)) {
        setActiveDB('school');
      } else if (['grades', 'attendance'].includes(path)) {
        setActiveDB('academic');
      } else if (['departments', 'courses'].includes(path)) {
        setActiveDB('admin');
      }
    }
    fetchStudents();
    fetchTeachers();
    fetchClasses();
    fetchGrades();
    fetchAttendance();
    fetchDepartments();
    fetchCourses();
  }, [location]);

  const renderTableContent = () => {
    const filteredData = getFilteredData();
    
    switch (activeTable) {
      case 'students':
        return (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr>
                <th>Select</th>
                <th>Student ID</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Gender</th>
                <th>Date of Birth</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Grade</th>
                <th>Enrollment Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((student) => (
                <tr key={student.student_id || student.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(student.student_id || student.id)}
                      onChange={() => handleRecordSelection(student.student_id || student.id)}
                    />
                  </td>
                  <td className="student-id-tooltip">
                    {student.student_id || student.id}
                    <div className="tooltip-content">
                      {`${student.first_name} ${student.last_name}`}
                    </div>
                  </td>
                  <td>{student.last_name || '-'}</td>
                  <td>{student.first_name || '-'}</td>
                  <td>{student.middle_name || '-'}</td>
                  <td>{student.gender || '-'}</td>
                  <td>{student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '-'}</td>
                  <td>{student.phone || '-'}</td>
                  <td>{student.address || '-'}</td>
                  <td>{student.grade_level || '-'}</td>
                  <td>{student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : '-'}</td>
                  <td>{student.status || '-'}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(student)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'teachers':
        return (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Teacher ID</th>
                <th>Last Name</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Gender</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Hire Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((teacher) => (
                <tr key={teacher.teacher_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(teacher.teacher_id)}
                      onChange={() => handleRecordSelection(teacher.teacher_id)}
                    />
                  </td>
                  <td>{teacher.teacher_id}</td>
                  <td>{teacher.last_name}</td>
                  <td>{teacher.first_name}</td>
                  <td>{teacher.middle_name}</td>
                  <td>{teacher.gender}</td>
                  <td>{teacher.email}</td>
                  <td>{teacher.phone}</td>
                  <td>{teacher.department}</td>
                  <td>{new Date(teacher.hire_date).toLocaleDateString()}</td>
                  <td>{teacher.status}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(teacher)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'classes':
        return (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Class ID</th>
                <th>Class Name</th>
                <th>Teacher</th>
                <th>Room Number</th>
                <th>Schedule Time</th>
                <th>Max Capacity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((class_item) => (
                <tr key={class_item.class_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(class_item.class_id)}
                      onChange={() => handleRecordSelection(class_item.class_id)}
                    />
                  </td>
                  <td className="student-id-tooltip">
                    {class_item.class_id}
                    <div className="tooltip-content">
                      {class_item.class_name}
                    </div>
                  </td>
                  <td>{class_item.class_name}</td>
                  <td>{class_item.teacher_name || class_item.teacher_id}</td>
                  <td>{class_item.room_number}</td>
                  <td>{class_item.schedule_time}</td>
                  <td>{class_item.max_capacity}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(class_item)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'grades':
        return (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Grade ID</th>
                <th>Student ID</th>
                <th>Class ID</th>
                <th>1st Quarter</th>
                <th>2nd Quarter</th>
                <th>3rd Quarter</th>
                <th>4th Quarter</th>
                <th>Grade Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((grade) => (
                <tr key={grade.grade_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(grade.grade_id)}
                      onChange={() => handleRecordSelection(grade.grade_id)}
                    />
                  </td>
                  <td>{grade.grade_id}</td>
                  <td className="student-id-tooltip">
                    {grade.student_id}
                    <div className="tooltip-content">
                      {getStudentNameById(grade.student_id)}
                    </div>
                  </td>
                  <td className="student-id-tooltip">
                    {grade.class_id}
                    <div className="tooltip-content">
                      {getClassNameById(grade.class_id)}
                    </div>
                  </td>
                  <td>{grade.first_quarter}</td>
                  <td>{grade.second_quarter}</td>
                  <td>{grade.third_quarter}</td>
                  <td>{grade.fourth_quarter}</td>
                  <td>{grade.grade_date}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(grade)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'attendance':
        return (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Attendance ID</th>
                <th>Student ID</th>
                <th>Class ID</th>
                <th>Status</th>
                <th>Attendance Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((attendance) => (
                <tr key={attendance.attendance_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(attendance.attendance_id)}
                      onChange={() => handleRecordSelection(attendance.attendance_id)}
                    />
                  </td>
                  <td>{attendance.attendance_id}</td>
                  <td className="student-id-tooltip">
                    {attendance.student_id}
                    <div className="tooltip-content">
                      {getStudentNameById(attendance.student_id)}
                    </div>
                  </td>
                  <td className="student-id-tooltip">
                    {attendance.class_id}
                    <div className="tooltip-content">
                      {getClassNameById(attendance.class_id)}
                    </div>
                  </td>
                  <td>{attendance.status}</td>
                  <td>{attendance.attendance_date}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(attendance)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'departments':
        return (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Department ID</th>
                <th>Department Name</th>
                <th>Head Teacher ID</th>
                <th>Office Location</th>
                <th>Contact Email</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((department) => (
                <tr key={department.department_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(department.department_id)}
                      onChange={() => handleRecordSelection(department.department_id)}
                    />
                  </td>
                  <td>{department.department_id}</td>
                  <td>{department.department_name}</td>
                  <td className="student-id-tooltip">
                    {department.head_teacher_id}
                    <div className="tooltip-content">
                      {getTeacherNameById(department.head_teacher_id)}
                    </div>
                  </td>
                  <td>{department.office_location || '-'}</td>
                  <td>{department.contact_email || '-'}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(department)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'courses':
        return (
          <table>
            <thead>
              <tr>
                <th>Select</th>
                <th>Course ID</th>
                <th>Course Name</th>
                <th>Department ID</th>
                <th>Credits</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((course) => (
                <tr key={course.course_id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedRecords.includes(course.course_id)}
                      onChange={() => handleRecordSelection(course.course_id)}
                    />
                  </td>
                  <td>{course.course_id}</td>
                  <td>{course.course_name}</td>
                  <td className="student-id-tooltip">
                    {course.department_id}
                    <div className="tooltip-content">
                      {getDepartmentNameById(course.department_id)}
                    </div>
                  </td>
                  <td>{course.credits}</td>
                  <td>{course.description || '-'}</td>
                  <td>
                    <button 
                      onClick={() => handleEditClick(course)}
                      className="edit-btn"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      default:
        return null;
    }
  };

  // Update the renderDashboard function
  const renderDashboard = () => {
    return (
      <div className="dashboard">
        <Dashboard />
      </div>
    );
  };

  // Update the ConfirmDialog component
  const ConfirmDialog = ({ onConfirm, onCancel }) => {
    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Sign Out</h3>
            <button className="close-btn" onClick={onCancel}>&times;</button>
          </div>
          <div className="prompt-content">
            <p>Are you sure you want to sign out?</p>
          </div>
          <div className="prompt-actions">
            <button onClick={onCancel} className="cancel-btn">Cancel</button>
            <button onClick={onConfirm} className="save-btn">Sign Out</button>
          </div>
        </div>
      </div>
    );
  };

  // Add teacher handling functions
  const handleAddTeacher = async (formData) => {
    try {
      console.log('Initial form data:', formData);

      // Ensure hire_date is properly formatted
      const cleanedData = {
        first_name: formData.first_name?.trim() || '',
        last_name: formData.last_name?.trim() || '',
        middle_name: formData.middle_name?.trim() || null,
        gender: formData.gender || 'Male',
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        department: formData.department?.trim() || '',
        hire_date: formData.hire_date || new Date().toISOString().split('T')[0],
        status: formData.status || 'Active'
      };

      // Debug log to verify data
      console.log('Cleaned data being sent:', cleanedData);

      // Verify all required fields are present
      const requiredFields = ['first_name', 'last_name', 'gender', 'department', 'hire_date'];
      for (const field of requiredFields) {
        if (!cleanedData[field]) {
          throw new Error(`${field} is required`);
        }
      }

      const response = await axios.post('http://localhost:8000/addTeacher', cleanedData);
      
      if (response.data) {
        console.log('Server response:', response.data);
        await fetchTeachers();
        setShowAddRecord(false);
        alert('Teacher added successfully!');
      }
    } catch (error) {
      console.error('Error adding teacher:', error.response?.data || error);
      alert(`Failed to add teacher: ${error.response?.data?.details || error.message}`);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/teachers');
      console.log('Fetched teachers:', response.data);
      setTeachers(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      alert('Failed to fetch teachers data');
    }
  };

  // Add useEffect to fetch data on component mount
  useEffect(() => {
    fetchTeachers();
  }, []);

  // Add the class form component
  const AddClassForm = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      class_name: '',
      teacher_id: '',
      room_number: '',
      schedule_time: '',
      max_capacity: ''
    });

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <form onSubmit={handleSubmit} className="prompt-form">
            <div className="prompt-field">
              <label>Class Name*</label>
              <input
                type="text"
                name="class_name"
                value={formData.class_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Teacher ID*</label>
              <input
                type="number"
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Room Number*</label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Schedule Time*</label>
              <input
                type="text"
                name="schedule_time"
                value={formData.schedule_time}
                onChange={handleChange}
                required
                placeholder="e.g., MWF 9:00-10:30"
              />
            </div>

            <div className="prompt-field">
              <label>Max Capacity*</label>
              <input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleChange}
                required
                min="1"
              />
            </div>

            <div className="button-container">
              <button type="submit" className="save-button">Save</button>
              <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Update the handleAddClass function
  const handleAddClass = async (formData) => {
    try {
      console.log('Initial class data:', formData);

      // Validate the data
      if (!formData.class_name || !formData.teacher_id || !formData.room_number || 
          !formData.schedule_time || !formData.max_capacity) {
        throw new Error('All fields are required');
      }

      const cleanedData = {
        class_name: formData.class_name.trim(),
        teacher_id: parseInt(formData.teacher_id),
        room_number: formData.room_number.trim(),
        schedule_time: formData.schedule_time.trim(),
        max_capacity: parseInt(formData.max_capacity)
      };

      console.log('Sending class data:', cleanedData);

      const response = await axios.post('http://localhost:8000/addClass', cleanedData);
      
      if (response.data) {
        console.log('Server response:', response.data);
        await fetchClasses();
        setShowAddRecord(false);
        alert('Class added successfully!');
      }
    } catch (error) {
      console.error('Error adding class:', error);
      const errorMessage = error.response?.data?.details || error.message;
      alert(`Failed to add class: ${errorMessage}`);
    }
  };

  // Add the fetchClasses function
  const fetchClasses = async () => {
    try {
      const response = await axios.get('http://localhost:8000/classes');
      console.log('Fetched classes:', response.data);
      setClasses(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      alert('Failed to fetch classes data');
    }
  };

  // Add useEffect to fetch classes data
  useEffect(() => {
    if (activeTable === 'classes') {
      fetchClasses();
    }
  }, [activeTable]);

  // Update the AddGradeForm component
  const AddGradeForm = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      student_id: '',
      class_id: '',
      quarter: '1st',
      grade: '',
      grade_date: new Date().toISOString().split('T')[0]
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const gradeData = {
          student_id: parseInt(formData.student_id),
          class_id: parseInt(formData.class_id),
          quarter: formData.quarter,
          grade: parseFloat(formData.grade),
          grade_date: formData.grade_date
        };

        console.log('Submitting grade data:', gradeData);

        const response = await axios.post(`${API_BASE_URL}/grades`, gradeData);

        if (response.data) {
          console.log('Grade added successfully:', response.data);
          await handleRefresh(); // Refresh the data
          onClose(); // Close the form
        }
      } catch (error) {
        console.error('Error submitting grade:', error);
        alert('Failed to add grade. Please check the console for details.');
      }
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prevData => ({
        ...prevData,
        [name]: value
      }));
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Add New Grade</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label htmlFor="student_id">Student ID*</label>
              <input
                type="number"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label htmlFor="class_id">Class ID*</label>
              <input
                type="number"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label htmlFor="quarter">Quarter*</label>
              <select
                name="quarter"
                value={formData.quarter}
                onChange={handleChange}
                required
              >
                <option value="1st">1st Quarter</option>
                <option value="2nd">2nd Quarter</option>
                <option value="3rd">3rd Quarter</option>
                <option value="4th">4th Quarter</option>
              </select>
            </div>

            <div className="prompt-field">
              <label htmlFor="grade">Grade*</label>
              <input
                type="number"
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.01"
                required
              />
            </div>

            <div className="prompt-field">
              <label htmlFor="grade_date">Grade Date*</label>
              <input
                type="date"
                name="grade_date"
                value={formData.grade_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AddAttendanceForm = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      student_id: '',
      class_id: '',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'Present'
    });

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <form onSubmit={handleSubmit} className="prompt-form">
            <div className="prompt-field">
              <label>Student ID*</label>
              <input
                type="number"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Class ID*</label>
              <input
                type="number"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>

            <div className="prompt-field">
              <label>Attendance Date*</label>
              <input
                type="date"
                name="attendance_date"
                value={formData.attendance_date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="button-container">
              <button type="submit" className="save-button">Save</button>
              <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AddDepartmentForm = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      department_name: '',
      head_teacher_id: '',
      office_location: '',
      contact_email: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <form onSubmit={handleSubmit} className="prompt-form">
            <div className="prompt-field">
              <label>Department Name*</label>
              <input
                type="text"
                name="department_name"
                value={formData.department_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Head Teacher ID*</label>
              <input
                type="number"
                name="head_teacher_id"
                value={formData.head_teacher_id}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Office Location</label>
              <input
                type="text"
                name="office_location"
                value={formData.office_location}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
              />
            </div>
            <div className="button-container">
              <button type="submit" className="save-button">Save</button>
              <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const AddCourseForm = ({ onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      course_name: '',
      department_id: '',
      credits: '',
      description: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <form onSubmit={handleSubmit} className="prompt-form">
            <div className="prompt-field">
              <label>Course Name*</label>
              <input
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Department ID*</label>
              <input
                type="number"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
                required
              />
            </div>

            <div className="prompt-field">
              <label>Credits*</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                required
                min="1"
                max="6"
              />
            </div>

            <div className="prompt-field">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
              />
            </div>

            <div className="button-container">
              <button type="submit" className="save-button">Save</button>
              <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add these handler functions
  const handleAddGrade = async (formData) => {
    try {
      const cleanedData = {
        student_id: parseInt(formData.student_id),
        class_id: parseInt(formData.class_id),
        quarter: formData.quarter,
        grade: parseFloat(formData.grade),
        grade_date: formData.grade_date
      };

      const response = await axios.post(`${API_BASE_URL}/grades`, cleanedData);
      if (response.data) {
        await fetchGrades();
        setShowAddRecord(false);
        alert('Grade added successfully!');
      }
    } catch (error) {
      console.error('Error adding grade:', error);
      alert(`Failed to add grade: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddAttendance = async (formData) => {
    try {
      const cleanedData = {
        student_id: parseInt(formData.student_id),
        class_id: parseInt(formData.class_id),
        status: formData.status,
        attendance_date: formData.attendance_date
      };

      const response = await axios.post(`${API_BASE_URL}/attendance`, cleanedData);
      if (response.data) {
        await fetchAttendance();
        setShowAddRecord(false);
        alert('Attendance record added successfully!');
      }
    } catch (error) {
      console.error('Error adding attendance:', error);
      alert(`Failed to add attendance: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleAddDepartment = async (formData) => {
    try {
      const cleanedData = {
        department_name: formData.department_name.trim(),
        head_teacher_id: formData.head_teacher_id ? parseInt(formData.head_teacher_id) : null,
        office_location: formData.office_location?.trim() || null,
        contact_email: formData.contact_email?.trim() || null
      };

      console.log('Sending department data:', cleanedData);

      const response = await axios.post(`${API_BASE_URL}/departments`, cleanedData);
      if (response.data) {
        console.log('Department added:', response.data);
        // Update the departments state with the new data
        setDepartments(prevDepartments => [...prevDepartments, response.data]);
        setShowAddRecord(false);
        alert('Department added successfully!');
        // Refresh the departments list
        await fetchDepartments();
      }
    } catch (error) {
      console.error('Error adding department:', error);
      alert(`Failed to add department: ${error.response?.data?.details || error.message}`);
    }
  };

  const handleAddCourse = async (formData) => {
    try {
      const cleanedData = {
        course_name: formData.course_name.trim(),
        department_id: parseInt(formData.department_id),
        credits: parseInt(formData.credits),
        description: formData.description?.trim() || null
      };

      console.log('Sending course data:', cleanedData);

      const response = await axios.post(`${API_BASE_URL}/courses`, cleanedData);
      if (response.data) {
        console.log('Course added:', response.data);
        setCourses(prevCourses => [...prevCourses, response.data]);
        setShowAddRecord(false);
        alert('Course added successfully!');
        await fetchCourses();
      }
    } catch (error) {
      console.error('Error adding course:', error);
      alert(`Failed to add course: ${error.response?.data?.details || error.message}`);
    }
  };

  // Add these fetch functions
  const fetchGrades = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/grades`);
      setGrades(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setError('Failed to fetch grades data');
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/attendance`);
      setAttendance(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setError('Failed to fetch attendance data');
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/departments`);
      console.log('Fetched departments:', response.data);
      setDepartments(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setError('Failed to fetch departments data');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`);
      setCourses(response.data);
      setFilteredData(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to fetch courses data');
    }
  };

  // Update the renderAddRecordForm function or add it if it doesn't exist
  const renderAddRecordForm = () => {
    if (!showAddRecord) return null;

    switch (activeTable) {
      case 'students':
        return <AddRecordForm onSubmit={handleAddRecord} onClose={() => setShowAddRecord(false)} />;
      case 'teachers':
        return <AddTeacherForm onSubmit={handleAddTeacher} onClose={() => setShowAddRecord(false)} />;
      case 'classes':
        return <AddClassForm onSubmit={handleAddClass} onClose={() => setShowAddRecord(false)} />;
      case 'departments':
        return <AddDepartmentForm onSubmit={handleAddDepartment} onClose={() => setShowAddRecord(false)} />;
      case 'grades':
        return <AddGradeForm onSubmit={handleAddGrade} onClose={() => setShowAddRecord(false)} />;
      case 'attendance':
        return <AddAttendanceForm onSubmit={handleAddAttendance} onClose={() => setShowAddRecord(false)} />;
      case 'courses':
        return <AddCourseForm onSubmit={handleAddCourse} onClose={() => setShowAddRecord(false)} />;
      default:
        return null;
    }
  };

  const handleQuarterChange = async (gradeId, newQuarter, currentGrade) => {
    try {
      console.log('Updating grade:', gradeId, 'to quarter:', newQuarter, 'with grade:', currentGrade);
      const response = await axios.put(`http://localhost:8000/updateGrade/${gradeId}`, {
        quarter: newQuarter,
        grade: currentGrade
      });
      
      if (response.data) {
        console.log('Update successful:', response.data);
        const updateGrade = prevData => prevData.map(grade =>
          grade.grade_id === gradeId ? { ...grade, quarter: newQuarter, grade: currentGrade } : grade
        );
        
        setGrades(updateGrade);
        setFilteredData(updateGrade);
        await handleRefresh();
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      alert(`Failed to update grade: ${error.response?.data?.message || error.message}`);
    }
  };

  // Add these functions for handling edits
  const handleEdit = (grade, quarter) => {
    setEditingGrade({
      grade_id: grade.grade_id,
      student_id: grade.student_id,
      class_id: grade.class_id,
      quarter,
      currentGrade: grade[`${quarter}_quarter`],
      tempGrade: grade[`${quarter}_quarter`] || '',
      grade_date: grade.grade_date
    });
  };

  const handleSaveEdit = async () => {
    try {
      const gradeValue = parseFloat(editingGrade.tempGrade);
      if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 100) {
        alert('Grade must be a number between 0 and 100');
        return;
      }

      const quarterMap = {
        'first': 'first_quarter',
        'second': 'second_quarter',
        'third': 'third_quarter',
        'fourth': 'fourth_quarter'
      };

      const response = await axios.put(`${API_BASE_URL}/grades/${editingGrade.grade_id}`, {
        quarter: quarterMap[editingGrade.quarter],
        grade: gradeValue,
        grade_date: new Date().toISOString().split('T')[0]
      });

      if (response.data) {
        await handleRefresh();
        setEditingGrade(null);
      }
    } catch (error) {
      console.error('Error updating grade:', error);
      alert('Failed to update grade');
    }
  };

  // Add this function to handle edit button click
  const handleEditClick = (record) => {
    console.log('Edit clicked for record:', record);
    setEditingRecord(record);
    setShowEditForm(true);
  };

  // Add this function to handle edit form close
  const handleEditClose = () => {
    setEditingRecord(null);
    setShowEditForm(false);
  };

  // Add this function to handle edit form submission
  const handleEditSubmit = async (formData) => {
    try {
      console.log('Starting update with formData:', formData);
      console.log('Current editingRecord:', editingRecord);
      console.log('Active table:', activeTable);

      if (!editingRecord) {
        throw new Error('No record selected for editing');
      }

      let endpoint;
      let id;
      let response;

      switch (activeTable) {
        case 'students':
          id = editingRecord.student_id || editingRecord.id;
          endpoint = `http://localhost:8000/students/${id}`;
          response = await axios.put(endpoint, {
            first_name: formData.first_name,
            last_name: formData.last_name,
            middle_name: formData.middle_name || null,
            gender: formData.gender,
            date_of_birth: formData.date_of_birth,
            phone: formData.phone || null,
            address: formData.address || null,
            grade_level: parseInt(formData.grade_level) || null,
            enrollment_date: formData.enrollment_date,
            status: formData.status || 'Active'
          });
          break;

        case 'grades':
          id = editingRecord.grade_id;
          endpoint = `http://localhost:8000/grades/${id}`;
          response = await axios.put(endpoint, {
            student_id: parseInt(formData.student_id),
            class_id: parseInt(formData.class_id),
            first_quarter: parseFloat(formData.first_quarter) || null,
            second_quarter: parseFloat(formData.second_quarter) || null,
            third_quarter: parseFloat(formData.third_quarter) || null,
            fourth_quarter: parseFloat(formData.fourth_quarter) || null,
            grade_date: formData.grade_date
          });
          break;

        case 'attendance':
          id = editingRecord.attendance_id;
          endpoint = `http://localhost:8000/attendance/${id}`;
          response = await axios.put(endpoint, {
            student_id: parseInt(formData.student_id),
            class_id: parseInt(formData.class_id),
            attendance_date: formData.attendance_date,
            status: formData.status
          });
          break;

        case 'departments':
          id = editingRecord.department_id;
          endpoint = `http://localhost:8000/departments/${id}`;
          response = await axios.put(endpoint, {
            department_name: formData.department_name,
            head_teacher_id: parseInt(formData.head_teacher_id) || null,
            office_location: formData.office_location,
            contact_email: formData.contact_email
          });
          break;

        case 'courses':
          id = editingRecord.course_id;
          endpoint = `http://localhost:8000/courses/${id}`;
          response = await axios.put(endpoint, {
            course_name: formData.course_name,
            department_id: parseInt(formData.department_id) || null,
            credits: parseInt(formData.credits) || 0,
            description: formData.description
          });
          break;

        case 'teachers':
          id = editingRecord.teacher_id;
          endpoint = `http://localhost:8000/teachers/${id}`;
          response = await axios.put(endpoint, {
            first_name: formData.first_name,
            last_name: formData.last_name,
            middle_name: formData.middle_name,
            gender: formData.gender,
            email: formData.email,
            phone: formData.phone,
            department: formData.department,
            hire_date: formData.hire_date,
            status: formData.status
          });
          break;

        case 'classes':
          id = editingRecord.class_id;
          endpoint = `http://localhost:8000/classes/${id}`;
          response = await axios.put(endpoint, {
            class_name: formData.class_name,
            teacher_id: parseInt(formData.teacher_id) || null,
            room_number: formData.room_number,
            schedule_time: formData.schedule_time,
            max_capacity: parseInt(formData.max_capacity) || null
          });
          break;

        default:
          throw new Error(`Invalid table type: ${activeTable}`);
      }

      if (response && response.data) {
        console.log('Update successful:', response.data);
        
        // Refresh the data based on the active table
        let refreshResponse;
        
        switch (activeTable) {
          case 'students':
            refreshResponse = await axios.get('http://localhost:8000/students');
            setStudents(refreshResponse.data);
            break;
          case 'grades':
            refreshResponse = await axios.get('http://localhost:8000/grades');
            setGrades(refreshResponse.data);
            break;
          case 'attendance':
            refreshResponse = await axios.get('http://localhost:8000/attendance');
            setAttendance(refreshResponse.data);
            break;
          case 'departments':
            refreshResponse = await axios.get('http://localhost:8000/departments');
            setDepartments(refreshResponse.data);
            break;
          case 'courses':
            refreshResponse = await axios.get('http://localhost:8000/courses');
            setCourses(refreshResponse.data);
            break;
          case 'teachers':
            refreshResponse = await axios.get('http://localhost:8000/teachers');
            setTeachers(refreshResponse.data);
            break;
          case 'classes':
            refreshResponse = await axios.get('http://localhost:8000/classes');
            setClasses(refreshResponse.data);
            break;
        }
        
        if (refreshResponse) {
          setFilteredData(refreshResponse.data);
          setShowEditForm(false);
          setEditingRecord(null);
          alert(`${activeTable.slice(0, -1)} updated successfully!`);
        }
      }
    } catch (error) {
      console.error('Error in handleEditSubmit:', error);
      console.error('Error details:', {
        formData,
        editingRecord,
        activeTable,
        error: error.response?.data || error.message
      });
      alert(`Failed to update ${activeTable.slice(0, -1)}: ${error.response?.data?.error || error.message}`);
    }
  };

  // Add or update the EditStudentForm component
  const EditStudentForm = ({ student, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      student_id: student.student_id || student.id,
      first_name: student.first_name || '',
      last_name: student.last_name || '',
      middle_name: student.middle_name || '',
      gender: student.gender || 'Male',
      date_of_birth: student.date_of_birth || '',
      phone: student.phone || '',
      address: student.address || '',
      grade_level: student.grade_level || '',
      enrollment_date: student.enrollment_date || '',
      status: student.status || 'Active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Submitting form with data:', formData);
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Edit Student</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label>First Name*</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Last Name*</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="prompt-field">
              <label>Date of Birth*</label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Grade Level</label>
              <input
                type="number"
                name="grade_level"
                value={formData.grade_level}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Enrollment Date*</label>
              <input
                type="date"
                name="enrollment_date"
                value={formData.enrollment_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add these EditForm components for all tables
  const EditTeacherForm = ({ teacher, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      first_name: teacher.first_name || '',
      last_name: teacher.last_name || '',
      middle_name: teacher.middle_name || '',
      gender: teacher.gender || 'Male',
      email: teacher.email || '',
      phone: teacher.phone || '',
      department: teacher.department || '',
      hire_date: teacher.hire_date || '',
      status: teacher.status || 'Active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Edit Teacher</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label>First Name*</label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Last Name*</label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Middle Name</label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Gender*</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="prompt-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Phone</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Department*</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Hire Date*</label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Retired">Retired</option>
                <option value="Terminated">Terminated</option>
              </select>
            </div>
            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditClassForm = ({ class_item, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      class_name: class_item.class_name || '',
      teacher_id: class_item.teacher_id || '',
      room_number: class_item.room_number || '',
      schedule_time: class_item.schedule_time || '',
      max_capacity: class_item.max_capacity || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Edit Class</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label>Class Name*</label>
              <input
                type="text"
                name="class_name"
                value={formData.class_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Teacher ID*</label>
              <input
                type="number"
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Room Number*</label>
              <input
                type="text"
                name="room_number"
                value={formData.room_number}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Schedule Time*</label>
              <input
                type="text"
                name="schedule_time"
                value={formData.schedule_time}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Max Capacity*</label>
              <input
                type="number"
                name="max_capacity"
                value={formData.max_capacity}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditDepartmentForm = ({ department, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      department_id: department.department_id,
      department_name: department.department_name || '',
      head_teacher_id: department.head_teacher_id || '',
      office_location: department.office_location || '',
      contact_email: department.contact_email || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Submitting department update:', formData);
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Edit Department</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label>Department Name*</label>
              <input
                type="text"
                name="department_name"
                value={formData.department_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Head Teacher ID</label>
              <input
                type="number"
                name="head_teacher_id"
                value={formData.head_teacher_id}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Office Location</label>
              <input
                type="text"
                name="office_location"
                value={formData.office_location}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Contact Email</label>
              <input
                type="email"
                name="contact_email"
                value={formData.contact_email}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditCourseForm = ({ course, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      course_id: course.course_id,
      course_name: course.course_name || '',
      department_id: course.department_id || '',
      credits: course.credits || '',
      description: course.description || ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log('Submitting course update:', formData);
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Edit Course</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label>Course Name*</label>
              <input
                type="text"
                name="course_name"
                value={formData.course_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Department ID</label>
              <input
                type="number"
                name="department_id"
                value={formData.department_id}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Credits*</label>
              <input
                type="number"
                name="credits"
                value={formData.credits}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Add these EditForm components for grades and attendance

  const EditGradeForm = ({ grade, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      grade_id: grade.grade_id,
      student_id: grade.student_id || '',
      class_id: grade.class_id || '',
      first_quarter: grade.first_quarter || '',
      second_quarter: grade.second_quarter || '',
      third_quarter: grade.third_quarter || '',
      fourth_quarter: grade.fourth_quarter || '',
      grade_date: grade.grade_date || new Date().toISOString().split('T')[0]
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Edit Grade</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label>Student ID*</label>
              <input
                type="number"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Class ID*</label>
              <input
                type="number"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>First Quarter</label>
              <input
                type="number"
                step="0.01"
                name="first_quarter"
                value={formData.first_quarter}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Second Quarter</label>
              <input
                type="number"
                step="0.01"
                name="second_quarter"
                value={formData.second_quarter}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Third Quarter</label>
              <input
                type="number"
                step="0.01"
                name="third_quarter"
                value={formData.third_quarter}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Fourth Quarter</label>
              <input
                type="number"
                step="0.01"
                name="fourth_quarter"
                value={formData.fourth_quarter}
                onChange={handleChange}
              />
            </div>
            <div className="prompt-field">
              <label>Grade Date*</label>
              <input
                type="date"
                name="grade_date"
                value={formData.grade_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const EditAttendanceForm = ({ attendance, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
      attendance_id: attendance.attendance_id,
      student_id: attendance.student_id || '',
      class_id: attendance.class_id || '',
      attendance_date: attendance.attendance_date || new Date().toISOString().split('T')[0],
      status: attendance.status || 'Present'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit(formData);
    };

    const handleChange = (e) => {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    };

    return (
      <div className="prompt-overlay">
        <div className="prompt-modal">
          <div className="prompt-header">
            <h3>Edit Attendance</h3>
            <button className="close-btn" onClick={onClose}>&times;</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="prompt-field">
              <label>Student ID*</label>
              <input
                type="number"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Class ID*</label>
              <input
                type="number"
                name="class_id"
                value={formData.class_id}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Attendance Date*</label>
              <input
                type="date"
                name="attendance_date"
                value={formData.attendance_date}
                onChange={handleChange}
                required
              />
            </div>
            <div className="prompt-field">
              <label>Status*</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
                <option value="Excused">Excused</option>
              </select>
            </div>
            <div className="prompt-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Update the renderContent function
  const renderContent = () => {
    if (showDashboard) {
      return renderDashboard();
    }
    
    switch (activeTable) {
      case 'students':
        return renderStudentsTable();
      case 'teachers':
        return renderTeachersTable();
      case 'grades':
        return renderGradesTable();
      case 'classes':
        return renderClassesTable();
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="container">
      <aside className="sidebar">
        <h2>DATABASE SERVER</h2>
        
        <button 
          className={showDashboard ? 'active' : ''} 
          onClick={handleDashboard}
        >
          Dashboard
        </button>

        {/* School Management DB Dropdown */}
        <div className="dropdown">
          <button onClick={() => toggleDropdown('school')} className="dropdown-btn">
            School Management DB {isDropdownOpen.school ? '▲' : '▼'}
          </button>
          {isDropdownOpen.school && (
            <div className="dropdown-content">
              <button onClick={() => handleTableSelect('school', 'students')}>Students</button>
              <button onClick={() => handleTableSelect('school', 'teachers')}>Teachers</button>
              <button onClick={() => handleTableSelect('school', 'classes')}>Classes</button>
            </div>
          )}
        </div>

        {/* Academic Records DB Dropdown */}
        <div className="dropdown">
          <button onClick={() => toggleDropdown('academic')} className="dropdown-btn">
            Academic Records DB {isDropdownOpen.academic ? '▲' : '▼'}
          </button>
          {isDropdownOpen.academic && (
            <div className="dropdown-content">
              <button onClick={() => handleTableSelect('academic', 'grades')}>Grades</button>
              <button onClick={() => handleTableSelect('academic', 'attendance')}>Attendance</button>
            </div>
          )}
        </div>

        {/* Administrative DB Dropdown */}
        <div className="dropdown">
          <button onClick={() => toggleDropdown('admin')} className="dropdown-btn">
            Administrative DB {isDropdownOpen.admin ? '▲' : '▼'}
          </button>
          {isDropdownOpen.admin && (
            <div className="dropdown-content">
              <button onClick={() => handleTableSelect('admin', 'departments')}>Departments</button>
              <button onClick={() => handleTableSelect('admin', 'courses')}>Courses</button>
            </div>
          )}
        </div>

        {/* Add sign out at bottom */}
        <div className="signout">
          <button className="signout-btn" onClick={handleSignOut}>
            <i className="fas fa-sign-out-alt"></i>
            Sign Out
          </button>
        </div>
      </aside>
      <main className="main-content">
        {showDashboard ? (
          renderDashboard()
        ) : (
          <>
            <header>-
              <h1>{activeTable.charAt(0).toUpperCase() + activeTable.slice(1)} Table</h1>
              <button className="refresh" onClick={handleRefresh}>
                {isLoading ? 'Loading...' : '↻ Fetch Data'}
              </button>
            </header>
            <div className="actions">
              <button onClick={() => setShowAddRecord(true)}>Add Record</button>
              <button onClick={handleDeleteRecord}>Delete Record</button>
              <button onClick={handleExportData}>Export Data</button>
              <input 
                type="text" 
                placeholder={`Search by ${activeTable.slice(0, -1)} ID...`}
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
            </div>
            <div className="table-container">
              {isLoading ? (
                <div>Loading data...</div>
              ) : error ? (
                <div>Error: {error}</div>
              ) : (
                renderTableContent()
              )}
            </div>
          </>
        )}
      </main>
      {showConfirmDialog && (
        <ConfirmDialog 
          onConfirm={confirmSignOut}
          onCancel={() => setShowConfirmDialog(false)}
        />
      )}
      {showAddRecord && renderAddRecordForm()}
      {showEditForm && editingRecord && (
        <>
          {activeTable === 'students' && (
            <EditStudentForm
              student={editingRecord}
              onSubmit={handleEditSubmit}
              onClose={handleEditClose}
            />
          )}
          {activeTable === 'teachers' && (
            <EditTeacherForm
              teacher={editingRecord}
              onSubmit={handleEditSubmit}
              onClose={handleEditClose}
            />
          )}
          {activeTable === 'classes' && (
            <EditClassForm
              class_item={editingRecord}
              onSubmit={handleEditSubmit}
              onClose={handleEditClose}
            />
          )}
          {activeTable === 'departments' && (
            <EditDepartmentForm
              department={editingRecord}
              onSubmit={handleEditSubmit}
              onClose={() => {
                setShowEditForm(false);
                setEditingRecord(null);
              }}
            />
          )}
          {activeTable === 'courses' && (
            <EditCourseForm
              course={editingRecord}
              onSubmit={handleEditSubmit}
              onClose={() => {
                setShowEditForm(false);
                setEditingRecord(null);
              }}
            />
          )}
          {activeTable === 'grades' && (
            <EditGradeForm
              grade={editingRecord}
              onSubmit={handleEditSubmit}
              onClose={handleEditClose}
            />
          )}
          {activeTable === 'attendance' && (
            <EditAttendanceForm
              attendance={editingRecord}
              onSubmit={handleEditSubmit}
              onClose={handleEditClose}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;

