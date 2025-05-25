import React, { useState, useEffect } from 'react';
import { Typography, Button, Table, Empty, Modal, Spin, Card, Tabs, Alert } from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileOutlined,
  CalendarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { getPublishedTimetable } from './timetable.api';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ActiveTimetable = () => {
  const dispatch = useDispatch();
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishedTimetable, setPublishedTimetable] = useState(null);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the published timetable directly from the backend
        const timetableResult = await dispatch(getPublishedTimetable()).unwrap();
        console.log("Published timetable data:", timetableResult);
        setPublishedTimetable(timetableResult);
      } catch (error) {
        console.error("Error fetching published timetable:", error);
        setError(error.message || "Failed to fetch published timetable");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dispatch]);

  // Function to export timetable as PDF
  const exportAsPDF = () => {
    // Implementation for PDF export
    console.log('Exporting as PDF...');
    setExportModalVisible(false);
  };

  // Function to export timetable as HTML
  const exportAsHTML = () => {
    // Implementation for HTML export
    console.log('Exporting as HTML...');
    setExportModalVisible(false);
  };

  // Function to format timetable data for a specific semester
  const formatSemesterData = (semesterEntries) => {
    if (!semesterEntries || !Array.isArray(semesterEntries)) {
      return [];
    }

    return semesterEntries.map((entry, index) => ({
      key: `${entry.day?.name || 'Unknown'}-${entry.period?.[0]?.name || index}`,
      day: entry.day?.name || 'Unknown',
      period: entry.period?.[0]?.name || 'Unknown',
      time: entry.period?.[0]?.long_name || 'Unknown',
      subject: entry.subject || 'Unknown',
      teacher: entry.teacher || 'Unknown',
      room: entry.room?.name || entry.room || 'Unknown',
      duration: entry.duration || 'Unknown',
      subgroup: entry.subgroup || 'Unknown'
    }));
  };

  const columns = [
    { title: 'Day', dataIndex: 'day', key: 'day', width: 100 },
    { title: 'Period', dataIndex: 'period', key: 'period', width: 80 },
    { title: 'Time', dataIndex: 'time', key: 'time', width: 150 },
    { title: 'Subject', dataIndex: 'subject', key: 'subject', width: 120 },
    { title: 'Teacher', dataIndex: 'teacher', key: 'teacher', width: 120 },
    { title: 'Room', dataIndex: 'room', key: 'room', width: 100 },
    { title: 'Duration', dataIndex: 'duration', key: 'duration', width: 80 },
    { title: 'Subgroup', dataIndex: 'subgroup', key: 'subgroup', width: 100 }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <Spin size="large" />
        <Text className="ml-3">Loading published timetable...</Text>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error Loading Timetable"
        description={error}
        type="error"
        showIcon
        icon={<InfoCircleOutlined />}
      />
    );
  }

  if (!publishedTimetable) {
    return (
      <Empty 
        description="No published timetable available" 
        image={<CalendarOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
      />
    );
  }

  // Handle the case where the response contains a message (no active timetable)
  if (publishedTimetable.message) {
    return (
      <Alert
        message="No Active Timetable"
        description={publishedTimetable.message}
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
      />
    );
  }

  // Extract semesters data
  const semesters = publishedTimetable.semesters || {};
  const semesterKeys = Object.keys(semesters);

  if (semesterKeys.length === 0) {
    return (
      <Empty 
        description="No semester data available in published timetable" 
        image={<CalendarOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
      />
    );
  }

  return (
    <>
      <div className="flex justify-between mb-4">
        <div>
          <Title level={4}>Current Published Timetable</Title>
          <Text type="secondary">
            Published on: {new Date(publishedTimetable.published_date).toLocaleDateString()} | 
            Algorithm: {publishedTimetable.source?.algorithm || 'Unknown'} | 
            Version: {publishedTimetable.version || 1}
          </Text>
        </div>
        <Button 
          type="primary" 
          icon={<DownloadOutlined />} 
          onClick={() => setExportModalVisible(true)}
        >
          Export
        </Button>
      </div>

      <Card>
        <Tabs defaultActiveKey={semesterKeys[0]} type="card">
          {semesterKeys.map(semester => {
            const semesterData = formatSemesterData(semesters[semester]);
            const year = parseInt(semester.substring(3, 4));
            const sem = parseInt(semester.substring(4, 6));
            
            return (
              <TabPane 
                tab={`Year ${year} Semester ${sem}`} 
                key={semester}
              >
                <Table
                  dataSource={semesterData}
                  columns={columns}
                  bordered
                  size="middle"
                  pagination={{ 
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} of ${total} entries`
                  }}
                  scroll={{ x: 'max-content' }}
                />
              </TabPane>
            );
          })}
        </Tabs>
      </Card>
      
      {/* Export Modal */}
      <Modal
        title="Export Timetable"
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        footer={null}
      >
        <div className="p-4 flex justify-center space-x-4">
          <Button 
            type="primary" 
            icon={<FileExcelOutlined />} 
            size="large"
            onClick={exportAsPDF}
          >
            Export as PDF
          </Button>
          <Button 
            type="default" 
            icon={<FileOutlined />} 
            size="large"
            onClick={exportAsHTML}
          >
            Export as HTML
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default ActiveTimetable;
