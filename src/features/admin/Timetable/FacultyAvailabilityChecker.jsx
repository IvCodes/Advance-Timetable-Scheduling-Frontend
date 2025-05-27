import React, { useState, useEffect } from 'react';
import { 
  Select, 
  Tag, 
  Tooltip, 
  Modal, 
  Button, 
  Alert, 
  List, 
  Typography, 
  Space,
  Spin,
  Badge,
  Card
} from 'antd';
import { 
  CheckCircleOutlined, 
  ExclamationCircleOutlined, 
  CloseCircleOutlined,
  UserOutlined,
  ClockCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import makeApi from '../../../config/axiosConfig';
import dayjs from 'dayjs';

const { Option } = Select;
const { Text, Title } = Typography;

// API functions for faculty availability
const checkFacultyAvailability = async (facultyId, date, timeSlots = null) => {
  try {
    const api = makeApi();
    const response = await api.post('faculty-availability/check-availability', {
      faculty_id: facultyId,
      date: date,
      time_slots: timeSlots
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error checking faculty availability:", error);
    return { success: false, error: error.message };
  }
};

const getAvailableFaculty = async (date, timeSlot = null, subjectId = null, department = null) => {
  try {
    const api = makeApi();
    const params = new URLSearchParams({
      date_str: date
    });
    
    if (timeSlot) {
      params.append('start_time', timeSlot.start_time);
      params.append('end_time', timeSlot.end_time);
      if (timeSlot.period_name) {
        params.append('period_name', timeSlot.period_name);
      }
    }
    
    if (subjectId) params.append('subject_id', subjectId);
    if (department) params.append('department', department);
    
    const response = await api.get(`faculty-availability/available-faculty?${params}`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error getting available faculty:", error);
    return { success: false, error: error.message };
  }
};

const validateTimetableAssignment = async (semester, entryIndex, facultyId) => {
  try {
    const api = makeApi();
    const response = await api.post('faculty-availability/validate-assignment', {
      semester: semester,
      entry_index: entryIndex,
      faculty_id: facultyId,
      check_availability: true,
      override_conflicts: false
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error validating assignment:", error);
    return { success: false, error: error.message };
  }
};

// Availability status indicator component
const AvailabilityIndicator = ({ status, reason, conflicts }) => {
  const getStatusConfig = () => {
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
          icon: <ClockCircleOutlined />,
          text: 'Unknown',
          bgColor: '#fafafa',
          borderColor: '#d9d9d9'
        };
    }
  };

  const config = getStatusConfig();
  
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

// Enhanced faculty selector with availability checking
const FacultyAvailabilitySelector = ({ 
  value, 
  onChange, 
  teachers = [], 
  date, 
  timeSlot, 
  semester,
  entryIndex,
  subjectId,
  department,
  disabled = false,
  placeholder = "Select faculty member"
}) => {
  const [availableFaculty, setAvailableFaculty] = useState([]);
  const [loading, setLoading] = useState(false);
  const [validationModal, setValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);

  // Fetch available faculty when date or timeSlot changes
  useEffect(() => {
    if (date) {
      fetchAvailableFaculty();
    }
  }, [date, timeSlot, subjectId, department]);

  const fetchAvailableFaculty = async () => {
    setLoading(true);
    try {
      const response = await getAvailableFaculty(date, timeSlot, subjectId, department);
      if (response.success) {
        setAvailableFaculty(response.data);
      }
    } catch (error) {
      console.error("Error fetching available faculty:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacultySelect = async (facultyId) => {
    if (!facultyId) {
      onChange(null);
      return;
    }

    // Find faculty details
    const faculty = availableFaculty.find(f => f.faculty_id === facultyId) || 
                   teachers.find(t => t.id === facultyId);
    
    setSelectedFaculty(faculty);

    // Check availability if we have semester and entry index for validation
    if (semester && entryIndex !== undefined) {
      const validation = await validateTimetableAssignment(semester, entryIndex, facultyId);
      
      if (validation.success) {
        setValidationResult(validation.data);
        
        // If there are conflicts, show validation modal
        if (!validation.data.is_valid || validation.data.warnings.length > 0) {
          setValidationModal(true);
          return;
        }
      }
    }

    // If no conflicts or validation not required, proceed with selection
    onChange(facultyId);
  };

  const handleConfirmAssignment = () => {
    onChange(selectedFaculty?.faculty_id || selectedFaculty?.id);
    setValidationModal(false);
    setValidationResult(null);
  };

  const handleCancelAssignment = () => {
    setValidationModal(false);
    setValidationResult(null);
    setSelectedFaculty(null);
  };

  const getFacultyAvailabilityStatus = (facultyId) => {
    const faculty = availableFaculty.find(f => f.faculty_id === facultyId);
    return faculty ? {
      status: faculty.availability_status,
      reason: faculty.unavailability_reason,
      conflicts: faculty.conflicting_assignments
    } : null;
  };

  return (
    <>
      <Select
        value={value}
        onChange={handleFacultySelect}
        placeholder={placeholder}
        disabled={disabled}
        loading={loading}
        style={{ width: '100%' }}
        optionLabelProp="label"
        showSearch
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {teachers.map(teacher => {
          const availabilityInfo = getFacultyAvailabilityStatus(teacher.id);
          const facultyName = `${teacher.first_name} ${teacher.last_name}`;
          
          return (
            <Option 
              key={teacher.id} 
              value={teacher.id}
              label={
                <Space>
                  {facultyName}
                  {availabilityInfo && (
                    <AvailabilityIndicator 
                      status={availabilityInfo.status}
                      reason={availabilityInfo.reason}
                      conflicts={availabilityInfo.conflicts}
                    />
                  )}
                </Space>
              }
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{facultyName}</span>
                {availabilityInfo && (
                  <AvailabilityIndicator 
                    status={availabilityInfo.status}
                    reason={availabilityInfo.reason}
                    conflicts={availabilityInfo.conflicts}
                  />
                )}
              </div>
            </Option>
          );
        })}
      </Select>

      {/* Validation Modal */}
      <Modal
        title={
          <Space>
            <WarningOutlined style={{ color: '#faad14' }} />
            Faculty Assignment Validation
          </Space>
        }
        open={validationModal}
        onCancel={handleCancelAssignment}
        footer={[
          <Button key="cancel" onClick={handleCancelAssignment}>
            Cancel
          </Button>,
          <Button 
            key="confirm" 
            type="primary" 
            danger={validationResult && !validationResult.is_valid}
            onClick={handleConfirmAssignment}
          >
            {validationResult && !validationResult.is_valid ? 'Assign Anyway' : 'Confirm Assignment'}
          </Button>
        ]}
        width={600}
      >
        {validationResult && (
          <div>
            {selectedFaculty && (
              <Card size="small" style={{ marginBottom: 16 }}>
                <Space>
                  <UserOutlined />
                  <Text strong>
                    {selectedFaculty.faculty_name || 
                     `${selectedFaculty.first_name} ${selectedFaculty.last_name}`}
                  </Text>
                  <AvailabilityIndicator 
                    status={selectedFaculty.availability_status || 'available'}
                    reason={selectedFaculty.unavailability_reason}
                    conflicts={selectedFaculty.conflicting_assignments}
                  />
                </Space>
              </Card>
            )}

            {/* Conflicts */}
            {validationResult.conflicts && validationResult.conflicts.length > 0 && (
              <Alert
                type="error"
                message="Assignment Conflicts Detected"
                description={
                  <List
                    size="small"
                    dataSource={validationResult.conflicts}
                    renderItem={conflict => <List.Item>{conflict}</List.Item>}
                  />
                }
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Warnings */}
            {validationResult.warnings && validationResult.warnings.length > 0 && (
              <Alert
                type="warning"
                message="Assignment Warnings"
                description={
                  <List
                    size="small"
                    dataSource={validationResult.warnings}
                    renderItem={warning => <List.Item>{warning}</List.Item>}
                  />
                }
                style={{ marginBottom: 16 }}
              />
            )}

            {/* Recommendations */}
            {validationResult.recommendations && validationResult.recommendations.length > 0 && (
              <Alert
                type="info"
                message="Recommendations"
                description={
                  <List
                    size="small"
                    dataSource={validationResult.recommendations}
                    renderItem={recommendation => <List.Item>{recommendation}</List.Item>}
                  />
                }
              />
            )}

            {/* Success message */}
            {validationResult.is_valid && 
             (!validationResult.warnings || validationResult.warnings.length === 0) && (
              <Alert
                type="success"
                message="Assignment Valid"
                description="This faculty member is available for the selected time slot."
              />
            )}
          </div>
        )}
      </Modal>
    </>
  );
};

export default FacultyAvailabilitySelector;
export { AvailabilityIndicator, checkFacultyAvailability, getAvailableFaculty, validateTimetableAssignment }; 