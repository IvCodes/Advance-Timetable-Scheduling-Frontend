import React, { useState, useEffect } from 'react';
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
  BookOutlined,
  TeamOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import FacultyAvailabilityManager from './FacultyAvailabilityManager';
import FacultyUnavailability from '../Timetable/FacultyUnavailability';
import TeacherAllocationReport from '../Reports/TeacherAllocationReport';
import SpaceOccupancyReport from '../Reports/SpaceOccupancyReport';
import ActiveTimetable from '../Timetable/ActiveTimetable'; // Import the new ActiveTimetable component
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { getPeriods, getSpaces } from "../DataManagement/data.api";
import { getUsers } from "../UserManagement/users.api";

const { Title } = Typography;
const { Content, Sider } = Layout;
const { TabPane } = Tabs;

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('1');
  const [facultyAvailabilityTab, setFacultyAvailabilityTab] = useState('availability');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get data from Redux store
  const { periods, spaces } = useSelector((state) => state.data);
  
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
  
  // Sidebar menu items
  const menuItems = [
    {
      key: 'dashboard',
      icon: <MenuUnfoldOutlined />,
      label: 'Overview',
      onClick: () => setActiveTab('1'),
    },
    {
      key: 'timetable',
      icon: <ScheduleOutlined />,
      label: 'Active Timetable',
      onClick: () => setActiveTab('2'),
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
          <Title level={2}>Admin Dashboard</Title>
          <Card className="mb-6">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              {/* Overview Tab */}
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
                      
                      {/* Faculty Availability Management */}
                      <div className="faculty-availability-section mb-6">
                        <Title level={4}>Faculty Availability Management</Title>
                        <Tabs 
                          activeKey={facultyAvailabilityTab} 
                          onChange={setFacultyAvailabilityTab}
                          className="mt-4"
                        >
                          <TabPane tab="Availability Calendar" key="availability">
                            <FacultyAvailabilityManager />
                          </TabPane>
                          <TabPane tab="Faculty Unavailability" key="unavailability">
                            <FacultyUnavailability />
                          </TabPane>
                        </Tabs>
                      </div>
                      
                      <Divider />
                      
                      {/* Quick Actions */}
                      <div className="actions-container">
                        <Title level={4}>Quick Actions</Title>
                        <Row gutter={[16, 16]}>
                          <Col xs={24} sm={8}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<ScheduleOutlined />} 
                              onClick={() => setActiveTab('2')}
                            >
                              View Active Timetable
                            </Button>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<BookOutlined />}
                            >
                              Manage Subjects
                            </Button>
                          </Col>
                          <Col xs={24} sm={8}>
                            <Button 
                              type="primary" 
                              size="large" 
                              block
                              icon={<HomeOutlined />}
                            >
                              Manage Spaces
                            </Button>
                          </Col>
                        </Row>
                      </div>
                    </>
                  )}
                </div>
              </TabPane>
              
              {/* Active Timetable Tab */}
              <TabPane tab="Active Timetable" key="2">
                <div className="active-timetable-tab">
                  <Tabs defaultActiveKey="timetable">
                    <TabPane tab="Show Active Timetable" key="timetable">
                      {loading ? (
                        <Spin size="large" />
                      ) : (
                        <Card bodyStyle={{ padding: '12px 24px' }}>
                          <ActiveTimetable />
                        </Card>
                      )}
                    </TabPane>
                    <TabPane tab="Teacher Allocation" key="teacher-allocation">
                      <TeacherAllocationReport />
                    </TabPane>
                    <TabPane tab="Space Occupancy" key="space-occupancy">
                      <SpaceOccupancyReport />
                    </TabPane>
                  </Tabs>
                </div>
              </TabPane>
            </Tabs>
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;
