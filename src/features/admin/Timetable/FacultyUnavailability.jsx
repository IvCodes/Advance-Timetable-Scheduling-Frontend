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
  Typography
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getUsers 
} from '../UserManagement/users.api';
import { 
  EditOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';
import moment from 'moment';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Mock API functions - replace with actual API calls
const getFacultyUnavailability = async () => {
  // Mocked data - replace with actual API call
  return [
    { 
      id: '1', 
      facultyId: '101', 
      facultyName: 'Dr. Smith', 
      subject: 'Mathematics', 
      startDate: '2025-03-15', 
      endDate: '2025-03-20', 
      status: 'pending', 
      substituteId: null,
      substituteName: null
    },
    { 
      id: '2', 
      facultyId: '102', 
      facultyName: 'Dr. Johnson', 
      subject: 'Physics', 
      startDate: '2025-03-18', 
      endDate: '2025-03-25', 
      status: 'substituted', 
      substituteId: '103',
      substituteName: 'Dr. Wilson'
    }
  ];
};

const assignSubstitute = async (unavailabilityId, substituteId) => {
  // Mocked API call - replace with actual implementation
  console.log(`Assigning substitute ${substituteId} for unavailability ${unavailabilityId}`);
  return { success: true };
};

const FacultyUnavailability = () => {
  const dispatch = useDispatch();
  const [unavailabilityData, setUnavailabilityData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUnavailability, setSelectedUnavailability] = useState(null);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch faculty members
        const usersResponse = await dispatch(getUsers()).unwrap();
        setUsers(usersResponse || []);
        
        // Fetch unavailability data
        const unavailabilityResponse = await getFacultyUnavailability();
        setUnavailabilityData(unavailabilityResponse || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  const facultyMembers = users.filter(user => user.role === 'faculty') || [];

  const handleAssignSubstitute = (record) => {
    setSelectedUnavailability(record);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditSubstitute = (record) => {
    setSelectedUnavailability(record);
    editForm.setFieldsValue({
      substituteId: record.substituteId
    });
    setEditModalVisible(true);
  };

  const submitAssignSubstitute = async () => {
    try {
      const values = await form.validateFields();
      const response = await assignSubstitute(selectedUnavailability.id, values.substituteId);
      
      if (response.success) {
        message.success("Substitute assigned successfully");
        
        // Update the local state to reflect changes
        setUnavailabilityData(prev => 
          prev.map(item => 
            item.id === selectedUnavailability.id 
              ? { 
                  ...item, 
                  status: 'substituted', 
                  substituteId: values.substituteId,
                  substituteName: facultyMembers.find(f => f.id === values.substituteId)?.name || 'Unknown'
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
    }
  };

  const submitEditSubstitute = async () => {
    try {
      const values = await editForm.validateFields();
      const response = await assignSubstitute(selectedUnavailability.id, values.substituteId);
      
      if (response.success) {
        message.success("Substitute updated successfully");
        
        // Update the local state to reflect changes
        setUnavailabilityData(prev => 
          prev.map(item => 
            item.id === selectedUnavailability.id 
              ? { 
                  ...item, 
                  substituteId: values.substituteId,
                  substituteName: facultyMembers.find(f => f.id === values.substituteId)?.name || 'Unknown'
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
    }
  };

  const columns = [
    {
      title: 'Faculty Member',
      dataIndex: 'facultyName',
      key: 'facultyName',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Start Date',
      dataIndex: 'startDate',
      key: 'startDate',
      render: date => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'End Date',
      dataIndex: 'endDate',
      key: 'endDate',
      render: date => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status, record) => {
        if (status === 'substituted') {
          return (
            <Tooltip title={`Substitute: ${record.substituteName}`}>
              <Tag icon={<CheckCircleOutlined />} color="success">
                Substitute Assigned
              </Tag>
            </Tooltip>
          );
        } else {
          return (
            <Tag icon={<CloseCircleOutlined />} color="warning">
              Needs Substitute
            </Tag>
          );
        }
      },
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'substituted' ? (
            <Button 
              type="primary" 
              icon={<EditOutlined />} 
              onClick={() => handleEditSubstitute(record)}
              style={{ backgroundColor: '#1890ff' }}
              ghost
            >
              Edit
            </Button>
          ) : (
            <Button 
              type="primary" 
              icon={<UserSwitchOutlined />} 
              onClick={() => handleAssignSubstitute(record)}
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
        <Table 
          columns={columns} 
          dataSource={unavailabilityData}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      {/* Modal for Assigning Substitute */}
      <Modal
        title="Assign Substitute"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={submitAssignSubstitute}
        okText="Assign"
      >
        <Form 
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="substituteId"
            label="Select Substitute Faculty"
            rules={[{ required: true, message: 'Please select a substitute faculty member' }]}
          >
            <Select placeholder="Select a faculty member">
              {facultyMembers
                .filter(faculty => faculty.id !== selectedUnavailability?.facultyId)
                .map(faculty => (
                  <Option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </Option>
                ))
              }
            </Select>
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
      >
        <Form 
          form={editForm}
          layout="vertical"
        >
          <Form.Item
            name="substituteId"
            label="Change Substitute Faculty"
            rules={[{ required: true, message: 'Please select a substitute faculty member' }]}
          >
            <Select placeholder="Select a faculty member">
              {facultyMembers
                .filter(faculty => faculty.id !== selectedUnavailability?.facultyId)
                .map(faculty => (
                  <Option key={faculty.id} value={faculty.id}>
                    {faculty.name}
                  </Option>
                ))
              }
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyUnavailability;
