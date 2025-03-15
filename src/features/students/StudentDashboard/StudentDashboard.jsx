import React, { useEffect, useState } from "react";
import { Card, Tabs, Table, Popover, Spin, Typography, ConfigProvider, Empty } from "antd";
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
  
  // Fetch the needed data on component mount
  useEffect(() => {
    dispatch(getDays());
    dispatch(getPeriods());
    dispatch(getSubjects());
    dispatch(getSpaces());
    dispatch(getTeachers());
    
    // Get user details from localStorage or state
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        if (user && user.semester) {
          setUserSemester(user.semester);
          console.log("Set student semester from localStorage:", user.semester);
          
          // Fetch semester-specific published timetable
          dispatch(getStudentTimetable(user.semester));
        } else {
          // For demo purposes - set a default semester if not in localStorage
          const defaultSemester = "SEM101"; // Using a valid semester ID from database
          setUserSemester(defaultSemester);
          console.log("Using default semester:", defaultSemester);
          dispatch(getStudentTimetable(defaultSemester));
        }
      } else {
        // For demo purposes - set a default semester if user not in localStorage
        const defaultSemester = "SEM101"; // Using a valid semester ID from database
        setUserSemester(defaultSemester);
        console.log("Using default semester:", defaultSemester);
        dispatch(getStudentTimetable(defaultSemester));
      }
    } catch (error) {
      console.error("Error getting user data from localStorage:", error);
      // Use default semester for demo purposes
      const defaultSemester = "SEM101"; // Using a valid semester ID from database
      setUserSemester(defaultSemester);
      console.log("Using default semester after error:", defaultSemester);
      dispatch(getStudentTimetable(defaultSemester));
    }
    
    // Fetch the student's enrolled subjects
    // This would typically come from an API call
    setUserSubjects(["CS101", "CS205", "MA202"]); // Example subject codes
  }, [dispatch]);

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
    
    console.log("Generating timetable for student with entries:", semesterTimetable);
    console.log("Available periods:", periods);
    
    // Filter to only include weekdays
    const weekdayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekdayDays = days.filter(day => 
      weekdayNames.includes(day.name.toLowerCase())
    );
    
    // Sort periods by start time
    const sortedPeriods = [...(periods || [])].sort((a, b) => {
      // Extract hours and minutes from period times
      if (!a.start_time || !b.start_time) return 0;
      
      const [aHours, aMinutes] = a.start_time.split(':').map(Number);
      const [bHours, bMinutes] = b.start_time.split(':').map(Number);
      
      // Compare hours first, then minutes if hours are equal
      if (aHours !== bHours) {
        return aHours - bHours;
      }
      return aMinutes - bMinutes;
    });
    
    console.log("Sorted periods:", sortedPeriods.map(p => `${p.name}: ${p.long_name}`));
    console.log("Weekday days:", weekdayDays.map(d => `${d.name}: ${d.long_name}`));
    
    if (sortedPeriods.length === 0) {
      console.warn("No periods available to generate timetable!");
      return [];
    }
    
    return sortedPeriods.map((period, periodIndex) => {
      const rowData = {
        key: periodIndex,
        period: `${period.long_name || period.name}\n${period.start_time || ''} - ${period.end_time || ''}`,
      };
      
      // Add a column for each day
      weekdayDays.forEach(day => {
        // Find activity for this cell
        const activity = semesterTimetable.find(entry => {
          // Check if day matches (case insensitive)
          const dayMatch = 
            entry.day &&
            (entry.day.name?.toLowerCase() === day.name?.toLowerCase() || 
             entry.day.long_name?.toLowerCase() === day.long_name?.toLowerCase());
          
          if (!dayMatch) return false;
          
          // Check if period matches
          let periodMatch = false;
          
          if (entry.period) {
            if (Array.isArray(entry.period)) {
              // Check each period in the array
              periodMatch = entry.period.some(p => 
                p.name?.toLowerCase() === period.name?.toLowerCase() ||
                p.long_name?.toLowerCase().includes(period.long_name?.toLowerCase())
              );
            } else {
              // Single period object
              periodMatch = 
                entry.period.name?.toLowerCase() === period.name?.toLowerCase() ||
                entry.period.long_name?.toLowerCase().includes(period.long_name?.toLowerCase());
            }
          }
          
          if (dayMatch && periodMatch) {
            console.log(`Found match: Day=${day.name}, Period=${period.name}, Subject=${entry.subject}`);
          }
          
          return dayMatch && periodMatch;
        });
        
        // If we found an activity for this day/period
        if (activity) {
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
          
          rowData[day.name] = {
            title: `${subjectName} (${roomName})`,
            subject: activity.subject,
            subjectName: subjectName,
            room: roomName,
            teacher: teacherName,
            duration: activity.duration,
            activity: activity
          };
        } else {
          rowData[day.name] = null;
        }
      });
      
      return rowData;
    });
  };

  // Helper function to generate columns for the table
  const generateColumns = (days) => {
    // Filter to only include weekdays
    const weekdayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekdayDays = days.filter(day => 
      weekdayNames.includes(day.name.toLowerCase())
    );
    
    // First column is for period names
    const columns = [
      {
        title: 'Period',
        dataIndex: 'period',
        key: 'period',
        width: '120px',
        fixed: 'left',
        render: (text) => (
          <div className="whitespace-pre-line font-medium text-gray-700">
            {text}
          </div>
        ),
      },
    ];
    
    // Add a column for each day
    weekdayDays.forEach((day) => {
      columns.push({
        title: day.long_name || day.name,
        dataIndex: day.name,
        key: day.name,
        width: '160px',
        render: (record) => {
          if (!record) {
            return <div className="h-full w-full text-center text-gray-400">-</div>;
          }
          
          return (
            <div className="p-1 rounded bg-blue-50 border border-blue-100">
              <div className="font-medium text-blue-800 mb-1">{record.subjectName}</div>
              <div className="text-xs text-gray-600">Room: {record.room}</div>
              {record.teacher && (
                <div className="text-xs text-gray-600 truncate">
                  Faculty: {record.teacher}
                </div>
              )}
            </div>
          );
        },
      });
    });
    
    return columns;
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
                                  <strong>Faculty:</strong> {teachersForSubject.map(teacherId => {
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
