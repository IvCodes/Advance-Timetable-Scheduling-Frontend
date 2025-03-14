import React, { useState, useRef } from 'react';
import { 
  Layout, 
  Menu, 
  Typography, 
  Card, 
  Button, 
  Tabs,
  Divider,
  Row,
  Col
} from 'antd';
import {
  DashboardOutlined,
  CalendarOutlined,
  ScheduleOutlined,
  TeamOutlined,
  BookOutlined,
  HomeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import FacultyAvailabilityManager from './FacultyAvailabilityManager';

const { Title, Text } = Typography;
const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  
  // Refs for smooth scrolling
  const timetableRef = useRef(null);
  const facultyAvailabilityRef = useRef(null);
  const dashboardRef = useRef(null);
  
  // Function to scroll to a specific section
  const scrollToRef = (ref) => {
    ref?.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Sidebar menu items
  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => scrollToRef(dashboardRef),
    },
    {
      key: 'timetable',
      icon: <ScheduleOutlined />,
      label: 'Timetable Management',
      onClick: () => scrollToRef(timetableRef),
    },
    {
      key: 'faculty',
      icon: <TeamOutlined />,
      label: 'Faculty Availability',
      onClick: () => scrollToRef(facultyAvailabilityRef),
    },
    {
      key: 'subjects',
      icon: <BookOutlined />,
      label: 'Subject Management',
    },
    {
      key: 'spaces',
      icon: <HomeOutlined />,
      label: 'Space Management',
    },
    {
      key: 'reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
    },
  ];
  
  // Admin dashboard statistics for quick overview
  const dashboardStats = [
    { title: 'Faculty Members', count: 45, icon: <TeamOutlined />, key: 'faculty-members' },
    { title: 'Courses', count: 120, icon: <BookOutlined />, key: 'courses' },
    { title: 'Available Spaces', count: 35, icon: <HomeOutlined />, key: 'spaces' },
    { title: 'Active Timetables', count: 8, icon: <CalendarOutlined />, key: 'timetables' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        width={250}
        style={{ background: '#001529' }}
      >
        <div className="demo-logo-vertical p-4">
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            {collapsed ? 'Admin' : 'Admin Dashboard'}
          </Title>
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, overflow: 'auto' }}>
          <div ref={dashboardRef}>
            <Title level={2}>Admin Dashboard</Title>
            <Card className="mb-6">
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <TabPane tab="Overview" key="1">
                  <div className="admin-dashboard-overview">
                    <Row gutter={[16, 16]}>
                      {dashboardStats.map((stat) => (
                        <Col xs={24} sm={12} md={6} key={stat.key}>
                          <Card className="stat-card text-center">
                            <div className="icon-container mb-2">{stat.icon}</div>
                            <Title level={3}>{stat.count}</Title>
                            <Text>{stat.title}</Text>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                    
                    <Divider />
                    
                    <div className="actions-container">
                      <Title level={4}>Quick Actions</Title>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={8}>
                          <Button 
                            type="primary" 
                            size="large" 
                            block
                            icon={<ScheduleOutlined />} 
                            onClick={() => scrollToRef(timetableRef)}
                          >
                            Manage Timetables
                          </Button>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Button 
                            type="primary" 
                            size="large" 
                            block
                            icon={<TeamOutlined />} 
                            onClick={() => scrollToRef(facultyAvailabilityRef)}
                          >
                            Manage Faculty Availability
                          </Button>
                        </Col>
                        <Col xs={24} sm={8}>
                          <Button 
                            type="primary" 
                            size="large" 
                            block
                            icon={<FileTextOutlined />}
                          >
                            Generate Reports
                          </Button>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </TabPane>
                <TabPane tab="Notifications" key="2">
                  <div className="admin-notifications">
                    <Card title="Recent Notifications" className="mb-4">
                      <div className="notification-item p-3 mb-2 border-bottom">
                        <Text strong>Faculty Availability Request</Text>
                        <div>
                          <Text>John Doe has requested unavailability for March 15, 2025</Text>
                        </div>
                        <div className="text-muted">
                          <Text type="secondary">2 hours ago</Text>
                        </div>
                      </div>
                      <div className="notification-item p-3 mb-2 border-bottom">
                        <Text strong>Substitute Assignment</Text>
                        <div>
                          <Text>Jane Smith has been assigned as a substitute for CS101 on March 20, 2025</Text>
                        </div>
                        <div className="text-muted">
                          <Text type="secondary">5 hours ago</Text>
                        </div>
                      </div>
                      <div className="notification-item p-3">
                        <Text strong>New Timetable Generated</Text>
                        <div>
                          <Text>A new timetable has been generated for Year 2 Semester 1</Text>
                        </div>
                        <div className="text-muted">
                          <Text type="secondary">1 day ago</Text>
                        </div>
                      </div>
                    </Card>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </div>
          
          {/* Timetable Management Section */}
          <div className="mb-6" ref={timetableRef}>
            <Card title={<Title level={3}>Timetable Management</Title>}>
              <div className="mb-3">
                <Text>
                  Manage and generate timetables for different years and semesters.
                  View conflicts, manage constraints, and publish finalized timetables.
                </Text>
              </div>
              <div className="mt-4">
                <Button type="primary">
                  Go to Timetable Management
                </Button>
              </div>
            </Card>
          </div>
          
          {/* Faculty Availability Management Section */}
          <div ref={facultyAvailabilityRef}>
            <FacultyAvailabilityManager />
          </div>
          
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
