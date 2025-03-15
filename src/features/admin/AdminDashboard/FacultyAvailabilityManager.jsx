import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Calendar, 
  Badge, 
  Select, 
  Table, 
  Space, 
  Button, 
  Modal, 
  Form, 
  Input, 
  message, 
  Tooltip, 
  Typography, 
  Spin, 
  Empty,
  Tabs,
  Row,
  Col,
  Divider,
  notification
} from 'antd';
import { InfoCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useSelector, useDispatch } from 'react-redux';
import { getTeachers } from '../DataManagement/data.api';
import axios from 'axios';
import makeApi from '../../../config/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { TabPane } = Tabs;
const { Option } = Select;

// API function to get unavailable days for all faculty
const getFacultyUnavailableDays = async (facultyId = null) => {
  try {
    // Mock data - in a real app, this would be an API call
    // If facultyId is null, return all faculty unavailable days
    return [
      {
        facultyId: 'FA0000001',
        facultyName: 'John Doe',
        department: 'Computer Science',
        unavailableDates: [
          {
            date: '2025-03-15',
            reason: 'Medical appointment',
            substituteId: null,
            status: 'pending' // pending, approved, denied
          },
          {
            date: '2025-03-20',
            reason: 'Conference attendance',
            substituteId: 'FA0000002',
            status: 'approved'
          }
        ]
      },
      {
        facultyId: 'FA0000002',
        facultyName: 'Jane Smith',
        department: 'Mathematics',
        unavailableDates: [
          {
            date: '2025-03-22',
            reason: 'Family emergency',
            substituteId: null,
            status: 'pending'
          }
        ]
      },
      {
        facultyId: 'FA0000003',
        facultyName: 'Robert Johnson',
        department: 'Physics',
        unavailableDates: [
          {
            date: '2025-03-18',
            reason: 'Research presentation',
            substituteId: 'FA0000001',
            status: 'approved'
          }
        ]
      }
    ];
  } catch (error) {
    console.error("Error fetching faculty unavailable days:", error);
    return [];
  }
};

// API function to assign a substitute for a faculty member
const assignSubstitute = async (facultyId, date, substituteId) => {
  try {
    // Mock API call
    console.log(`Assigning substitute ${substituteId} for faculty ${facultyId} on ${date}`);
    return { success: true };
  } catch (error) {
    console.error("Error assigning substitute:", error);
    return { success: false, error: error.message };
  }
};

