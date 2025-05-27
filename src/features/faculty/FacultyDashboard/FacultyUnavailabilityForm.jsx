import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  DatePicker, 
  Select, 
  Input, 
  Button, 
  message, 
  Table, 
  Tag, 
  Space, 
  Typography, 
  Alert,
  Modal,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  CalendarOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import makeApi from '../../../config/axiosConfig';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { Title, Text } = Typography;

// API functions
const submitUnavailabilityRequest = async (requestData) => {
  try {
    const api = makeApi();
    const response = await api.post('faculty-unavailability/unavailability-requests', requestData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error submitting unavailability request:", error);
    return { success: false, error: error.response?.data?.detail || error.message };
  }
};

const getFacultyUnavailabilityRequests = async (facultyId) => {
  try {
    const api = makeApi();
    const response = await api.get(`faculty-unavailability/unavailability-requests/faculty/${facultyId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error fetching unavailability requests:", error);
    return { success: false, error: error.message };
  }
};

const updateUnavailabilityRequest = async (requestId, updateData) => {
  try {
    const api = makeApi();
    const response = await api.put(`faculty-unavailability/unavailability-requests/${requestId}`, updateData);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error updating unavailability request:", error);
    return { success: false, error: error.response?.data?.detail || error.message };
  }
};

const deleteUnavailabilityRequest = async (requestId) => {
  try {
    const api = makeApi();
    const response = await api.delete(`faculty-unavailability/unavailability-requests/${requestId}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error deleting unavailability request:", error);
    return { success: false, error: error.response?.data?.detail || error.message };
  }
};

const FacultyUnavailabilityForm = () => {
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const { user } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);

  // Fetch existing requests on component mount
  useEffect(() => {
    if (user?.id) {
      fetchRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const response = await getFacultyUnavailabilityRequests(user.id);
      if (response.success) {
        setRequests(response.data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      message.error("Failed to load your unavailability requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const requestData = {
        faculty_id: user.id,
        date: values.date.format('YYYY-MM-DD'),
        unavailability_type: values.unavailability_type,
        reason: values.reason,
        time_slots: values.unavailability_type === 'partial' && values.time_slots ? 
          values.time_slots.map(slot => ({
            start_time: slot.start_time,
            end_time: slot.end_time,
            period_name: slot.period_name
          })) : null
      };

      const response = await submitUnavailabilityRequest(requestData);
      
      if (response.success) {
        message.success("Unavailability request submitted successfully");
        form.resetFields();
        fetchRequests(); // Refresh the list
      } else {
        message.error(response.error || "Failed to submit request");
      }
    } catch (error) {
      console.error("Error submitting request:", error);
      message.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (request) => {
    setEditingRequest(request);
    editForm.setFieldsValue({
      date: dayjs(request.date),
      unavailability_type: request.unavailability_type,
      reason: request.reason,
      time_slots: request.time_slots
    });
    setEditModalVisible(true);
  };

  const handleUpdate = async (values) => {
    setLoading(true);
    try {
      const updateData = {
        date: values.date.format('YYYY-MM-DD'),
        unavailability_type: values.unavailability_type,
        reason: values.reason,
        time_slots: values.unavailability_type === 'partial' && values.time_slots ? 
          values.time_slots.map(slot => ({
            start_time: slot.start_time,
            end_time: slot.end_time,
            period_name: slot.period_name
          })) : null
      };

      const response = await updateUnavailabilityRequest(editingRequest.record_id, updateData);
      
      if (response.success) {
        message.success("Request updated successfully");
        setEditModalVisible(false);
        setEditingRequest(null);
        editForm.resetFields();
        fetchRequests(); // Refresh the list
      } else {
        message.error(response.error || "Failed to update request");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      message.error("Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (requestId) => {
    Modal.confirm({
      title: 'Delete Unavailability Request',
      content: 'Are you sure you want to delete this request? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        setLoading(true);
        try {
          const response = await deleteUnavailabilityRequest(requestId);
          
          if (response.success) {
            message.success("Request deleted successfully");
            fetchRequests(); // Refresh the list
          } else {
            message.error(response.error || "Failed to delete request");
          }
        } catch (error) {
          console.error("Error deleting request:", error);
          message.error("Failed to delete request");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Table columns for requests
  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => (
        <Space>
          <CalendarOutlined />
          <Text>{dayjs(date).format('YYYY-MM-DD (dddd)')}</Text>
        </Space>
      )
    },
    {
      title: 'Type',
      dataIndex: 'unavailability_type',
      key: 'unavailability_type',
      render: (type) => (
        <Tag color={type === 'full_day' ? 'red' : 'orange'}>
          {type === 'full_day' ? 'Full Day' : 'Partial Day'}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          pending: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pending' },
          approved: { color: 'success', icon: <CheckCircleOutlined />, text: 'Approved' },
          denied: { color: 'error', icon: <CloseCircleOutlined />, text: 'Denied' }
        };
        
        const config = statusConfig[status] || statusConfig.pending;
        
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      }
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason) => (
        <Text ellipsis={{ tooltip: reason }}>
          {reason}
        </Text>
      )
    },
    {
      title: 'Substitute',
      dataIndex: 'substitute_name',
      key: 'substitute_name',
      render: (substituteName) => (
        substituteName ? (
          <Text>{substituteName}</Text>
        ) : (
          <Text type="secondary">Not assigned</Text>
        )
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Button 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              >
                Edit
              </Button>
              <Button 
                size="small" 
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record.record_id)}
              >
                Delete
              </Button>
            </>
          )}
          {record.status !== 'pending' && (
            <Text type="secondary">No actions available</Text>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <Space>
          <ExclamationCircleOutlined />
          Faculty Unavailability Management
        </Space>
      </Title>

      <Row gutter={24}>
        {/* Request Form */}
        <Col span={10}>
          <Card 
            title={
              <Space>
                <PlusOutlined />
                Submit New Request
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
            >
              <Form.Item
                name="date"
                label="Date"
                rules={[
                  { required: true, message: 'Please select a date' },
                  {
                    validator: (_, value) => {
                      if (value && value.isBefore(dayjs(), 'day')) {
                        return Promise.reject(new Error('Cannot select past dates'));
                      }
                      return Promise.resolve();
                    }
                  }
                ]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item
                name="unavailability_type"
                label="Unavailability Type"
                rules={[{ required: true, message: 'Please select unavailability type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="full_day">Full Day</Option>
                  <Option value="partial">Partial Day</Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => 
                  prevValues.unavailability_type !== currentValues.unavailability_type
                }
              >
                {({ getFieldValue }) => {
                  const unavailabilityType = getFieldValue('unavailability_type');
                  
                  if (unavailabilityType === 'partial') {
                    return (
                      <Form.List name="time_slots">
                        {(fields, { add, remove }) => (
                          <Form.Item label="Time Slots">
                            {fields.map(({ key, name, ...restField }) => (
                              <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                                <Form.Item
                                  {...restField}
                                  name={[name, 'start_time']}
                                  rules={[{ required: true, message: 'Start time required' }]}
                                >
                                  <Input placeholder="Start time (HH:MM)" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'end_time']}
                                  rules={[{ required: true, message: 'End time required' }]}
                                >
                                  <Input placeholder="End time (HH:MM)" />
                                </Form.Item>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'period_name']}
                                >
                                  <Input placeholder="Period name (optional)" />
                                </Form.Item>
                                <Button 
                                  type="link" 
                                  danger
                                  onClick={() => remove(name)}
                                  icon={<DeleteOutlined />}
                                />
                              </Space>
                            ))}
                            <Button 
                              type="dashed" 
                              onClick={() => add()} 
                              block 
                              icon={<PlusOutlined />}
                            >
                              Add Time Slot
                            </Button>
                          </Form.Item>
                        )}
                      </Form.List>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              <Form.Item
                name="reason"
                label="Reason"
                rules={[{ required: true, message: 'Please provide a reason' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Please explain why you will be unavailable..."
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                >
                  Submit Request
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Requests List */}
        <Col span={14}>
          <Card 
            title={
              <Space>
                <CalendarOutlined />
                Your Unavailability Requests
              </Space>
            }
          >
            <Alert
              type="info"
              message="Request Status Information"
              description="Pending requests can be edited or deleted. Approved/Denied requests cannot be modified."
              style={{ marginBottom: 16 }}
              showIcon
            />
            
            <Table
              columns={columns}
              dataSource={requests.map((request, index) => ({
                ...request,
                key: index
              }))}
              loading={loading}
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="Edit Unavailability Request"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingRequest(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdate}
        >
          <Form.Item
            name="date"
            label="Date"
            rules={[
              { required: true, message: 'Please select a date' },
              {
                validator: (_, value) => {
                  if (value && value.isBefore(dayjs(), 'day')) {
                    return Promise.reject(new Error('Cannot select past dates'));
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="unavailability_type"
            label="Unavailability Type"
            rules={[{ required: true, message: 'Please select unavailability type' }]}
          >
            <Select placeholder="Select type">
              <Option value="full_day">Full Day</Option>
              <Option value="partial">Partial Day</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="reason"
            label="Reason"
            rules={[{ required: true, message: 'Please provide a reason' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Please explain why you will be unavailable..."
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
              >
                Update Request
              </Button>
              <Button 
                onClick={() => {
                  setEditModalVisible(false);
                  setEditingRequest(null);
                  editForm.resetFields();
                }}
              >
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FacultyUnavailabilityForm; 