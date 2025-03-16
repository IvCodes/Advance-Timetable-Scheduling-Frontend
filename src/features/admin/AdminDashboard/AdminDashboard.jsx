import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  Menu,
  Card,
  Typography,
  Row,
  Col,
  Button,
  Tabs,
  Spin,
  Divider,
  Statistic,
} from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  ScheduleOutlined,
  FileTextOutlined,
  TeamOutlined,
  HomeOutlined,
  BookOutlined,
} from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import FacultyAvailabilityManager from './FacultyAvailabilityManager';
import FacultyUnavailability from '../Timetable/FacultyUnavailability';
import TeacherAllocationReport from '../Reports/TeacherAllocationReport';
import SpaceOccupancyReport from '../Reports/SpaceOccupancyReport';
import AdminHome from './AdminHome'; // Import the AdminHome component
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { getPeriods, getSpaces } from "../DataManagement/data.api";
import { getUsers } from "../UserManagement/users.api";

const { Title, Text } = Typography;
const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get data from Redux store
  const { periods, spaces } = useSelector((state) => state.data);
  
  // Refs for smooth scrolling
  const timetableRef = useRef(null);
  const facultyAvailabilityRef = useRef(null);
  const dashboardRef = useRef(null);
  const reportsRef = useRef(null);
  
  // Fetch all necessary data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          dispatch(getPeriods()),
          dispatch(getSpaces()),
          fetchUsers()
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch]);

  // Separate function to fetch users
  const fetchUsers = async () => {
    try {
      const response = await dispatch(getUsers()).unwrap();
      setUsers(response || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };
  
  // Calculate current period
  const getCurrentPeriod = () => {
    const now = moment();
    const timeRanges = periods?.map((period) => {
      const [startTime, endTime] = period.long_name.split(" - ");
      return {
        name: period.name,
        startTime,
        endTime,
        isInterval: period.is_interval,
      };
    }) || [];
    return (
      timeRanges.find(
        (p) =>
          now.isBetween(
            moment(p.startTime, "HH:mm"),
            moment(p.endTime, "HH:mm")
          ) || now.isSame(moment(p.startTime, "HH:mm"), "minute")
      ) || { name: "NA", startTime: "-", endTime: "-" }
    );
  };

  // Get counts for dashboard stats
  const getFacultyCount = () => {
    return users.filter(user => user.role === "faculty").length;
  };

  const getStudentCount = () => {
    return users.filter(user => user.role === "student").length;
  };

  const getSpacesCount = () => {
    return spaces?.length || 0;
  };
  
  // Function to scroll to a specific section
  const scrollToRef = (ref) => {
    ref?.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Sidebar menu items
  const menuItems = [
    {
      key: 'dashboard',
      icon: <MenuUnfoldOutlined />,
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
      onClick: () => scrollToRef(reportsRef),
    },
  ];
  
  // Get current period data
  const currentPeriod = getCurrentPeriod();

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
                    {loading ? (
                      <div className="flex items-center justify-center h-96">
                        <Spin size="large" />
                      </div>
                    ) : (
                      <>
                        <Row gutter={[16, 16]}>
                          {/* Faculty Members */}
                          <Col xs={24} sm={12} md={6}>
                            <Card className="stat-card">
                              <Statistic
                                title="Faculty Members"
                                value={getFacultyCount()}
                                prefix={<UserOutlined style={{ color: '#40a9ff' }} />}
                                valueStyle={{ color: '#40a9ff' }}
                              />
                            </Card>
                          </Col>
                          
                          {/* Students */}
                          <Col xs={24} sm={12} md={6}>
                            <Card className="stat-card">
                              <Statistic
                                title="Students"
                                value={getStudentCount()}
                                prefix={<BookOutlined style={{ color: '#40a9ff' }} />}
                                valueStyle={{ color: '#40a9ff' }}
                              />
                            </Card>
                          </Col>
                          
                          {/* Available Spaces */}
                          <Col xs={24} sm={12} md={6}>
                            <Card className="stat-card">
                              <Statistic
                                title="Available Spaces"
                                value={getSpacesCount()}
                                prefix={<HomeOutlined style={{ color: '#40a9ff' }} />}
                                valueStyle={{ color: '#40a9ff' }}
                              />
                            </Card>
                          </Col>
                          
                          {/* Current Period */}
                          <Col xs={24} sm={12} md={6}>
                            <Card className="stat-card">
                              <div>
                                <p style={{ marginBottom: '8px' }}>Current Period</p>
                                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#40a9ff' }}>{currentPeriod.name}</div>
                                <div>
                                  {currentPeriod.startTime} - {currentPeriod.endTime}
                                </div>
                              </div>
                            </Card>
                          </Col>
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
                                onClick={() => scrollToRef(reportsRef)}
                              >
                                Generate Reports
                              </Button>
                            </Col>
                          </Row>
                        </div>
                      </>
                    )}
                  </div>
                </TabPane>
                
                <TabPane tab="Active Timetable" key="2">
                  <div className="active-timetable-tab">
                    {loading ? (
                      <Spin size="large" />
                    ) : (
                      <AdminHome />
                    )}
                  </div>
                </TabPane>
                
                <TabPane tab="Resource Utilization" key="3">
                  <div className="resource-utilization-tab">
                    <Row gutter={[16, 16]}>
                      <Col span={24}>
                        <Tabs defaultActiveKey="teacher-allocation">
                          <TabPane tab="Teacher Allocation" key="teacher-allocation">
                            <TeacherAllocationReport />
                          </TabPane>
                          <TabPane tab="Space Occupancy" key="space-occupancy">
                            <SpaceOccupancyReport />
                          </TabPane>
                        </Tabs>
                      </Col>
                    </Row>
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
          <div className="mb-6" ref={facultyAvailabilityRef}>
            <Card title={<Title level={3}>Faculty Availability Management</Title>}>
              <Tabs defaultActiveKey="availability" onChange={(key) => console.log(key)}>
                <TabPane tab="Availability Calendar" key="availability">
                  <FacultyAvailabilityManager />
                </TabPane>
                <TabPane tab="Faculty Unavailability" key="unavailability">
                  <FacultyUnavailability />
                </TabPane>
              </Tabs>
            </Card>
          </div>
          
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
