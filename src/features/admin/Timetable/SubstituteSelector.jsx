import React, { useState, useEffect } from 'react';
import { 
  Select, 
  Tag, 
  Tooltip, 
  Spin, 
  Alert, 
  Space, 
  Typography, 
  Badge,
  Card,
  List,
  Button,
  Modal
} from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import makeApi from '../../../config/axiosConfig';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text } = Typography;

// API functions for substitute management
const getAvailableSubstitutes = async (date, startTime = null, endTime = null, subjectId = null) => {
  try {
    const api = makeApi();
    const params = new URLSearchParams({ date });
    
    if (startTime) params.append('start_time', startTime);
    if (endTime) params.append('end_time', endTime);
    if (subjectId) params.append('subject_id', subjectId);
    
    const response = await api.get(`faculty-unavailability/available-substitutes?${params}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching available substitutes:', error);
    return { success: false, error: error.response?.data?.detail || error.message };
  }
};

const getSubstituteRecommendations = async (facultyId, date) => {
  try {
    const api = makeApi();
    const response = await api.get(`faculty-unavailability/substitute-recommendations/${facultyId}?date=${date}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error fetching substitute recommendations:', error);
    return { success: false, error: error.response?.data?.detail || error.message };
  }
};

// Availability indicator component
const AvailabilityIndicator = ({ status, reason, conflicts }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case 'available':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'Available',
          bgColor: '#f6ffed',
          borderColor: '#b7eb8f'
        };
      case 'partially_available':
        return {
          color: 'warning',
          icon: <ExclamationCircleOutlined />,
          text: 'Partially Available',
          bgColor: '#fffbe6',
          borderColor: '#ffe58f'
        };
      case 'unavailable':
        return {
          color: 'error',
          icon: <CloseCircleOutlined />,
          text: 'Unavailable',
          bgColor: '#fff2f0',
          borderColor: '#ffccc7'
        };
      default:
        return {
          color: 'default',
          icon: <InfoCircleOutlined />,
          text: 'Unknown',
          bgColor: '#fafafa',
          borderColor: '#d9d9d9'
        };
    }
  };

  const config = getStatusConfig(status);
  
  const tooltipContent = (
    <div>
      <div><strong>Status:</strong> {config.text}</div>
      {reason && <div><strong>Reason:</strong> {reason}</div>}
      {conflicts && conflicts.length > 0 && (
        <div>
          <strong>Conflicts:</strong>
          <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
            {conflicts.map((conflict, index) => (
              <li key={index}>{conflict}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );

  return (
    <Tooltip title={tooltipContent}>
      <Tag 
        color={config.color} 
        icon={config.icon}
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          margin: '2px'
        }}
      >
        {config.text}
      </Tag>
    </Tooltip>
  );
};

const SubstituteSelector = ({ 
  date, 
  startTime, 
  endTime, 
  subjectId, 
  originalFacultyId,
  onSubstituteSelect,
  value,
  placeholder = "Select substitute faculty",
  disabled = false,
  showRecommendations = true
}) => {
  const [substitutes, setSubstitutes] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

  // Fetch available substitutes when parameters change
  useEffect(() => {
    if (date) {
      fetchAvailableSubstitutes();
    }
  }, [date, startTime, endTime, subjectId]);

  // Fetch recommendations when original faculty is provided
  useEffect(() => {
    if (originalFacultyId && date && showRecommendations) {
      fetchRecommendations();
    }
  }, [originalFacultyId, date, showRecommendations]);

  const fetchAvailableSubstitutes = async () => {
    setLoading(true);
    try {
      const response = await getAvailableSubstitutes(date, startTime, endTime, subjectId);
      if (response.success) {
        setSubstitutes(response.data);
      } else {
        console.error('Failed to fetch substitutes:', response.error);
        setSubstitutes([]);
      }
    } catch (error) {
      console.error('Error fetching substitutes:', error);
      setSubstitutes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      const response = await getSubstituteRecommendations(originalFacultyId, date);
      if (response.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        console.error('Failed to fetch recommendations:', response.error);
        setRecommendations([]);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setRecommendations([]);
    } finally {
      setRecommendationsLoading(false);
    }
  };

  const handleSubstituteChange = (substituteId) => {
    const selectedSubstitute = substitutes.find(sub => sub.id === substituteId);
    if (onSubstituteSelect) {
      onSubstituteSelect(substituteId, selectedSubstitute);
    }
  };

  const renderSubstituteOption = (substitute) => (
    <Option key={substitute.id} value={substitute.id}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Space>
            <UserOutlined />
            <span>{substitute.name}</span>
            {substitute.department && (
              <Text type="secondary">({substitute.department})</Text>
            )}
          </Space>
        </div>
        <AvailabilityIndicator 
          status={substitute.availability_status}
          reason={substitute.unavailability_reason}
          conflicts={substitute.conflicting_assignments}
        />
      </div>
    </Option>
  );

  const getAvailableCount = () => {
    return substitutes.filter(sub => sub.availability_status === 'available').length;
  };

  const getPartiallyAvailableCount = () => {
    return substitutes.filter(sub => sub.availability_status === 'partially_available').length;
  };

  const getUnavailableCount = () => {
    return substitutes.filter(sub => sub.availability_status === 'unavailable').length;
  };

  return (
    <div>
      <div style={{ marginBottom: 8 }}>
        <Space>
          <Select
            value={value}
            placeholder={placeholder}
            onChange={handleSubstituteChange}
            loading={loading}
            disabled={disabled}
            style={{ minWidth: 300 }}
            showSearch
            filterOption={(input, option) =>
              option.children.props.children[0].props.children[1].props.children
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            dropdownRender={menu => (
              <div>
                {substitutes.length > 0 && (
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #f0f0f0' }}>
                    <Space size="small">
                      <Badge count={getAvailableCount()} style={{ backgroundColor: '#52c41a' }}>
                        <Tag color="success" size="small">Available</Tag>
                      </Badge>
                      <Badge count={getPartiallyAvailableCount()} style={{ backgroundColor: '#faad14' }}>
                        <Tag color="warning" size="small">Partial</Tag>
                      </Badge>
                      <Badge count={getUnavailableCount()} style={{ backgroundColor: '#ff4d4f' }}>
                        <Tag color="error" size="small">Unavailable</Tag>
                      </Badge>
                    </Space>
                  </div>
                )}
                {menu}
              </div>
            )}
          >
            {substitutes.map(renderSubstituteOption)}
          </Select>
          
          {showRecommendations && originalFacultyId && (
            <Button 
              type="link" 
              icon={<InfoCircleOutlined />}
              onClick={() => setShowRecommendationsModal(true)}
              loading={recommendationsLoading}
            >
              View Recommendations
            </Button>
          )}
        </Space>
      </div>

      {substitutes.length === 0 && !loading && (
        <Alert
          message="No substitutes available"
          description={`No faculty members are available for ${dayjs(date).format('YYYY-MM-DD')}${startTime && endTime ? ` from ${startTime} to ${endTime}` : ''}.`}
          type="warning"
          showIcon
          style={{ marginTop: 8 }}
        />
      )}

      {/* Recommendations Modal */}
      <Modal
        title={
          <Space>
            <InfoCircleOutlined />
            Substitute Recommendations
          </Space>
        }
        open={showRecommendationsModal}
        onCancel={() => setShowRecommendationsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowRecommendationsModal(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <Spin spinning={recommendationsLoading}>
          {recommendations.length > 0 ? (
            <List
              dataSource={recommendations}
              renderItem={(recommendation) => (
                <List.Item>
                  <Card size="small" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <Space direction="vertical" size="small">
                          <Text strong>{recommendation.faculty_name}</Text>
                          <Text type="secondary">{recommendation.department}</Text>
                          <Text>Match Score: {recommendation.match_score}%</Text>
                        </Space>
                      </div>
                      <div>
                        <AvailabilityIndicator 
                          status={recommendation.availability_status}
                          reason={recommendation.reason}
                        />
                      </div>
                    </div>
                    {recommendation.reasons && recommendation.reasons.length > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <Text type="secondary">Reasons:</Text>
                        <ul style={{ margin: '4px 0', paddingLeft: '16px' }}>
                          {recommendation.reasons.map((reason, index) => (
                            <li key={index}><Text type="secondary">{reason}</Text></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                </List.Item>
              )}
            />
          ) : (
            <Alert
              message="No recommendations available"
              description="No substitute recommendations could be generated for this faculty member and date."
              type="info"
              showIcon
            />
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default SubstituteSelector; 