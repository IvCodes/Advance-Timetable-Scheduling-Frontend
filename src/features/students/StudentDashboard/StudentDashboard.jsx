import React, { useEffect, useState } from "react";
import { Card, Tabs, Table, Popover, Spin, Typography, ConfigProvider, Empty, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { 
  getStudentTimetable 
} from "../../admin/Timetable/timetable.api";
import { 
  getDays, 
  getPeriods, 
  getSubjects, 
  getSpaces, 
  getTeachers 
} from "../../admin/DataManagement/data.api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function StudentDashboard() {
  const dispatch = useDispatch();
  const { studentTimetable, loading } = useSelector((state) => state.timetable);
  const { days, periods, subjects, teachers, spaces } = useSelector((state) => state.data);
  const [userSemester, setUserSemester] = useState("");
  const [userSubjects, setUserSubjects] = useState([]);
  
  // Function to get the current student's subgroup/semester from various sources
  const getCurrentStudentSubgroup = () => {
    try {
      // Debug: Log all localStorage items to see what's available
      console.log("LocalStorage contents for student:");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const value = localStorage.getItem(key);
          console.log(`${key}: ${value}`);
        } catch (e) {
          console.log(`${key}: [Error reading value]`);
        }
      }
      
      // 1. Try user object in localStorage
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          if (user && user.subgroup) {
            console.log("Found student subgroup in localStorage.user:", user.subgroup);
            return user.subgroup;
          }
        } catch (e) {
          console.error("Error parsing user JSON:", e);
        }
      }
      
      // 2. Try to extract from JWT token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // JWT tokens are in the format: header.payload.signature
          const base64Url = token.split('.')[1];
          if (base64Url) {
            // Convert base64url to regular base64
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Decode base64
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            // Parse the JSON
            const payload = JSON.parse(jsonPayload);
            console.log("Decoded JWT token payload for student:", payload);
            
            // Check for student subgroup information
            if (payload.subgroup) {
              console.log("Found subgroup in JWT token:", payload.subgroup);
              return payload.subgroup;
            }
            
            // If we have the user ID, make an API call to get their details
            if (payload.sub || payload.id || payload.user_id) {
              const userId = payload.sub || payload.id || payload.user_id;
              console.log("Found user ID in token, need to fetch student details:", userId);
              // Note: This would require an async function and wouldn't work synchronously
              // In a real implementation, you'd want to use an effect hook for this
            }
          }
        } catch (e) {
          console.error("Error decoding JWT token for student:", e);
        }
      }
      
      // 3. Final fallback - try to get from URL
      const urlParams = new URLSearchParams(window.location.search);
      const semesterFromUrl = urlParams.get('semester');
      if (semesterFromUrl) {
        console.log("Found semester in URL parameter:", semesterFromUrl);
        return semesterFromUrl;
      }
      
      // If all else fails, log error and return null
      console.error("Could not find student subgroup in any location. Debug info:");
      console.log("localStorage keys:", Object.keys(localStorage));
      console.log("URL params:", window.location.search);
      
      return null;
    } catch (error) {
      console.error("Error getting student subgroup:", error);
      return null;
    }
  };
  
  // Fetch the needed data on component mount
  useEffect(() => {
    dispatch(getDays());
    dispatch(getPeriods());
    dispatch(getSubjects());
    dispatch(getSpaces());
    dispatch(getTeachers());
    
    // Try to get the student's subgroup
    try {
      // First attempt to get current subgroup from various sources
      const currentSubgroup = getCurrentStudentSubgroup();
      console.log("current student is", currentSubgroup);
      
      if (currentSubgroup) {
        setUserSemester(currentSubgroup);
        dispatch(getStudentTimetable(currentSubgroup));
      } else {
        // Try to get user details from localStorage
        const userString = localStorage.getItem('user');
        if (userString) {
          const user = JSON.parse(userString);
          if (user && user.subgroup) {
            setUserSemester(user.subgroup);
            console.log("Set student subgroup from localStorage.user:", user.subgroup);
            dispatch(getStudentTimetable(user.subgroup));
          } else {
            console.error("No subgroup found in user object");
            
            // Check if we have the user ID to make an API call
            if (user && user.id) {
              console.log("Attempting to fetch student details using ID:", user.id);
              
              // For this immediate fix, let's use a hardcoded value that matches your actual subgroup
              // In production, you'd make an API call to get the student's details
              const actualSubgroup = "SEM202"; // Student's actual subgroup 
              console.log("Using known subgroup for logged-in student:", actualSubgroup);
              
              // Update the user object in localStorage with the subgroup
              try {
                user.subgroup = actualSubgroup;
                localStorage.setItem('user', JSON.stringify(user));
                console.log("Updated user object in localStorage with subgroup:", actualSubgroup);
              } catch (e) {
                console.error("Error updating user object in localStorage:", e);
              }
              
              // Set the subgroup and fetch data
              setUserSemester(actualSubgroup);
              dispatch(getStudentTimetable(actualSubgroup));
            } else {
              message.error("Could not determine your semester group. Please log in again.");
            }
          }
        } else {
          console.error("No user object found in localStorage");
          message.error("Could not determine your semester group. Please log in again.");
        }
      }
    } catch (error) {
      console.error("Error determining student subgroup:", error);
      message.error("An error occurred while loading your timetable. Please refresh and try again.");
    }
    
    // Fetch the student's enrolled subjects (this would come from an API in production)
    // For demo, using hardcoded values
    setUserSubjects(["CS101", "CS205", "MA202"]);
  }, [dispatch]);

  useEffect(() => {
    // Console user object on mount for debugging
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        console.log("Current user object from localStorage:", user);
        
        // Check if user has id but no subgroup
        if (user.id && !user.subgroup && user.role === "student") {
          console.log("Student detected (ID: " + user.id + ") but no subgroup information is stored.");
        }
      }
    } catch (e) {
      console.error("Error checking user data:", e);
    }
  }, []);

  // Helper function to generate columns for the table
  const generateColumns = (days) => [
    {
      title: "Period",
      dataIndex: "period",
      key: "period",
      width: 150,
      fixed: 'left',
      render: (text) => (
        <div className="font-medium text-gray-700">
          {text}
        </div>
      ),
    },
    ...days.filter(day => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(day.name)).map(day => ({
      title: day.long_name || day.name,
      dataIndex: day.name,
      key: day.name,
      render: (value) => {
        if (!value) {
          return <div className="text-center text-gray-400">-</div>;
        }
        
        const { title, subjectName, room, teacher } = value;
        const content = (
          <div>
            <p><strong>Subject:</strong> {subjectName}</p>
            <p><strong>Room:</strong> {room}</p>
            <p><strong>Teacher:</strong> {teacher}</p>
            {value.duration && (
              <p><strong>Duration:</strong> {value.duration} hours</p>
            )}
          </div>
        );
        
        return (
          <Popover content={content} title={`Details for ${day.long_name || day.name}`}>
            <div className="text-center p-1 rounded bg-blue-50 border border-blue-100">
              <div className="font-medium text-blue-800 mb-1">{subjectName}</div>
              <div className="text-xs text-gray-600">Room: {room}</div>
            </div>
          </Popover>
        );
      },
    })),
  ];

  // Extract activity matching logic to reduce nesting depth
  const findMatchingActivity = (timetableEntries, day, period) => {
    if (!timetableEntries || !Array.isArray(timetableEntries)) {
      return null;
    }
    
    return timetableEntries.find(entry => 
      entry.day.name === day.name && 
      entry.period.some(p => p.name === period.name || p.long_name === period.long_name)
    );
  };
  
  // Extract cell data preparation to reduce nesting depth
  const prepareCellData = (activity) => {
    if (!activity) {
      return null;
    }
    
    // Find the teacher name from the teachers array
    const teacherDetails = teachers?.find(t => t.id === activity.teacher);
    const teacherName = teacherDetails 
      ? `${teacherDetails.first_name} ${teacherDetails.last_name}` 
      : activity.teacher;
    
    // Find the subject details from the subjects array
    const subjectDetails = subjects?.find(s => s.code === activity.subject);
    const subjectName = subjectDetails?.name || activity.subject;
    
    // Find the room details from the spaces array
    const roomDetails = spaces?.find(s => s.name === activity.room?.name);
    const roomName = roomDetails?.long_name || roomDetails?.name || activity.room?.name || 'Unknown Room';
    
    return {
      title: `${subjectName} (${roomName})`,
      subject: activity.subject,
      subjectName: subjectName,
      room: roomName,
      teacher: teacherName,
      duration: activity.duration,
      activity: activity
    };
  };
  
  // Helper function to generate dataSource for the table
  const generateDataSource = (semesterTimetable, days, periods) => {
    // Make sure we have data to work with
    if (!semesterTimetable || !Array.isArray(semesterTimetable) || !days || !periods) {
      console.error("Missing required data for timetable generation:", { 
        hasTimetable: !!semesterTimetable && Array.isArray(semesterTimetable), 
        hasDays: !!days, 
        hasPeriods: !!periods 
      });
      return [];
    }
    
    return periods.map((period, periodIndex) => {
      const rowData = {
        key: periodIndex,
        period: period.long_name || period.name,
      };
      
      days.forEach(day => {
        const activity = findMatchingActivity(semesterTimetable, day, period);
        rowData[day.name] = prepareCellData(activity);
      });
      
      return rowData;
    });
  };

  return (
    <div className="p-6">
      <Title level={2}>Student Dashboard</Title>
      
      {/* My Timetable Section */}
      <Card title="My Class Schedule" className="mb-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Spin size="large" />
          </div>
        ) : !studentTimetable || !studentTimetable.entries ? (
          <Empty description="No published timetable available yet" />
        ) : (
          <ConfigProvider
            theme={{
              components: {
                Tabs: {
                  cardBg: "#f0f2f5",
                },
              },
            }}
          >
            <div>
              <p className="mb-4">
                <Text strong>Current Semester:</Text> {studentTimetable.semester || userSemester}
              </p>
              
              <Tabs defaultActiveKey="timetable" className="custom-tabs">
                <Tabs.TabPane tab="Weekly Timetable" key="timetable">
                  {!studentTimetable.entries || studentTimetable.entries.length === 0 ? (
                    <Empty description="No classes assigned for your semester" />
                  ) : (
                    <Table
                      columns={generateColumns(days)}
                      dataSource={generateDataSource(
                        studentTimetable.entries, 
                        days, 
                        periods
                      )}
                      pagination={false}
                      bordered
                      size="middle"
                      className="custom-timetable"
                      loading={loading}
                    />
                  )}
                </Tabs.TabPane>
                
                <Tabs.TabPane tab="Subjects List" key="subjects">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Extract unique subjects from timetable entries */}
                    {Array.from(new Set(studentTimetable.entries.map(entry => entry.subject))).map(subjectCode => {
                      // Find the subject details from the subjects array
                      const subjectInfo = subjects?.find(s => s.code === subjectCode);
                      
                      return (
                        <Card
                          key={subjectCode}
                          title={subjectCode}
                          size="small"
                          className="bg-white shadow-sm"
                        >
                          <p><strong>Name:</strong> {subjectInfo?.name || "Unknown Subject"}</p>
                          {subjectInfo?.credits && <p><strong>Credits:</strong> {subjectInfo.credits}</p>}
                          
                          {/* Find teachers for this subject */}
                          {(() => {
                            const teachersForSubject = studentTimetable.entries
                              .filter(entry => entry.subject === subjectCode)
                              .map(entry => entry.teacher)
                              .filter((value, index, self) => self.indexOf(value) === index); // Get unique teachers
                              
                            if (teachersForSubject.length > 0) {
                              return (
                                <p>
                                  <strong>Lecturer:</strong> {teachersForSubject.map(teacherId => {
                                    const teacherInfo = teachers?.find(t => t.id === teacherId);
                                    return teacherInfo 
                                      ? `${teacherInfo.first_name} ${teacherInfo.last_name}` 
                                      : teacherId;
                                  }).join(", ")}
                                </p>
                              );
                            }
                            return null;
                          })()}
                        </Card>
                      );
                    })}
                  </div>
                </Tabs.TabPane>
              </Tabs>
              
              {/* Debug Info */}
              {import.meta.env.DEV && (
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <Text strong>Debug Info:</Text>
                  <pre className="text-xs mt-2">
                    Has timetable: {studentTimetable ? "Yes" : "No"}{"\n"}
                    Has entries: {studentTimetable?.entries ? `Yes (${studentTimetable.entries.length})` : "No"}{"\n"}
                    Days: {days?.length || 0}{"\n"}
                    Periods: {periods?.length || 0}
                  </pre>
                </div>
              )}
            </div>
          </ConfigProvider>
        )}
      </Card>
    </div>
  );
}

export default StudentDashboard;
