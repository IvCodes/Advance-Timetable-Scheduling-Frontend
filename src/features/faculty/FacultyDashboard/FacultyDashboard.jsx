import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../../../components/sidebar/Sidebar";
import { Outlet } from "react-router-dom";
import { 
  Card, 
  Tabs, 
  Table, 
  Popover, 
  Spin, 
  Typography, 
  ConfigProvider, 
  Empty, 
  Calendar, 
  Badge, 
  Modal, 
  Button,
  Switch,
  message,
  Space,
  Input,
  Row,
  Col,
  Statistic,
  Alert,
  Divider,
  Tooltip
} from "antd";
import { 
  InfoCircleOutlined, 
  ClockCircleOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  UserSwitchOutlined,
  CalendarOutlined,
  BookOutlined,
  ReadOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from "react-redux";
import { 
  getTimetable 
} from "../../admin/Timetable/timetable.api";
import { 
  getDays, 
  getPeriods, 
  getSubjects, 
  getSpaces, 
  getTeachers 
} from "../../admin/DataManagement/data.api";
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

// Function to get all unavailable days for a faculty member
const getFacultyUnavailableDays = async (facultyId) => {
  try {
    // Call the actual API endpoint
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/faculty/unavailable-days/${facultyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching faculty unavailable days:", error);
    // Fallback mock data in case the API isn't fully implemented yet
    return [
      {
        date: '2025-03-15',
        reason: 'Medical appointment',
        status: 'approved'
      },
      {
        date: '2025-03-20',
        reason: 'Conference attendance',
        status: 'pending'
      },
      {
        date: '2025-03-22',
        reason: 'Family emergency',
        status: 'approved'
      },
    ];
  }
};

// Function to mark a day as unavailable
const markDayAsUnavailable = async (facultyId, date, reason) => {
  try {
    // Call the actual API endpoint
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/faculty/unavailable-days`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        faculty_id: facultyId,
        date,
        reason
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error marking day as unavailable:", error);
    // Return false to indicate failure during development
    return false;
  }
};

// Function to mark a day as available (remove from unavailable list)
const markDayAsAvailable = async (facultyId, date) => {
  try {
    // Call the actual API endpoint
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/v1/faculty/unavailable-days/${facultyId}/${date}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Error marking day as available:", error);
    // Return false to indicate failure during development
    return false;
  }
};

// Function to get current active classes
const getCurrentClasses = (timetable, facultyId, currentDay, currentPeriod) => {
  if (!timetable || !timetable.length) return [];
  
  const activeClasses = [];
  
  timetable.forEach(semesterData => {
    semesterData.timetable
      .filter(entry => 
        entry.teacher === facultyId && 
        entry.day.name.toLowerCase() === currentDay.toLowerCase() &&
        entry.period.some(p => p.name === currentPeriod)
      )
      .forEach(entry => {
        activeClasses.push({
          semester: semesterData.semester,
          subject: entry.subject,
          room: entry.room.name,
          duration: entry.duration
        });
      });
  });
  
  return activeClasses;
};

const FacultyDashboard = () => {
  const dispatch = useDispatch();
  const { timetable, loading } = useSelector((state) => state.timetable);
  const { days, periods, subjects, teachers, spaces } = useSelector((state) => state.data);
  
  // Refs for scroll functionality
  const timetableRef = useRef(null);
  const availabilityRef = useRef(null);
  const currentClassesRef = useRef(null);
  
  // Faculty state
  const [facultyId, setFacultyId] = useState(null);
  const [facultySubjects, setFacultySubjects] = useState([]);
  const [unavailableDays, setUnavailableDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [unavailabilityReason, setUnavailabilityReason] = useState('');
  
  // Current time tracking
  const [currentDate, setCurrentDate] = useState(dayjs());
  const [currentDayName, setCurrentDayName] = useState('');
  const [currentPeriodName, setCurrentPeriodName] = useState('');
  const [activeClasses, setActiveClasses] = useState([]);
  
  // Scroll to ref function
  const scrollToRef = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  // Sidebar links with scroll functionality
  const sidebarLinks = [
    { 
      id: 1, 
      href: "#dashboard", 
      text: "Dashboard",
      onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    { 
      id: 2, 
      href: "#current-class", 
      text: "Current Class",
      onClick: () => scrollToRef(currentClassesRef)
    },
    { 
      id: 3, 
      href: "#timetable", 
      text: "My Timetable", 
      onClick: () => scrollToRef(timetableRef)
    },
    { 
      id: 4, 
      href: "#availability", 
      text: "My Availability",
      onClick: () => scrollToRef(availabilityRef)
    }
  ];
  
  // Fetch the needed data on component mount
  useEffect(() => {
    dispatch(getTimetable());
    dispatch(getDays());
    dispatch(getPeriods());
    dispatch(getSubjects());
    dispatch(getSpaces());
    dispatch(getTeachers());
    
    // Get user details from localStorage
    const userId = localStorage.getItem("user_id");
    setFacultyId(userId || "FA0000001"); // Fallback to example ID for demo
    
    // Fetch faculty's assigned subjects
    // In production, this would come from an API call
    setFacultySubjects(["CS101", "CS305"]); // Example subject codes
    
    // Set up timer to update current time
    const timer = setInterval(() => {
      const now = dayjs();
      setCurrentDate(now);
      
      // Get day name
      const dayNumber = now.day(); // 0-6, 0 is Sunday
      if (dayNumber > 0 && dayNumber < 6) { // Monday to Friday
        // Map 1-5 to day names in your system
        const dayMap = {
          1: 'monday',
          2: 'tuesday',
          3: 'wednesday',
          4: 'thursday',
          5: 'friday'
        };
        setCurrentDayName(dayMap[dayNumber]);
        
        // Determine current period
        // This is a simplified example - in a real app, we'd check actual period times
        const hour = now.hour();
        let currentPeriod = '';
        
        if (hour >= 8 && hour < 10) currentPeriod = 'p1';
        else if (hour >= 10 && hour < 12) currentPeriod = 'p2';
        else if (hour >= 13 && hour < 15) currentPeriod = 'p3';
        else if (hour >= 15 && hour < 17) currentPeriod = 'p4';
        
        setCurrentPeriodName(currentPeriod);
      } else {
        // Weekend
        setCurrentDayName('');
        setCurrentPeriodName('');
      }
    }, 60000); // Update every minute
    
    // Initial set of current day and period
    const now = dayjs();
    const dayNumber = now.day();
    if (dayNumber > 0 && dayNumber < 6) {
      const dayMap = {
        1: 'monday',
        2: 'tuesday',
        3: 'wednesday',
        4: 'thursday',
        5: 'friday'
      };
      setCurrentDayName(dayMap[dayNumber]);
      
      const hour = now.hour();
      let currentPeriod = '';
      
      if (hour >= 8 && hour < 10) currentPeriod = 'p1';
      else if (hour >= 10 && hour < 12) currentPeriod = 'p2';
      else if (hour >= 13 && hour < 15) currentPeriod = 'p3';
      else if (hour >= 15 && hour < 17) currentPeriod = 'p4';
      
      setCurrentPeriodName(currentPeriod);
    }
    
    return () => clearInterval(timer);
  }, [dispatch]);
  
  // Fetch unavailable days when facultyId is set
  useEffect(() => {
    if (facultyId) {
      const fetchUnavailableDays = async () => {
        const daysData = await getFacultyUnavailableDays(facultyId);
        setUnavailableDays(daysData);
      };
      fetchUnavailableDays();
    }
  }, [facultyId]);
  
  // Update active classes when currentDayName, currentPeriodName, or timetable changes
  useEffect(() => {
    if (facultyId && currentDayName && currentPeriodName && timetable) {
      const classes = getCurrentClasses(timetable, facultyId, currentDayName, currentPeriodName);
      setActiveClasses(classes);
    } else {
      setActiveClasses([]);
    }
  }, [facultyId, currentDayName, currentPeriodName, timetable]);
  
  // Helper function to generate table columns for timetable
  const generateColumns = (days) => [
    {
      title: "Periods",
      dataIndex: "period",
      key: "period",
      width: 150,
    },
    ...days
      .filter(day => {
        // Only include weekdays (assuming day names or codes match)
        const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        return weekdays.includes(day.name.toLowerCase());
      })
      .map((day) => ({
        title: day.long_name,
        dataIndex: day.name,
        key: day.name,
        render: (value) => {
          if (value) {
            const { title, subject, room, teacher, duration } = value;
            const s = subjects?.find((s) => s.code === subject);
            const r = spaces?.find((r) => r.name === room);
            const t = teachers?.find((t) => t.id === teacher);
            const content = (
              <div>
                <p><strong>Subject:</strong> {s?.long_name}</p>
                <p><strong>Room:</strong> {r?.long_name} ({r?.code})</p>
                <p><strong>Teacher:</strong> {t?.first_name} {t?.last_name}</p>
                <p><strong>Duration:</strong> {duration} hours</p>
              </div>
            );
            return (
              <Popover content={content} title={`Details for ${day.long_name}`}>
                <div className="text-center">{title}</div>
              </Popover>
            );
          }
          return <div className="text-center">-</div>;
        },
      })),
  ];

  // Helper function to generate dataSource for the table
  const generateDataSource = (semesterTimetable, days, periods) => {
    // Filter to only include weekdays
    const weekdayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekdayDays = days.filter(day => 
      weekdayNames.includes(day.name.toLowerCase())
    );
    
    return periods.map((period, periodIndex) => ({
      key: periodIndex,
      period: period.long_name,
      ...weekdayDays.reduce((acc, day) => {
        const activity = semesterTimetable.find(
          (entry) =>
            entry.day.name === day.name &&
            entry.period.some((p) => p.name === period.name) &&
            (entry.teacher === facultyId || facultySubjects.includes(entry.subject))
        );
        acc[day.name] = activity
          ? {
              title: `${activity.subject} (${activity.room.name})`,
              subject: activity.subject,
              room: activity.room.name,
              teacher: activity.teacher,
              duration: activity.duration,
            }
          : null;
        return acc;
      }, {}),
    }));
  };

  // Function to get semester name in readable format  
  const getSemName = (semester) => {
    const year = parseInt(semester.substring(3, 4));
    const sem = parseInt(semester.substring(4, 6));
    return { year, sem };
  };
  
  // Calendar date cell renderer
  const dateCellRender = (date) => {
    const dateString = date.format('YYYY-MM-DD');
    const dayOfWeek = date.day(); // 0 is Sunday, 6 is Saturday
    
    // Skip rendering for weekends (Saturday and Sunday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return <Badge status="default" text="Weekend" />;
    }
    
    const unavailableDay = unavailableDays.find(day => day.date === dateString);
    
    if (unavailableDay) {
      return (
        <div>
          <Badge status="error" text="Unavailable" />
          {unavailableDay.reason && (
            <Tooltip title={unavailableDay.reason}>
              <InfoCircleOutlined style={{ marginLeft: 5 }} />
            </Tooltip>
          )}
        </div>
      );
    }
    
    return null;
  };
  
  // Calendar date render for disabling weekends
  const disabledDate = (date) => {
    const dayOfWeek = date.day();
    // Disable weekends (0 = Sunday, 6 = Saturday)
    return dayOfWeek === 0 || dayOfWeek === 6;
  };
  
  // Handle calendar date selection
  const handleCalendarSelect = (date) => {
    const dayOfWeek = date.day();
    // Don't open modal for weekends
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return;
    }
    
    setSelectedDate(date.format('YYYY-MM-DD'));
    
    // Check if this date is already marked as unavailable
    const existingDate = unavailableDays.find(day => day.date === date.format('YYYY-MM-DD'));
    if (existingDate) {
      setUnavailabilityReason(existingDate.reason || '');
    } else {
      setUnavailabilityReason('');
    }
    
    setIsModalVisible(true);
  };
  
  // Handle marking a day as unavailable
  const handleMarkUnavailable = async (isAvailable) => {
    if (!selectedDate) return;
    
    const isAlreadyUnavailable = unavailableDays.some(day => day.date === selectedDate);
    let success;
    
    if (isAlreadyUnavailable && isAvailable) {
      // Mark as available (remove from unavailable list)
      success = await markDayAsAvailable(facultyId, selectedDate);
      if (success) {
        setUnavailableDays(unavailableDays.filter(day => day.date !== selectedDate));
        message.success(`You are now available on ${selectedDate}`);
      } else {
        message.error("Failed to update availability");
      }
    } else if (!isAlreadyUnavailable && !isAvailable) {
      // Mark as unavailable
      success = await markDayAsUnavailable(facultyId, selectedDate, unavailabilityReason);
      if (success) {
        setUnavailableDays([...unavailableDays, { date: selectedDate, reason: unavailabilityReason }]);
        message.success(`You are now marked as unavailable on ${selectedDate}`);
      } else {
        message.error("Failed to update availability");
      }
    }
    
    setIsModalVisible(false);
  };

  const markClassDayAsUnavailable = async (cls) => {
    try {
      // Extract date from the class day
      const classDate = new Date();
      // Set the day of week based on the class day
      const dayMapping = {
        'Monday': 1,
        'Tuesday': 2,
        'Wednesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
        'Sunday': 0
      };
      
      // Get the day name from the class
      const dayName = cls.day?.name || '';
      
      // Set to the next occurrence of this day
      const currentDay = classDate.getDay();
      const targetDay = dayMapping[dayName];
      
      if (targetDay !== undefined) {
        const daysToAdd = (targetDay + 7 - currentDay) % 7;
        classDate.setDate(classDate.getDate() + daysToAdd);
        
        // Format the date as YYYY-MM-DD
        const formattedDate = classDate.toISOString().split('T')[0];
        
        // Create reason based on class details
        const reason = `Unavailable for ${cls.subject?.name || 'class'} (${cls.period?.name || 'period'})`;
        
        const response = await fetch(`${API_URL}/faculty/unavailable-days`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            faculty_id: facultyId,
            date: formattedDate,
            reason: reason
          })
        });
        
        if (response.ok) {
          notification.success({
            message: 'Success',
            description: `Marked as unavailable for ${dayName}`
          });
          fetchUnavailableDays();
        } else {
          const errorData = await response.json();
          notification.error({
            message: 'Error',
            description: errorData.detail || 'Failed to mark day as unavailable'
          });
        }
      } else {
        notification.error({
          message: 'Error',
          description: 'Invalid day of week'
        });
      }
    } catch (error) {
      console.error('Error marking class day as unavailable:', error);
      notification.error({
        message: 'Error',
        description: 'An error occurred while marking day as unavailable'
      });
    }
  };

  return (
    <div>
      <div className="flex flex-grow overflow-hidden">
        <Sidebar links={sidebarLinks} />
        <div className="flex-grow p-6 bg-gray-100 overflow-y-auto">
          <Title level={2} id="dashboard">Faculty Dashboard</Title>
          
          {/* Current Classes Section */}
          <Card 
            title="Current Classes" 
            className="mb-6"
            ref={currentClassesRef}
            id="current-class"
          >
            <div className="mb-4">
              <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic 
                      title="Current Date" 
                      value={currentDate.format('MMMM D, YYYY')} 
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic 
                      title="Current Time" 
                      value={currentDate.format('HH:mm')} 
                    />
                  </Col>
                </Row>
                
                {currentDayName && currentPeriodName ? (
                  <Alert
                    message={`Current Period: ${currentPeriodName.toUpperCase()}`}
                    description={`Day: ${currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1)}`}
                    type="info"
                    showIcon
                  />
                ) : (
                  <Alert
                    message="No Active Period"
                    description="There are no active periods at this time or it's a weekend."
                    type="warning"
                    showIcon
                  />
                )}
                
                {activeClasses.length > 0 ? (
                  <div>
                    <Divider orientation="left">Active Classes</Divider>
                    {activeClasses.map((cls) => (
                      <Card key={`${cls.subject?.code || ''}-${cls.day?.code || ''}-${cls.period?.code || ''}`} size="small" className="mb-2">
                        <Row gutter={16}>
                          <Col span={8}>
                            <Text strong>Subject:</Text>
                            <br />
                            <Text>{cls.subject?.name || 'N/A'}</Text>
                          </Col>
                          <Col span={5}>
                            <Text strong>Room:</Text>
                            <br />
                            <Text>{cls.room?.name || 'N/A'}</Text>
                          </Col>
                          <Col span={5}>
                            <Text strong>Day:</Text>
                            <br />
                            <Text>{cls.day?.name || 'N/A'}</Text>
                          </Col>
                          <Col span={6}>
                            <Text strong>Time:</Text>
                            <br />
                            <Text>{cls.period?.name || 'N/A'}</Text>
                          </Col>
                          <Col span={24} style={{ marginTop: '8px' }}>
                            <Button 
                              type="primary" 
                              size="small" 
                              danger 
                              onClick={() => markClassDayAsUnavailable(cls)}
                            >
                              Mark as Unavailable
                            </Button>
                            <Tooltip title="This will mark you as unavailable for this class on the next occurrence of this day">
                              <InfoCircleOutlined style={{ marginLeft: 8 }} />
                            </Tooltip>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty description="No active classes at the moment" />
                )}
              </Space>
            </div>
          </Card>
          
          {/* Faculty Timetable */}
          <Card 
            title="My Teaching Schedule" 
            className="mb-6"
            ref={timetableRef}
            id="timetable"
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : timetable && timetable.length > 0 ? (
              <ConfigProvider
                theme={{
                  components: {
                    Tabs: {
                      itemColor: "#fff",
                    }
                  }
                }}
              >
                <Tabs type="card">
                  {timetable
                    .map((semesterTimetable) => {
                      const semester = semesterTimetable.semester;
                      const columns = generateColumns(days);
                      const dataSource = generateDataSource(
                        semesterTimetable.timetable,
                        days,
                        periods
                      );
                      
                      return (
                        <TabPane
                          tab={`Year ${getSemName(semester).year} Semester ${getSemName(semester).sem}`}
                          key={`${semester}_${semesterTimetable._id || Math.random().toString(36).substring(2, 7)}`}
                          className="text-lightborder"
                        >
                          <ConfigProvider
                            theme={{
                              components: {
                                Table: {
                                  colorBgContainer: "transparent",
                                  colorText: "rgba(0,0,0,0.88)",
                                  headerColor: "rgba(0,0,0,0.88)",
                                  borderColor: "#d9d9d9",
                                  headerBg: "#f5f5f5",
                                }
                              }
                            }}
                          >
                            <Table
                              columns={columns}
                              dataSource={dataSource}
                              pagination={false}
                              bordered
                              size="middle"
                              className="custom-timetable"
                            />
                          </ConfigProvider>
                        </TabPane>
                      );
                    })}
                </Tabs>
              </ConfigProvider>
            ) : (
              <Empty description="No teaching schedule available" />
            )}
          </Card>
          
          {/* Availability Calendar */}
          <Card 
            title="Manage Availability" 
            className="mb-6"
            ref={availabilityRef}
            id="availability"
          >
            <div className="mb-4">
              <Paragraph>
                Use the calendar below to mark days when you are unavailable to teach.
                This information will be visible to administrators for planning.
                <br />
                <Text type="secondary">Note: Weekends are already marked as non-working days.</Text>
              </Paragraph>
            </div>
            <Calendar 
              dateCellRender={dateCellRender} 
              onSelect={handleCalendarSelect}
              disabledDate={disabledDate}
              className="faculty-calendar"
            />
          </Card>
          
          {/* Statistics cards for overview of unavailable days */}
          <div className="faculty-stats mb-6">
            <Row gutter={[16, 16]}>
              {[
                { 
                  title: 'Pending Requests', 
                  value: unavailableDays.filter(day => day.status === 'pending').length, 
                  icon: <ClockCircleOutlined />,
                  key: 'pending-requests' 
                },
                { 
                  title: 'Approved Requests', 
                  value: unavailableDays.filter(day => day.status === 'approved').length, 
                  icon: <CheckCircleOutlined />,
                  key: 'approved-requests'
                },
                { 
                  title: 'Denied Requests', 
                  value: unavailableDays.filter(day => day.status === 'denied').length, 
                  icon: <CloseCircleOutlined />,
                  key: 'denied-requests'
                },
                { 
                  title: 'Assigned Substitutes', 
                  value: unavailableDays.filter(day => day.substitute_id).length, 
                  icon: <UserSwitchOutlined />,
                  key: 'substitute-assignments'
                },
              ].map((stat) => (
                <Col xs={24} sm={12} md={6} key={stat.key}>
                  <Card>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      prefix={stat.icon}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
          
          {/* Availability Modal */}
          <Modal
            title="Update Availability"
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            <div className="mb-4">
              <Text>Date: {selectedDate}</Text>
            </div>
            
            <div className="mb-4">
              <Space>
                <Text>Available:</Text>
                <Switch 
                  defaultChecked={!unavailableDays.some(day => day.date === selectedDate)}
                  onChange={(checked) => handleMarkUnavailable(checked)}
                />
              </Space>
            </div>
            
            {!unavailableDays.some(day => day.date === selectedDate) && (
              <div className="mb-4">
                <Text>Reason for unavailability (optional):</Text>
                <TextArea 
                  rows={4} 
                  placeholder="Enter reason for unavailability" 
                  value={unavailabilityReason}
                  onChange={(e) => setUnavailabilityReason(e.target.value)}
                  className="mt-2"
                />
                
                <div className="mt-4">
                  <Button 
                    type="primary" 
                    onClick={() => handleMarkUnavailable(false)}
                  >
                    Mark as Unavailable
                  </Button>
                  <Button 
                    onClick={() => setIsModalVisible(false)}
                    style={{ marginLeft: 8 }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </Modal>
          
          {/* For more complex pages */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
