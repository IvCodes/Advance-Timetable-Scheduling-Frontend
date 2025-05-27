import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Modal, 
  Form, 
  Select, 
  DatePicker, 
  message, 
  Space, 
  Tag, 
  Tooltip,
  Typography,
  Spin,
  Empty
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getTeachers } from '../DataManagement/data.api';
import { 
  EditOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  UserSwitchOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import makeApi from '../../../config/axiosConfig';
import SubstituteSelector from './SubstituteSelector';

const { Title } = Typography;
const { Option } = Select;

// API function to get all faculty unavailability requests
const getFacultyUnavailabilityRequests = async () => {
  try {
    const api = makeApi();
    const response = await api.get('faculty-availability/unavailability-requests');
    return response.data;
  } catch (error) {
    console.error("Error fetching faculty unavailability requests:", error);
    return [];
  }
};

// API function to assign substitute
const assignSubstituteToRequest = async (requestId, substituteId) => {
  try {
    const api = makeApi();
    const response = await api.put(`faculty-availability/unavailability-requests/${requestId}/status`, {
      status: 'approved',
      substitute_id: substituteId,
      admin_notes: 'Substitute assigned via Faculty Unavailability Management'
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error assigning substitute:", error);
    return { success: false, error: error.message };
  }
};

// API function to update request status
const updateRequestStatus = async (requestId, status, adminNotes = null) => {
  try {
    const api = makeApi();
    const response = await api.put(`faculty-availability/unavailability-requests/${requestId}/status`, {
      status: status,
      admin_notes: adminNotes
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating request status:", error);
    return { success: false, error: error.message };
  }
};

const FacultyUnavailability = () => {
  const dispatch = useDispatch();
  const { teachers, loading: teachersLoading } = useSelector((state) => state.data);
  
  const [unavailabilityData, setUnavailabilityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  // Fetch teachers data
  useEffect(() => {
    dispatch(getTeachers());
  }, [dispatch]);

  // Fetch unavailability data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const requests = await getFacultyUnavailabilityRequests();
        
        // Transform the data to match the table format
        const transformedData = requests.map(request => ({
          id: request.record_id,
          requestId: request.record_id,
          facultyId: request.faculty_id,
          facultyName: request.faculty_name,
          department: request.department,
          subject: 'N/A', // We don't have subject info in the current data structure
          startDate: request.date,
          endDate: request.date, // Single day unavailability
          status: request.status,
          substituteId: request.substitute_id,
          substituteName: request.substitute_name,
          reason: request.reason,
          unavailabilityType: request.unavailability_type,
          createdAt: request.created_at
        }));
        
        setUnavailabilityData(transformedData);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load faculty unavailability data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAssignSubstitute = (record) => {
    setSelectedRequest(record);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditSubstitute = (record) => {
    setSelectedRequest(record);
    editForm.setFieldsValue({
      substituteId: record.substituteId
    });
    setEditModalVisible(true);
  };

  const handleViewDetails = (record) => {
    setSelectedRequest(record);
    setViewModalVisible(true);
  };

  const submitAssignSubstitute = async () => {
    try {
      const values = await form.validateFields();
      const response = await assignSubstituteToRequest(selectedRequest.requestId, values.substituteId);
      
      if (response.success) {
        message.success("Substitute assigned successfully");
        
        // Find substitute name
        const substituteName = teachers?.find(t => t.id === values.substituteId);
        const substituteDisplayName = substituteName 
          ? `${substituteName.first_name} ${substituteName.last_name}` 
          : 'Unknown';
        
        // Update the local state to reflect changes
        setUnavailabilityData(prev => 
          prev.map(item => 
            item.id === selectedRequest.id 
              ? { 
                  ...item, 
                  status: 'approved', 
                  substituteId: values.substituteId,
                  substituteName: substituteDisplayName
                }
              : item
          )
        );
        
        setModalVisible(false);
      } else {
        message.error("Failed to assign substitute");
      }
    } catch (error) {
      console.error("Error assigning substitute:", error);
      message.error("Failed to assign substitute");
    }
  };

  const submitEditSubstitute = async () => {
    try {
      const values = await editForm.validateFields();
      const response = await assignSubstituteToRequest(selectedRequest.requestId, values.substituteId);
      
      if (response.success) {
        message.success("Substitute updated successfully");
        
        // Find substitute name
        const substituteName = teachers?.find(t => t.id === values.substituteId);
        const substituteDisplayName = substituteName 
          ? `${substituteName.first_name} ${substituteName.last_name}` 
          : 'Unknown';
        
        // Update the local state to reflect changes
        setUnavailabilityData(prev => 
          prev.map(item => 
            item.id === selectedRequest.id 
              ? { 
                  ...item, 
                  substituteId: values.substituteId,
                  substituteName: substituteDisplayName
                }
              : item
          )
        );
        
        setEditModalVisible(false);
      } else {
        message.error("Failed to update substitute");
      }
    } catch (error) {
      console.error("Error updating substitute:", error);
      message.error("Failed to update substitute");
    }
  };

  const handleApproveRequest = async (record) => {
    try {
      const response = await updateRequestStatus(record.requestId, 'approved', 'Approved via Faculty Unavailability Management');
      
      if (response.success) {
        message.success("Request approved successfully");
        
        // Update local state
        setUnavailabilityData(prev => 
          prev.map(item => 
            item.id === record.id 
              ? { ...item, status: 'approved' }
              : item
          )
        );
      } else {
        message.error("Failed to approve request");
      }
    } catch (error) {
      console.error("Error approving request:", error);
      message.error("Failed to approve request");
    }
  };

  const handleDenyRequest = async (record) => {
    try {
      const response = await updateRequestStatus(record.requestId, 'denied', 'Denied via Faculty Unavailability Management');
      
      if (response.success) {
        message.success("Request denied");
        
        // Update local state
        setUnavailabilityData(prev => 
          prev.map(item => 
            item.id === record.id 
              ? { ...item, status: 'denied' }
              : item
          )
        );
      } else {
        message.error("Failed to deny request");
      }
    } catch (error) {
      console.error("Error denying request:", error);
      message.error("Failed to deny request");
    }
  };

  const getTeacherName = (teacherId) => {
    if (!teachers || !teacherId) return 'Unknown';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : 'Unknown';
  };

  const columns = [
    {
      title: 'Faculty Member',
      dataIndex: 'facultyName',
      key: 'facultyName',
      render: (name, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{name}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.department}</div>
        </div>
      )
    },
    {
      title: 'Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: date => dayjs(date).format('MMMM D, YYYY (dddd)'),
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason) => reason || 'No reason provided'
    },
    {
      title: 'Type',
      dataIndex: 'unavailabilityType',
      key: 'unavailabilityType',
      render: (type) => {
        const typeColors = {
          'sick_leave': 'red',
          'personal_leave': 'blue',
          'conference': 'green',
          'training': 'orange'
        };
        return (
          <Tag color={typeColors[type] || 'default'}>
            {type?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      }
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status, record) => {
        if (status === 'approved') {
          return (
            <Tooltip title={record.substituteName ? `Substitute: ${record.substituteName}` : 'Approved without substitute'}>
              <Tag icon={<CheckCircleOutlined />} color="success">
                {record.substituteName ? 'Substitute Assigned' : 'Approved'}
              </Tag>
            </Tooltip>
          );
        } else if (status === 'pending') {
          return (
            <Tag icon={<CloseCircleOutlined />} color="warning">
              Pending Review
            </Tag>
          );
        } else if (status === 'denied') {
          return (
            <Tag icon={<CloseCircleOutlined />} color="error">
              Denied
            </Tag>
          );
        }
        return (
          <Tag color="default">
            {status?.toUpperCase() || 'UNKNOWN'}
          </Tag>
        );
      },
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Denied', value: 'denied' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Actions',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" direction="vertical" style={{ width: '100%' }}>
          <Button 
            type="default" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
            size="small"
            block
          >
            View
          </Button>
          
          {record.status === 'pending' && (
            <Space size="small" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handleApproveRequest(record)}
                size="small"
                style={{ flex: 1 }}
              >
                Approve
              </Button>
              <Button 
                type="primary" 
                icon={<UserSwitchOutlined />} 
                onClick={() => handleAssignSubstitute(record)}
                size="small"
                style={{ backgroundColor: '#52c41a', flex: 1 }}
                title="Assign Substitute"
              >
                Assign
              </Button>
            </Space>
          )}
          
          {record.status === 'approved' && record.substituteId && (
            <Button 
              type="default" 
              icon={<EditOutlined />} 
              onClick={() => handleEditSubstitute(record)}
              size="small"
              block
            >
              Edit Substitute
            </Button>
          )}
          
          {record.status === 'approved' && !record.substituteId && (
            <Button 
              type="primary" 
              icon={<UserSwitchOutlined />} 
              onClick={() => handleAssignSubstitute(record)}
              size="small"
              style={{ backgroundColor: '#52c41a' }}
              block
            >
              Assign Substitute
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card 
        title={<Title level={3}>Faculty Unavailability Management</Title>}
      >
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : unavailabilityData.length > 0 ? (
          <Table 
            columns={columns} 
            dataSource={unavailabilityData}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        ) : (
          <Empty description="No faculty unavailability requests found" />
        )}
      </Card>

      {/* View Details Modal */}
      <Modal
        title="Request Details"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        {selectedRequest && (
          <div>
            <p><strong>Faculty:</strong> {selectedRequest.facultyName}</p>
            <p><strong>Department:</strong> {selectedRequest.department}</p>
            <p><strong>Date:</strong> {dayjs(selectedRequest.startDate).format('MMMM D, YYYY (dddd)')}</p>
            <p><strong>Reason:</strong> {selectedRequest.reason || 'No reason provided'}</p>
            <p><strong>Type:</strong> {selectedRequest.unavailabilityType?.replace('_', ' ').toUpperCase() || 'Unknown'}</p>
            <p><strong>Status:</strong> {selectedRequest.status?.toUpperCase()}</p>
            {selectedRequest.substituteName && (
              <p><strong>Substitute:</strong> {selectedRequest.substituteName}</p>
            )}
            <p><strong>Created:</strong> {dayjs(selectedRequest.createdAt).format('MMMM D, YYYY HH:mm')}</p>
          </div>
        )}
      </Modal>

      {/* Modal for Assigning Substitute */}
      <Modal
        title="Assign Substitute"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={submitAssignSubstitute}
        okText="Assign"
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>Faculty:</Typography.Text> {selectedRequest?.facultyName}
          <br />
          <Typography.Text strong>Date:</Typography.Text> {selectedRequest?.startDate ? dayjs(selectedRequest.startDate).format('YYYY-MM-DD (dddd)') : 'N/A'}
          <br />
          <Typography.Text strong>Reason:</Typography.Text> {selectedRequest?.reason || 'No reason provided'}
        </div>
        
        <Form 
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="substituteId"
            label="Select Substitute Faculty"
            rules={[{ required: true, message: 'Please select a substitute faculty member' }]}
          >
            <SubstituteSelector
              date={selectedRequest?.startDate}
              originalFacultyId={selectedRequest?.facultyId}
              onSubstituteSelect={(substituteId, substituteInfo) => {
                form.setFieldsValue({ substituteId });
              }}
              value={form.getFieldValue('substituteId')}
              placeholder="Select an available substitute faculty"
              showRecommendations={true}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for Editing Substitute */}
      <Modal
        title="Edit Substitute Assignment"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={submitEditSubstitute}
        okText="Update"
        width={700}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>Faculty:</Typography.Text> {selectedRequest?.facultyName}
          <br />
          <Typography.Text strong>Date:</Typography.Text> {selectedRequest?.startDate ? dayjs(selectedRequest.startDate).format('YYYY-MM-DD (dddd)') : 'N/A'}
          <br />
          <Typography.Text strong>Current Substitute:</Typography.Text> {selectedRequest?.substituteName || 'None assigned'}
        </div>
        
        <Form 
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="substituteId"
            label="Change Substitute Faculty"
            rules={[{ required: true, message: 'Please select a substitute faculty member' }]}
          >
            <SubstituteSelector
              date={selectedRequest?.startDate}
              originalFacultyId={selectedRequest?.facultyId}
              onSubstituteSelect={(substituteId, substituteInfo) => {
                editForm.setFieldsValue({ substituteId });
              }}
              value={editForm.getFieldValue('substituteId')}
              placeholder="Select a different substitute faculty"
              showRecommendations={true}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyUnavailability;
