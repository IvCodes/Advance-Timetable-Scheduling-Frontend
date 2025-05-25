import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Typography, 
  Spin, 
  Select, 
  Button, 
  Row, 
  Col, 
  Statistic, 
  Tooltip,
  Progress,
  Badge,
  Space
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getTeacherAllocationReport } from './dashboard.api';
import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Bar } from '@ant-design/charts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { utils as XLSXUtils, writeFile as writeXLSXFile } from 'xlsx';

const { Title, Text } = Typography;
const { Option } = Select;

const TeacherAllocationReport = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);
  const [allocation, setAllocation] = useState([]);
  const [viewMode, setViewMode] = useState('table');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [facultyList, setFacultyList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch teacher allocation report from backend
        const reportResponse = await dispatch(getTeacherAllocationReport()).unwrap();
        
        // Set teachers and allocation data
        const teachersList = reportResponse.teachers || [];
        setTeachers(teachersList);
        setAllocation(teachersList.map(teacher => ({
          ...teacher,
          subjectList: teacher.subjects || []
        })));

        // Extract faculties
        const faculties = [...new Set(teachersList.map(teacher => teacher.faculty))].filter(Boolean);
        setFacultyList(faculties);

      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Process timetable data to get teacher allocations
  const processTeacherAllocations = (teachers, subjects, timetable) => {
    if (!timetable || !timetable.semesters) {
      return [];
    }

    // Create a map to count allocations by teacher
    const teacherAllocationMap = new Map();
    
    teachers.forEach(teacher => {
      const teacherName = `${teacher.first_name} ${teacher.last_name}`;
      teacherAllocationMap.set(teacher.id, {
        id: teacher.id,
        name: teacherName,
        faculty: teacher.faculty || 'Unassigned',
        totalSlots: 0,
        subjects: new Map(),
        workloadHours: 0,
        workloadPercentage: 0
      });
    });

    // Count allocations from all semesters
    Object.values(timetable.semesters).forEach(semesterEntries => {
      semesterEntries.forEach(entry => {
        // Find teacher by name match
        const teacher = teachers.find(t => 
          entry.teacher === `${t.first_name} ${t.last_name}` || 
          entry.teacher === t.id ||
          entry.teacher === t.username
        );
        
        if (teacher && teacherAllocationMap.has(teacher.id)) {
          const teacherData = teacherAllocationMap.get(teacher.id);
          teacherData.totalSlots += 1;
          
          // Track subject allocations
          const subject = entry.subject || 'Unknown';
          if (!teacherData.subjects.has(subject)) {
            teacherData.subjects.set(subject, 1);
          } else {
            teacherData.subjects.set(subject, teacherData.subjects.get(subject) + 1);
          }
          
          // Calculate workload hours (using duration if available, otherwise assume 1 hour)
          const duration = entry.duration || 1;
          teacherData.workloadHours += duration;
        }
      });
    });

    // Calculate workload percentages
    // Assuming a full workload is 20 hours per week, adjust as needed
    const fullWorkload = 20;
    
    // Convert the map to an array
    const teacherAllocations = Array.from(teacherAllocationMap.values()).map(teacher => {
      const workloadPercentage = (teacher.workloadHours / fullWorkload) * 100;
      
      return {
        ...teacher,
        workloadPercentage: Math.min(workloadPercentage, 100), // Cap at 100%
        subjectList: Array.from(teacher.subjects.entries()).map(([subject, count]) => ({
          subject,
          count
        }))
      };
    });

    return teacherAllocations;
  };

  // Filter allocations based on selected faculty
  const filteredAllocations = allocation.filter(item => 
    selectedFaculty === 'all' || item.faculty === selectedFaculty
  );

  // Get chart data
  const getChartData = () => {
    return filteredAllocations.map(item => ({
      teacher: item.name,
      workload: item.workloadPercentage
    }));
  };

  // Generate PDF report
  const exportPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text('Teacher Allocation Report', 14, 22);
      
      // Add faculty filter info
      doc.setFontSize(12);
      doc.text(`Faculty: ${selectedFaculty === 'all' ? 'All Faculties' : selectedFaculty}`, 14, 32);
      
      // Add date
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
      
      // Prepare table data
      const tableColumn = ['Teacher', 'Faculty', 'Subjects', 'Hours', 'Workload'];
      const tableRows = filteredAllocations.map(item => [
        item.name || 'N/A',
        item.faculty || 'Unassigned',
        item.subjectList.length > 0 
          ? item.subjectList.map(s => `${s.subject} (${s.count})`).join(', ')
          : 'No subjects',
        item.workloadHours || 0,
        `${Math.round(item.workloadPercentage || 0)}%`
      ]);
      
      // Add table
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 45,
        theme: 'grid',
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        columnStyles: {
          0: { cellWidth: 35 },
          1: { cellWidth: 30 },
          2: { cellWidth: 60 },
          3: { cellWidth: 20 },
          4: { cellWidth: 20 }
        },
        margin: { top: 45 }
      });
      
      doc.save('teacher-allocation-report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
      // You might want to show a user-friendly error message here
      alert('Error generating PDF. Please try again.');
    }
  };

  // Export Excel report
  const exportExcel = () => {
    const worksheet = XLSXUtils.json_to_sheet(
      filteredAllocations.map(item => ({
        'Teacher': item.name,
        'Faculty': item.faculty,
        'Subjects': item.subjectList.map(s => `${s.subject} (${s.count})`).join(', '),
        'Total Hours': item.workloadHours,
        'Workload %': `${Math.round(item.workloadPercentage)}%`
      }))
    );
    
    const workbook = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(workbook, worksheet, 'Teacher Allocation');
    
    writeXLSXFile(workbook, 'teacher-allocation-report.xlsx');
  };

  const columns = [
    {
      title: 'Teacher',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name)
    },
    {
      title: 'Faculty',
      dataIndex: 'faculty',
      key: 'faculty',
      filters: facultyList.map(faculty => ({ text: faculty, value: faculty })),
      onFilter: (value, record) => record.faculty === value
    },
    {
      title: 'Subjects',
      key: 'subjects',
      render: (_, record) => (
        <Space size={[4, 8]} wrap>
          {record.subjectList.map(subject => (
            <Badge 
              key={subject.subject} 
              count={subject.count} 
              style={{ backgroundColor: '#1890ff' }}
            >
              <Tag color="blue" style={{ 
                color: '#1890ff', 
                backgroundColor: '#e6f7ff',
                border: '1px solid #91d5ff',
                marginRight: 4,
                marginBottom: 4,
                fontSize: '12px',
                padding: '2px 8px'
              }}>
                {subject.subject}
              </Tag>
            </Badge>
          ))}
        </Space>
      )
    },
    {
      title: 'Weekly Hours',
      dataIndex: 'workloadHours',
      key: 'workloadHours',
      sorter: (a, b) => a.workloadHours - b.workloadHours
    },
    {
      title: 'Workload',
      key: 'workload',
      render: (_, record) => (
        <Tooltip title={`${Math.round(record.workloadPercentage)}% of full workload`}>
          <Progress 
            percent={Math.round(record.workloadPercentage)} 
            size="small" 
            status={
              record.workloadPercentage > 90 ? 'exception' : 
              record.workloadPercentage < 50 ? 'active' : 'normal'
            }
          />
        </Tooltip>
      ),
      sorter: (a, b) => a.workloadPercentage - b.workloadPercentage
    }
  ];

  // Add a tag component so we don't break the report
  const Tag = ({ children, color }) => (
    <span style={{ 
      backgroundColor: color, 
      padding: '2px 8px', 
      borderRadius: '4px', 
      display: 'inline-block' 
    }}>
      {children}
    </span>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <Row gutter={[16, 24]} className="mb-4">
          <Col span={24}>
            <div className="flex items-center justify-between">
              <Title level={3} style={{ margin: 0 }}>
                Teacher Allocation Report
              </Title>
              <Space>
                <Select 
                  value={selectedFaculty} 
                  onChange={setSelectedFaculty} 
                  style={{ width: 200 }}
                >
                  <Option value="all">All Faculties</Option>
                  {facultyList.map(faculty => (
                    <Option key={faculty} value={faculty}>{faculty}</Option>
                  ))}
                </Select>
                <Select 
                  value={viewMode} 
                  onChange={setViewMode} 
                  style={{ width: 120 }}
                >
                  <Option value="table">Table View</Option>
                  <Option value="chart">Chart View</Option>
                </Select>
                <Button 
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={exportExcel}
                >
                  Export Excel
                </Button>
                <Button 
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={exportPDF}
                >
                  Export PDF
                </Button>
              </Space>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} className="mb-4">
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Teachers"
                value={filteredAllocations.length}
                valueStyle={{ color: '#40a9ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Average Workload"
                value={
                  filteredAllocations.length > 0 
                    ? Math.round(filteredAllocations.reduce((sum, item) => sum + item.workloadPercentage, 0) / filteredAllocations.length) 
                    : 0
                }
                suffix="%"
                valueStyle={{ color: '#40a9ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Teaching Hours"
                value={filteredAllocations.reduce((sum, item) => sum + item.workloadHours, 0)}
                valueStyle={{ color: '#40a9ff' }}
              />
            </Card>
          </Col>
        </Row>

        {filteredAllocations.every(item => item.totalSlots === 0) && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <Text type="warning">
              <strong>Note:</strong> No published timetable found. Showing teacher list with zero allocations. 
              Please publish a timetable to see actual allocation data.
            </Text>
          </div>
        )}

        {viewMode === 'table' ? (
          <Table 
            columns={columns} 
            dataSource={filteredAllocations}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <div style={{ height: 400, marginTop: 20 }}>
            {filteredAllocations.length > 0 ? (
              <Bar
                data={getChartData()}
                xField="workload"
                yField="teacher"
                seriesField="teacher"
                legend={{ position: 'top-right' }}
                colorField="teacher"
                theme="light"
                barStyle={{ fill: '#1890ff' }}
                label={{
                  position: 'right',
                  content: (item) => `${Math.round(item.workload)}%`,
                  style: { fill: '#000' }
                }}
                yAxis={{
                  label: {
                    style: { fill: '#000' }
                  }
                }}
                xAxis={{
                  label: {
                    style: { fill: '#000' }
                  },
                  title: {
                    text: 'Workload Percentage',
                    style: { fill: '#000' }
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Text>No data available</Text>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TeacherAllocationReport;
