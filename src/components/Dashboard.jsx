import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DashboardStyles.css';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    students: [],
    teachers: [],
    classes: [],
    departments: [],
    grades: [],
    attendance: []
  });

  const COLORS = {
    primary: '#3498db',    // Blue
    success: '#2ecc71',    // Green
    warning: '#f1c40f',    // Yellow
    danger: '#e74c3c',     // Red
    info: '#9b59b6',       // Purple
    secondary: '#1abc9c',  // Turquoise
    dark: '#34495e'        // Dark Blue
  };

  const DEPARTMENT_COLORS = [
    COLORS.primary,    // Social Studies
    COLORS.success,    // Foreign Language
    COLORS.danger,     // Music
    COLORS.warning,    // Art
    COLORS.info,       // Physical Education
    COLORS.secondary,  // Computer Science
    '#e67e22',        // History
    COLORS.dark,      // English
    '#16a085',        // Science
    '#c0392b'         // Mathematics
  ];

  const ATTENDANCE_COLORS = [
    COLORS.primary,  // Present
    COLORS.danger,   // Late
    COLORS.warning   // Absent
  ];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [
          studentsRes,
          teachersRes,
          classesRes,
          departmentsRes,
          gradesRes,
          attendanceRes
        ] = await Promise.all([
          axios.get('http://localhost:8000/students'),
          axios.get('http://localhost:8000/teachers'),
          axios.get('http://localhost:8000/classes'),
          axios.get('http://localhost:8000/departments'),
          axios.get('http://localhost:8000/grades'),
          axios.get('http://localhost:8000/attendance')
        ]);

        setStats({
          students: studentsRes.data || [],
          teachers: teachersRes.data || [],
          classes: classesRes.data || [],
          departments: departmentsRes.data || [],
          grades: gradesRes.data || [],
          attendance: attendanceRes.data || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate statistics only when data is loaded
  const studentsByGrade = stats.students.reduce((acc, student) => {
    const grade = student.grade_level || 'Unassigned';
    acc[grade] = (acc[grade] || 0) + 1;
    return acc;
  }, {});

  const studentGradeData = Object.entries(studentsByGrade)
    .map(([grade, count]) => ({
      grade: `Grade ${grade}`,
      count
    }))
    .sort((a, b) => a.grade.localeCompare(b.grade));

  const departmentStats = stats.departments.map(dept => ({
    name: dept.department_name,
    teacherCount: stats.teachers.filter(t => t.department === dept.department_name).length
  }));

  const attendanceStats = stats.attendance.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {});

  const attendanceData = Object.entries(attendanceStats).map(([status, count]) => ({
    status,
    count
  }));

  const gradeDistribution = stats.grades.reduce((acc, grade) => {
    const scoreRange = Math.floor(grade.score / 10) * 10;
    acc[scoreRange] = (acc[scoreRange] || 0) + 1;
    return acc;
  }, {});

  const gradeData = Object.entries(gradeDistribution)
    .map(([range, count]) => ({
      range: `${range}-${parseInt(range) + 9}`,
      count
    }))
    .sort((a, b) => parseInt(a.range) - parseInt(b.range));

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-spinner">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">School Management Overview</h1>
      </div>
      
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <h3>STUDENTS</h3>
          <p>{stats.students.length || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👨‍🏫</div>
          <h3>TEACHERS</h3>
          <p>{stats.teachers.length || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <h3>CLASSES</h3>
          <p>{stats.classes.length || 0}</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏢</div>
          <h3>DEPARTMENTS</h3>
          <p>{stats.departments.length || 0}</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <div className="chart-header">
            <h2>Students by Grade</h2>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentGradeData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="grade" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #ddd'
                  }} 
                />
                <Bar dataKey="count" fill="#3498db" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-header">
            <h2>Attendance Overview</h2>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <Pie
                  data={attendanceData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  innerRadius="50%"
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ATTENDANCE_COLORS[index % ATTENDANCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white',
                    border: '1px solid #ddd'
                  }} 
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => <span style={{ color: '#333' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
