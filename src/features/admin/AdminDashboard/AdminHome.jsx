import React, { useState, useEffect } from 'react';
import { Typography, Row, Col, Card, Button, Table, Empty, Modal, Spin } from 'antd';
import {
  DownloadOutlined,
  FileExcelOutlined,
  FileOutlined,
  HomeOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getPublishedTimetable } from '../Timetable/timetable.api';
import moment from 'moment';

const { Title } = Typography;

const AdminHome = () => {
  const dispatch = useDispatch();
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishedTimetable, setPublishedTimetable] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch the published timetable directly from the backend
        const timetableResult = await dispatch(getPublishedTimetable()).unwrap();
        setPublishedTimetable(timetableResult);
      } catch (error) {
        console.error("Error fetching data:", error);
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

  // Function to render the timetable view
  const renderTimetableView = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-10">
          <Spin size="large" />
        </div>
      );
    }

    if (!publishedTimetable || !publishedTimetable.timetable) {
      return <Empty description="No published timetable available" />;
    }

    // Format timetable data for rendering
    const timetableData = [];
    
    // Example structure - adjust based on your actual data structure
    if (publishedTimetable.timetable.days) {
      publishedTimetable.timetable.days.forEach(day => {
        publishedTimetable.timetable.periods.forEach(period => {
          const slot = publishedTimetable.timetable.slots?.find(
            slot => slot.day === day.name && slot.period === period.name
          );
          
          if (slot) {
            timetableData.push({
              key: `${day.name}-${period.name}`,
              day: day.name,
              period: period.name,
              time: period.long_name,
              subject: slot.subject,
              teacher: slot.teacher,
              room: slot.room,
              class: slot.student_group || 'N/A'
            });
          }
        });
      });
    }

    const columns = [
      { title: 'Day', dataIndex: 'day', key: 'day' },
      { title: 'Period', dataIndex: 'period', key: 'period' },
      { title: 'Time', dataIndex: 'time', key: 'time' },
      { title: 'Subject', dataIndex: 'subject', key: 'subject' },
      { title: 'Teacher', dataIndex: 'teacher', key: 'teacher' },
      { title: 'Room', dataIndex: 'room', key: 'room' },
      { title: 'Class', dataIndex: 'class', key: 'class' }
    ];

    return (
      <div>
        <div className="flex justify-between mb-4">
          <Title level={4}>Current Published Timetable</Title>
          <Button 
            type="primary" 
            icon={<DownloadOutlined />} 
            onClick={() => setExportModalVisible(true)}
          >
            Export
          </Button>
        </div>
        <Table
          dataSource={timetableData}
          columns={columns}
          bordered
          size="middle"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </div>
    );
  };

  return (
    <div className="p-6" style={{ backgroundColor: '#f0f2f5' }}>
      <Row>
        <Col span={24}>
          <Card 
            bodyStyle={{ padding: '12px 24px' }}
          >
            {renderTimetableView()}
          </Card>
        </Col>
      </Row>
      
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
    </div>
  );
};

export default AdminHome;
