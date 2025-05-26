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
import { Column } from '@ant-design/charts';
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
        console.log('Raw teacher data:', teachersList);
        
        setTeachers(teachersList);
        const processedAllocation = teachersList.map(teacher => ({
          ...teacher,
          subjectList: teacher.subjects || [],
          workloadHours: teacher.workloadHours || 0,
          workloadPercentage: teacher.workloadPercentage || 0,
          totalSlots: teacher.totalSlots || 0
        }));
        
        console.log('Processed allocation data:', processedAllocation);
        setAllocation(processedAllocation);

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
      teacher: item.name || 'Unknown Teacher',
      workload: isNaN(item.workloadPercentage) ? 0 : Math.round(item.workloadPercentage || 0)
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
    <div style={{ padding: '24px' }}>
      <Card>
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col span={24}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <Title level={3} style={{ margin: 0 }}>
                Teacher Allocation Report
              </Title>
              <Space wrap>
                <Select 
                  value={selectedFaculty} 
                  onChange={setSelectedFaculty} 
                  style={{ width: 200 }}
                  placeholder="Select Faculty"
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

        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Teachers"
                value={filteredAllocations.length}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Average Workload"
                value={
                  filteredAllocations.length > 0 
                    ? Math.round(filteredAllocations.reduce((sum, item) => {
                        const workload = item.workloadPercentage || 0;
                        return sum + (isNaN(workload) ? 0 : workload);
                      }, 0) / filteredAllocations.length) 
                    : 0
                }
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Teaching Hours"
                value={filteredAllocations.reduce((sum, item) => {
                  const hours = item.workloadHours || 0;
                  return sum + (isNaN(hours) ? 0 : hours);
                }, 0)}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
        </Row>

        {filteredAllocations.every(item => item.totalSlots === 0) && (
          <div style={{ 
            marginBottom: '24px', 
            padding: '16px', 
            backgroundColor: '#fffbe6', 
            border: '1px solid #ffe58f', 
            borderRadius: '6px'
          }}>
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
          <Card title="Teacher Workload Distribution" style={{ marginTop: '24px' }}>
            <div style={{ height: '500px', padding: '20px' }}>
              {filteredAllocations.length > 0 ? (
                <Column
                  data={getChartData()}
                  xField="teacher"
                  yField="workload"
                  height={450}
                  columnStyle={{
                    fill: '#1890ff',
                    fillOpacity: 0.8,
                  }}
                  label={{
                    position: 'top',
                    style: {
                      fill: '#000',
                      fontSize: 12,
                    },
                    formatter: (datum) => {
                      const value = datum.workload || 0;
                      return isNaN(value) ? '0%' : `${Math.round(value)}%`;
                    },
                  }}
                  xAxis={{
                    type: 'cat',
                    label: {
                      autoRotate: true,
                      autoHide: false,
                      style: {
                        fontSize: 11,
                        fill: '#666',
                      },
                    },
                    title: {
                      text: 'Teachers',
                      style: {
                        fontSize: 14,
                        fill: '#333',
                        fontWeight: 'bold',
                      },
                    },
                  }}
                  yAxis={{
                    type: 'linear',
                    min: 0,
                    max: 100,
                    label: {
                      formatter: (val) => {
                        const value = parseFloat(val);
                        return isNaN(value) ? '0%' : `${Math.round(value)}%`;
                      },
                      style: {
                        fontSize: 11,
                        fill: '#666',
                      },
                    },
                    title: {
                      text: 'Workload Percentage (%)',
                      style: {
                        fontSize: 14,
                        fill: '#333',
                        fontWeight: 'bold',
                      },
                    },
                    grid: {
                      line: {
                        style: {
                          stroke: '#f0f0f0',
                          lineWidth: 1,
                        },
                      },
                    },
                  }}
                  tooltip={{
                    formatter: (datum) => {
                      const value = datum.workload || 0;
                      return {
                        name: 'Workload',
                        value: isNaN(value) ? '0%' : `${Math.round(value)}%`,
                      };
                    },
                  }}
                  meta={{
                    workload: {
                      alias: 'Workload Percentage',
                      formatter: (val) => {
                        const value = parseFloat(val);
                        return isNaN(value) ? '0%' : `${Math.round(value)}%`;
                      },
                    },
                    teacher: {
                      alias: 'Teacher Name',
                    },
                  }}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  height: '100%',
                  flexDirection: 'column'
                }}>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    No data available for chart view
                  </Text>
                  <Text type="secondary">
                    Please ensure teachers have been assigned to subjects in the timetable.
                  </Text>
                </div>
              )}
            </div>
          </Card>
        )}
      </Card>
    </div>
  );
};

export default TeacherAllocationReport;
