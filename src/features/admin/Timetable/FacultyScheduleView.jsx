import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Select, 
  DatePicker, 
  Table, 
  Typography, 
  Space, 
  Tag, 
  Alert, 
  Spin,
  Row,
  Col,
  Statistic,
  Timeline,
  Empty,
  Button,
  Tooltip
} from 'antd';
import { 
  UserOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  BookOutlined,
  HomeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import { getTeachers } from '../DataManagement/data.api';
import { AvailabilityIndicator } from './FacultyAvailabilityChecker';
import makeApi from '../../../config/axiosConfig';
import dayjs from 'dayjs';

const { Option } = Select;
const { Title, Text } = Typography;

// API functions
const getFacultySchedule = async (facultyId, date) => {
  try {
    const api = makeApi();
    const response = await api.get(`faculty-availability/faculty/${facultyId}/schedule?date_str=${date}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error getting faculty schedule:", error);
    return { success: false, error: error.message };
  }
};

const getFacultyConflicts = async (facultyId, date) => {
  try {
    const api = makeApi();
    const response = await api.get(`faculty-availability/conflicts/faculty/${facultyId}?date_str=${date}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error getting faculty conflicts:", error);
    return { success: false, error: error.message };
  }
};

const getAvailabilitySummary = async (date, department = null) => {
  try {
    const api = makeApi();
    const params = new URLSearchParams({ date_str: date });
    if (department) params.append('department', department);
    
    const response = await api.get(`faculty-availability/summary?${params}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error getting availability summary:", error);
    return { success: false, error: error.message };
  }
};

const FacultyScheduleView = () => {
  const dispatch = useDispatch();
  const { teachers, loading: teachersLoading } = useSelector((state) => state.data);
  
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [scheduleData, setScheduleData] = useState(null);
  const [conflictsData, setConflictsData] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch teachers on component mount
  useEffect(() => {
    dispatch(getTeachers());
  }, [dispatch]);

  // Fetch data when faculty or date changes
  useEffect(() => {
    if (selectedFaculty && selectedDate) {
      fetchFacultyData();
    }
    if (selectedDate) {
      fetchSummaryData();
    }
  }, [selectedFaculty, selectedDate]);

  const fetchFacultyData = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      
      // Fetch schedule and conflicts in parallel
      const [scheduleResponse, conflictsResponse] = await Promise.all([
        getFacultySchedule(selectedFaculty, dateStr),
        getFacultyConflicts(selectedFaculty, dateStr)
      ]);
      
      if (scheduleResponse.success) {
        setScheduleData(scheduleResponse.data);
      }
      
      if (conflictsResponse.success) {
        setConflictsData(conflictsResponse.data);
      }
    } catch (error) {
      console.error("Error fetching faculty data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSummaryData = async () => {
    try {
      const dateStr = selectedDate.format('YYYY-MM-DD');
      const response = await getAvailabilitySummary(dateStr);
      
      if (response.success) {
        setSummaryData(response.data);
      }
    } catch (error) {
      console.error("Error fetching summary data:", error);
    }
  };

  // Table columns for assignments
  const assignmentColumns = [
    {
      title: 'Time',
      dataIndex: 'period',
      key: 'period',
      render: (period) => {
        if (period && typeof period === 'object') {
          const periodInfo = Array.isArray(period) ? period[0] : period;
          return (
            <Space direction="vertical" size="small">
              <Text strong>{periodInfo.name || 'Unknown Period'}</Text>
              {periodInfo.start_time && periodInfo.end_time && (
                <Text type="secondary">
                  {periodInfo.start_time} - {periodInfo.end_time}
                </Text>
              )}
            </Space>
          );
        }
        return <Text type="secondary">No time info</Text>;
      }
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => (
        <Space>
          <BookOutlined />
          <Text>{subject || 'Unknown Subject'}</Text>
        </Space>
      )
    },
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
      render: (room) => {
        if (room && typeof room === 'object') {
          return (
            <Space>
              <HomeOutlined />
              <Text>{room.name || room.code || 'Unknown Room'}</Text>
            </Space>
          );
        }
        return (
          <Space>
            <HomeOutlined />
            <Text>{room || 'Unknown Room'}</Text>
          </Space>
        );
      }
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'published_timetable' ? 'blue' : 'green'}>
          {type === 'published_timetable' ? 'Published' : 'Activity'}
        </Tag>
      )
    }
  ];

  // Get faculty name
  const getFacultyName = (facultyId) => {
    const faculty = teachers?.find(t => t.id === facultyId);
    return faculty ? `${faculty.first_name} ${faculty.last_name}` : 'Unknown Faculty';
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <CalendarOutlined />
          Faculty Schedule & Availability
        </Space>
      </Title>

      {/* Controls */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={16} align="middle">
          <Col span={8}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Select Faculty:</Text>
              <Select
                value={selectedFaculty}
                onChange={setSelectedFaculty}
                placeholder="Choose a faculty member"
                style={{ width: '100%' }}
                loading={teachersLoading}
                showSearch
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {teachers?.map(teacher => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name} ({teacher.faculty})
                  </Option>
                ))}
              </Select>
            </Space>
          </Col>
          <Col span={6}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Text strong>Select Date:</Text>
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            </Space>
          </Col>
          <Col span={10}>
            {summaryData && (
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="Total Faculty"
                    value={summaryData.total_faculty}
                    prefix={<UserOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Available"
                    value={summaryData.available}
                    valueStyle={{ color: '#3f8600' }}
                    prefix={<CheckCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Partial"
                    value={summaryData.partially_available}
                    valueStyle={{ color: '#faad14' }}
                    prefix={<ExclamationCircleOutlined />}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="Unavailable"
                    value={summaryData.unavailable}
                    valueStyle={{ color: '#cf1322' }}
                    prefix={<WarningOutlined />}
                  />
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      </Card>

      {/* Faculty Schedule Details */}
      {selectedFaculty && (
        <Row gutter={16}>
          {/* Schedule Information */}
          <Col span={16}>
            <Card 
              title={
                <Space>
                  <UserOutlined />
                  {getFacultyName(selectedFaculty)} - Schedule for {selectedDate.format('YYYY-MM-DD')}
                </Space>
              }
              loading={loading}
            >
              {scheduleData ? (
                <div>
                  {/* Availability Status */}
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Text strong>Availability Status:</Text>
                      <AvailabilityIndicator 
                        status={scheduleData.availability_status}
                        reason={scheduleData.unavailability_reason}
                      />
                    </Space>
                  </div>

                  {/* Assignments Table */}
                  {scheduleData.assignments && scheduleData.assignments.length > 0 ? (
                    <Table
                      columns={assignmentColumns}
                      dataSource={scheduleData.assignments.map((assignment, index) => ({
                        ...assignment,
                        key: index
                      }))}
                      pagination={false}
                      size="small"
                    />
                  ) : (
                    <Empty 
                      description="No assignments for this date"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  )}
                </div>
              ) : (
                <Empty description="Select a faculty member to view schedule" />
              )}
            </Card>
          </Col>

          {/* Conflicts and Warnings */}
          <Col span={8}>
            <Card 
              title={
                <Space>
                  <WarningOutlined />
                  Conflicts & Issues
                </Space>
              }
              loading={loading}
            >
              {conflictsData ? (
                <div>
                  {conflictsData.conflicts_found > 0 ? (
                    <div>
                      <Alert
                        type="warning"
                        message={`${conflictsData.conflicts_found} conflict(s) detected`}
                        style={{ marginBottom: 16 }}
                      />
                      
                      <Timeline>
                        {conflictsData.conflicts.map((conflict, index) => (
                          <Timeline.Item 
                            key={index}
                            color="red"
                            dot={<WarningOutlined />}
                          >
                            <div>
                              <Text strong>Time Conflict:</Text>
                              <div style={{ marginTop: 4 }}>
                                <Text>{conflict.assignment1.subject}</Text>
                                <Text type="secondary"> vs </Text>
                                <Text>{conflict.assignment2.subject}</Text>
                              </div>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {conflict.conflict_reason}
                              </Text>
                            </div>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </div>
                  ) : (
                    <Alert
                      type="success"
                      message="No conflicts detected"
                      description="This faculty member has no scheduling conflicts for the selected date."
                    />
                  )}
                </div>
              ) : (
                <Empty description="No conflict data available" />
              )}
            </Card>
          </Col>
        </Row>
      )}

      {/* Faculty Availability Summary */}
      {summaryData && (
        <Card 
          title="Faculty Availability Summary"
          style={{ marginTop: 16 }}
        >
          <Table
            columns={[
              {
                title: 'Faculty',
                dataIndex: 'faculty_name',
                key: 'faculty_name',
                render: (name, record) => (
                  <Space>
                    <UserOutlined />
                    <Text>{name}</Text>
                    <Text type="secondary">({record.department})</Text>
                  </Space>
                )
              },
              {
                title: 'Availability',
                dataIndex: 'availability_status',
                key: 'availability_status',
                render: (status, record) => (
                  <AvailabilityIndicator 
                    status={status}
                    reason={record.unavailability_reason}
                    conflicts={record.conflicting_assignments}
                  />
                )
              },
              {
                title: 'Conflicts',
                dataIndex: 'conflicting_assignments',
                key: 'conflicting_assignments',
                render: (conflicts) => (
                  conflicts && conflicts.length > 0 ? (
                    <Tooltip title={conflicts.join(', ')}>
                      <Tag color="orange">{conflicts.length} conflict(s)</Tag>
                    </Tooltip>
                  ) : (
                    <Tag color="green">No conflicts</Tag>
                  )
                )
              },
              {
                title: 'Actions',
                key: 'actions',
                render: (_, record) => (
                  <Button 
                    size="small" 
                    onClick={() => setSelectedFaculty(record.faculty_id)}
                  >
                    View Schedule
                  </Button>
                )
              }
            ]}
            dataSource={summaryData.faculty_details?.map((faculty, index) => ({
              ...faculty,
              key: index
            }))}
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </Card>
      )}
    </div>
  );
};

export default FacultyScheduleView; 