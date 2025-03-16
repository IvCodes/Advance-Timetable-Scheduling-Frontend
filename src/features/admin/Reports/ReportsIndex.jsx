import React, { useState } from 'react';
import { Card, Typography, Row, Col, Menu, Spin } from 'antd';
import { 
  UserOutlined,
  HomeOutlined,
  LineChartOutlined,
  BarChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

// Import report components
import TeacherAllocationReport from './TeacherAllocationReport';
import SpaceOccupancyReport from './SpaceOccupancyReport';

const { Title } = Typography;

const ReportsIndex = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  
  // Determine which report to show based on path
  const getActiveKey = () => {
    const path = location.pathname;
    if (path.includes('teacher-allocation')) return 'teacher-allocation';
    if (path.includes('space-occupancy')) return 'space-occupancy';
    return 'overview';
  };
  
  const handleMenuClick = (e) => {
    const key = e.key;
    if (key === 'overview') {
      navigate('/admin/reports');
    } else if (key === 'teacher-allocation') {
      navigate('/admin/reports/teacher-allocation');
    } else if (key === 'space-occupancy') {
      navigate('/admin/reports/space-occupancy');
    }
  };

  // Render the appropriate report based on the URL
  const renderReport = () => {
    const currentKey = getActiveKey();
    
    switch (currentKey) {
      case 'teacher-allocation':
        return <TeacherAllocationReport />;
      case 'space-occupancy':
        return <SpaceOccupancyReport />;
      default:
        return (
          <div className="p-6" style={{ backgroundColor: '#f0f2f5' }}>
            <Card 
              style={{ backgroundColor: '#282828', color: '#f0f0f0', borderRadius: '8px' }}
              bodyStyle={{ padding: '24px' }}
            >
              <Title level={2} style={{ color: '#f0f0f0', marginBottom: '24px' }}>
                Timetable System Reports
              </Title>

              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Card 
                    hoverable
                    onClick={() => navigate('/admin/reports/teacher-allocation')}
                    style={{ 
                      backgroundColor: '#1f1f1f', 
                      color: '#f0f0f0', 
                      borderRadius: '8px',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="mr-4">
                        <UserOutlined style={{ fontSize: '36px', color: '#40a9ff' }} />
                      </div>
                      <div>
                        <Title level={4} style={{ color: '#f0f0f0', margin: '0 0 8px 0' }}>
                          Teacher Allocation Report
                        </Title>
                        <p style={{ color: '#aaaaaa' }}>
                          Analyze teacher workload, subject distribution, and allocation efficiency across faculties
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
                
                <Col xs={24} sm={12}>
                  <Card 
                    hoverable
                    onClick={() => navigate('/admin/reports/space-occupancy')}
                    style={{ 
                      backgroundColor: '#1f1f1f', 
                      color: '#f0f0f0', 
                      borderRadius: '8px',
                      height: '100%',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex items-center">
                      <div className="mr-4">
                        <HomeOutlined style={{ fontSize: '36px', color: '#40a9ff' }} />
                      </div>
                      <div>
                        <Title level={4} style={{ color: '#f0f0f0', margin: '0 0 8px 0' }}>
                          Space Occupancy Report
                        </Title>
                        <p style={{ color: '#aaaaaa' }}>
                          Review classroom and space utilization, capacity statistics, and optimize room assignments
                        </p>
                      </div>
                    </div>
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: '32px' }}>
                <Title level={4} style={{ color: '#f0f0f0' }}>Report Features</Title>
                <Card style={{ backgroundColor: '#1f1f1f', color: '#f0f0f0', borderRadius: '8px' }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <div className="text-center">
                        <LineChartOutlined style={{ fontSize: '32px', color: '#40a9ff', marginBottom: '16px' }} />
                        <h3 style={{ color: '#f0f0f0' }}>Visualized Data</h3>
                        <p style={{ color: '#aaaaaa' }}>Interactive charts and graphs for better data interpretation</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div className="text-center">
                        <BarChartOutlined style={{ fontSize: '32px', color: '#40a9ff', marginBottom: '16px' }} />
                        <h3 style={{ color: '#f0f0f0' }}>Filtering Options</h3>
                        <p style={{ color: '#aaaaaa' }}>Filter data by faculty, date range, space type, and more</p>
                      </div>
                    </Col>
                    <Col xs={24} sm={8}>
                      <div className="text-center">
                        <PieChartOutlined style={{ fontSize: '32px', color: '#40a9ff', marginBottom: '16px' }} />
                        <h3 style={{ color: '#f0f0f0' }}>Export Capabilities</h3>
                        <p style={{ color: '#aaaaaa' }}>Export reports in PDF and Excel formats for sharing</p>
                      </div>
                    </Col>
                  </Row>
                </Card>
              </div>
            </Card>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ 
        backgroundColor: '#1f1f1f', 
        borderBottom: '1px solid #3a3a3a', 
        padding: '0 16px' 
      }}>
        <Menu 
          mode="horizontal" 
          selectedKeys={[getActiveKey()]}
          onClick={handleMenuClick}
          style={{ 
            backgroundColor: 'transparent',
            color: '#f0f0f0',
            borderBottom: 'none'
          }}
          items={[
            {
              key: 'overview',
              icon: <LineChartOutlined />,
              label: 'Reports Overview'
            },
            {
              key: 'teacher-allocation',
              icon: <UserOutlined />,
              label: 'Teacher Allocation'
            },
            {
              key: 'space-occupancy',
              icon: <HomeOutlined />,
              label: 'Space Occupancy'
            }
          ]}
        />
      </div>
      
      <div style={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <Spin size="large" />
          </div>
        ) : (
          renderReport()
        )}
      </div>
    </div>
  );
};

export default ReportsIndex;