// API function to update availability request status
const updateAvailabilityRequestStatus = async (facultyId, date, status) => {
  try {
    // Mock API call
    console.log(`Updating status to ${status} for faculty ${facultyId} on ${date}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating availability status:", error);
    return { success: false, error: error.message };
  }
};

const FacultyAvailabilityManager = () => {
  const dispatch = useDispatch();
  const { teachers, loading: teachersLoading } = useSelector((state) => state.data);
  
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [facultyData, setFacultyData] = useState([]);
  const [unavailableDays, setUnavailableDays] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [substituteModalVisible, setSubstituteModalVisible] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [activeTab, setActiveTab] = useState("1");
  
  const [form] = Form.useForm();
  
  // Fetch teachers data
  useEffect(() => {
    dispatch(getTeachers());
  }, [dispatch]);
  
  // Fetch faculty unavailable days
  useEffect(() => {
    const fetchFacultyData = async () => {
      setLoadingData(true);
      try {
        const data = await getFacultyUnavailableDays();
        setFacultyData(data);
        
        // Extract all pending requests
        const pending = data.reduce((acc, faculty) => {
          const facultyPending = faculty.unavailableDates
            .filter(date => date.status === 'pending')
            .map(date => ({
              key: `${faculty.facultyId}-${date.date}`,
              facultyId: faculty.facultyId,
              facultyName: faculty.facultyName,
              department: faculty.department,
              date: date.date,
              reason: date.reason,
              substituteId: date.substituteId,
              status: date.status
            }));
          return [...acc, ...facultyPending];
        }, []);
        
        setPendingRequests(pending);
        
        // If a faculty is selected, filter their unavailable days
        if (selectedFaculty) {
          const faculty = data.find(f => f.facultyId === selectedFaculty);
          if (faculty) {
            setUnavailableDays(faculty.unavailableDates);
          }
        }
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        message.error("Failed to load faculty availability data");
      } finally {
        setLoadingData(false);
      }
    };
    
    fetchFacultyData();
  }, [selectedFaculty]);
  
  // Handle faculty selection change
  const handleFacultyChange = (value) => {
    setSelectedFaculty(value);
    
    // Find the faculty and set their unavailable days
    const faculty = facultyData.find(f => f.facultyId === value);
    if (faculty) {
      setUnavailableDays(faculty.unavailableDates);
    } else {
      setUnavailableDays([]);
    }
  };
  
  // Date cell renderer for the calendar
  const dateCellRender = (date) => {
    const dateString = date.format('YYYY-MM-DD');
    const dayOfWeek = date.day(); // 0 is Sunday, 6 is Saturday
    
    // Skip rendering for weekends (Saturday and Sunday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return <Badge status="default" text="Weekend" />;
    }
    
    if (!selectedFaculty || unavailableDays.length === 0) {
      return null;
    }
    
    const unavailableDay = unavailableDays.find(day => day.date === dateString);
    
    if (unavailableDay) {
      let badgeStatus;
      let badgeText;
      
      switch (unavailableDay.status) {
        case 'approved':
          badgeStatus = 'error';
          badgeText = 'Unavailable';
          break;
        case 'pending':
          badgeStatus = 'warning';
          badgeText = 'Pending';
          break;
        case 'denied':
          badgeStatus = 'default';
          badgeText = 'Denied';
          break;
        default:
          badgeStatus = 'processing';
          badgeText = 'Unknown';
      }
      
      return (
        <div>
          <Badge status={badgeStatus} text={badgeText} />
          {unavailableDay.reason && (
            <Tooltip title={unavailableDay.reason}>
              <InfoCircleOutlined style={{ marginLeft: 5 }} />
            </Tooltip>
          )}
          {unavailableDay.substituteId && (
            <div style={{ marginTop: 5 }}>
              <Badge 
                status="success" 
                text={`Substitute: ${getTeacherName(unavailableDay.substituteId)}`} 
              />
            </div>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Helper function to get teacher name from ID
  const getTeacherName = (teacherId) => {
    if (!teachers) return 'Unknown';
    
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown';
  };
  
  // Show modal to review a specific request
  const showRequestModal = (request) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };
  
  // Handle approving a request
  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    const { facultyId, date } = selectedRequest;
    
    // If no substitute is assigned, show the substitute assignment modal
    if (!selectedRequest.substituteId) {
      setSubstituteModalVisible(true);
      return;
    }
    
    try {
      // Update the status to approved
      const result = await updateAvailabilityRequestStatus(facultyId, date, 'approved');
      
      if (result.success) {
        // Update the local state
        updateRequestStatus(facultyId, date, 'approved');
        message.success("Request approved successfully");
        setIsModalVisible(false);
      } else {
        message.error("Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      message.error("Failed to approve request");
    }
  };
  
  // Handle denying a request
  const handleDenyRequest = async () => {
    if (!selectedRequest) return;
    
    const { facultyId, date } = selectedRequest;
    
    try {
      // Update the status to denied
      const result = await updateAvailabilityRequestStatus(facultyId, date, 'denied');
      
      if (result.success) {
        // Update the local state
        updateRequestStatus(facultyId, date, 'denied');
        message.success("Request denied");
        setIsModalVisible(false);
      } else {
        message.error("Failed to deny request");
      }
    } catch (error) {
      console.error("Error denying request:", error);
      message.error("Failed to deny request");
    }
  };
  
  // Handle assigning a substitute
  const handleAssignSubstitute = async (values) => {
    if (!selectedRequest) return;
    
    const { facultyId, date } = selectedRequest;
    const { substituteId } = values;
    
    try {
      // Assign the substitute
      const assignResult = await assignSubstitute(facultyId, date, substituteId);
      
      if (assignResult.success) {
        // Update the status to approved
        const statusResult = await updateAvailabilityRequestStatus(facultyId, date, 'approved');
        
        if (statusResult.success) {
          // Update the local state
          updateRequestWithSubstitute(facultyId, date, substituteId, 'approved');
          message.success("Substitute assigned and request approved");
          setSubstituteModalVisible(false);
          setIsModalVisible(false);
        } else {
          message.error("Substitute assigned but failed to approve request");
        }
      } else {
        message.error("Failed to assign substitute");
      }
    } catch (error) {
      console.error("Error assigning substitute:", error);
      message.error("Failed to assign substitute");
    }
  };
  
  // Update the request status in local state
  const updateRequestStatus = (facultyId, date, status) => {
    // Update pendingRequests
    setPendingRequests(prevRequests => 
      prevRequests.filter(req => !(req.facultyId === facultyId && req.date === date))
    );
    
    // Update facultyData
    setFacultyData(prevData => 
      prevData.map(faculty => {
        if (faculty.facultyId === facultyId) {
          return {
            ...faculty,
            unavailableDates: faculty.unavailableDates.map(d => {
              if (d.date === date) {
                return { ...d, status };
              }
              return d;
            })
          };
        }
        return faculty;
      })
    );
    
    // Update unavailableDays if this faculty is selected
    if (selectedFaculty === facultyId) {
      setUnavailableDays(prevDays => 
        prevDays.map(d => {
          if (d.date === date) {
            return { ...d, status };
          }
          return d;
        })
      );
    }
  };
  
  // Update the request with a substitute in local state
  const updateRequestWithSubstitute = (facultyId, date, substituteId, status) => {
    // Update pendingRequests
    setPendingRequests(prevRequests => 
      prevRequests.filter(req => !(req.facultyId === facultyId && req.date === date))
    );
    
    // Update facultyData
    setFacultyData(prevData => 
      prevData.map(faculty => {
        if (faculty.facultyId === facultyId) {
          return {
            ...faculty,
            unavailableDates: faculty.unavailableDates.map(d => {
              if (d.date === date) {
                return { ...d, substituteId, status };
              }
              return d;
            })
          };
        }
        return faculty;
      })
    );
    
    // Update unavailableDays if this faculty is selected
    if (selectedFaculty === facultyId) {
      setUnavailableDays(prevDays => 
        prevDays.map(d => {
          if (d.date === date) {
            return { ...d, substituteId, status };
          }
          return d;
        })
      );
    }
  };
  
  // Calendar date render for disabling weekends
  const disabledDate = (date) => {
    const dayOfWeek = date.day();
    // Disable weekends (0 = Sunday, 6 = Saturday)
    return dayOfWeek === 0 || dayOfWeek === 6;
  };
  
  // Columns for the pending requests table
  const pendingColumns = [
    {
      title: 'Faculty',
      dataIndex: 'facultyName',
      key: 'facultyName',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text) => dayjs(text).format('MMMM D, YYYY (dddd)'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" onClick={() => showRequestModal(record)}>
            Review
          </Button>
        </Space>
      ),
    },
  ];

  // Function to initialize unavailable_dates field for all faculty users
  const initializeUnavailableDates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${makeApi}/faculty/initialize-unavailable-dates`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        notification.success({
          message: 'Migration Successful',
          description: response.data.message
        });
      } else {
        notification.error({
          message: 'Migration Failed',
          description: response.data.detail || 'Could not initialize unavailable dates for faculty users'
        });
      }
    } catch (error) {
      console.error('Error initializing unavailable dates:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while initializing unavailable dates'
      });
    }
  };

  return (
    <Card title="Faculty Availability Management">
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Pending Requests" key="1">
          <div className="mb-4">
            <Paragraph>
              Review and manage pending faculty unavailability requests. Assign substitutes as needed.
            </Paragraph>
          </div>
          
          <Space className="mb-4">
            <Button 
              type="primary" 
              onClick={() => setShowCreateModal(true)}
            >
              Add New Request
            </Button>
            <Button 
              type="default" 
              onClick={initializeUnavailableDates}
            >
              Initialize Faculty Availability
            </Button>
          </Space>
          
          {loadingData ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : pendingRequests.length > 0 ? (
            <Table 
              columns={pendingColumns} 
              dataSource={pendingRequests} 
              rowKey="key"
              pagination={{ pageSize: 5 }}
            />
          ) : (
            <Empty description="No pending availability requests" />
          )}
        </TabPane>
        
        <TabPane tab="Calendar View" key="2">
          <div className="mb-4">
            <Row gutter={16} align="middle">
              <Col>
                <Text strong>Select Faculty:</Text>
              </Col>
              <Col flex="auto">
                <Select
                  placeholder="Select a faculty member"
                  style={{ width: 300 }}
                  onChange={handleFacultyChange}
                  value={selectedFaculty}
                  loading={teachersLoading}
                >
                  {facultyData.map(faculty => (
                    <Option key={faculty.facultyId} value={faculty.facultyId}>
                      {faculty.facultyName} ({faculty.department})
                    </Option>
                  ))}
                </Select>
              </Col>
            </Row>
            
            <Divider />
            
            <Paragraph>
              View faculty availability calendar. Unavailable days are marked in red.
              <br />
              <Text type="secondary">
                <InfoCircleOutlined /> Hover over the info icon to see the reason for unavailability.
              </Text>
            </Paragraph>
          </div>
          
          {loadingData ? (
            <div className="flex justify-center items-center h-64">
              <Spin size="large" />
            </div>
          ) : (
            <Calendar 
              dateCellRender={dateCellRender} 
              disabledDate={disabledDate}
              className="admin-faculty-calendar"
            />
          )}
        </TabPane>
      </Tabs>
      
      {/* Request review modal */}
      <Modal
        title="Review Availability Request"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedRequest && (
          <div>
            <div className="mb-4">
              <Text strong>Faculty:</Text> {selectedRequest.facultyName}
            </div>
            <div className="mb-4">
              <Text strong>Department:</Text> {selectedRequest.department}
            </div>
            <div className="mb-4">
              <Text strong>Date:</Text> {dayjs(selectedRequest.date).format('MMMM D, YYYY (dddd)')}
            </div>
            <div className="mb-4">
              <Text strong>Reason:</Text>
              <div className="mt-1">
                <Text>{selectedRequest.reason || 'No reason provided'}</Text>
              </div>
            </div>
            
            <div className="mb-4">
              <Text strong>Current Status:</Text> {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
            </div>
            
            {selectedRequest.substituteId && (
              <div className="mb-4">
                <Text strong>Substitute:</Text> {getTeacherName(selectedRequest.substituteId)}
              </div>
            )}
            
            <div className="mt-6 flex justify-end">
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>
                  Cancel
                </Button>
                <Button danger onClick={handleDenyRequest}>
                  Deny Request
                </Button>
                <Button 
                  type="primary" 
                  onClick={handleApproveRequest}
                >
                  {selectedRequest.substituteId ? 'Approve Request' : 'Assign Substitute & Approve'}
                </Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Substitute assignment modal */}
      <Modal
        title="Assign Substitute"
        open={substituteModalVisible}
        onCancel={() => setSubstituteModalVisible(false)}
        footer={null}
      >
        {selectedRequest && (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleAssignSubstitute}
            initialValues={{ substituteId: null }}
          >
            <div className="mb-4">
              <Text>Assigning substitute for {selectedRequest.facultyName} on {dayjs(selectedRequest.date).format('MMMM D, YYYY')}</Text>
            </div>
            
            <Form.Item
              name="substituteId"
              label="Select Substitute"
              rules={[{ required: true, message: 'Please select a substitute' }]}
            >
              <Select
                placeholder="Select a substitute teacher"
                loading={teachersLoading}
              >
                {teachers && teachers
                  .filter(teacher => teacher.id !== selectedRequest.facultyId) // Filter out the requesting faculty
                  .map(teacher => (
                    <Option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </Option>
                  ))
                }
              </Select>
            </Form.Item>
            
            <Form.Item>
              <div className="flex justify-end">
                <Space>
                  <Button onClick={() => setSubstituteModalVisible(false)}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit">
                    Assign & Approve
                  </Button>
                </Space>
              </div>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </Card>
  );
};

export default FacultyAvailabilityManager;
