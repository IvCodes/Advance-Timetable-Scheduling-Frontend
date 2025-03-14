import React, { useEffect, useState } from "react";
import { Card, Tabs, Table, Popover, Spin, Typography, ConfigProvider, Empty } from "antd";
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

const { Title, Text } = Typography;
const { TabPane } = Tabs;

function StudentDashboard() {
  const dispatch = useDispatch();
  const { timetable, loading } = useSelector((state) => state.timetable);
  const { days, periods, subjects, teachers, spaces } = useSelector((state) => state.data);
  const [userYear, setUserYear] = useState(null);
  const [userSubjects, setUserSubjects] = useState([]);
  
  // Fetch the needed data on component mount
  useEffect(() => {
    dispatch(getTimetable());
    dispatch(getDays());
    dispatch(getPeriods());
    dispatch(getSubjects());
    dispatch(getSpaces());
    dispatch(getTeachers());
    
    // Get user details from localStorage or state
    const userRole = localStorage.getItem("role");
    const userId = localStorage.getItem("user_id");
    
    // For demo, we'll set a default year
    // In production, this would come from the user's profile or API
    setUserYear(2); // Example: 2nd year
    
    // Fetch the student's enrolled subjects
    // This would typically come from an API call
    setUserSubjects(["CS101", "CS205", "MA202"]); // Example subject codes
  }, [dispatch]);
  
  // Helper function to generate table columns
  const generateColumns = (days) => [
    {
      title: "Periods",
      dataIndex: "period",
      key: "period",
      width: 150,
    },
    ...days.map((day) => ({
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
    return periods.map((period, periodIndex) => ({
      key: periodIndex,
      period: period.long_name,
      ...days.reduce((acc, day) => {
        const activity = semesterTimetable.find(
          (entry) =>
            entry.day.name === day.name &&
            entry.period.some((p) => p.name === period.name)
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

  // Function to check if a timetable is for the student's year
  const isRelevantTimetable = (semester) => {
    const { year } = getSemName(semester);
    return year === userYear;
  };

  // Function to check if a subject is in the student's enrolled subjects
  const isEnrolledSubject = (subjectCode) => {
    return userSubjects.includes(subjectCode);
  };

  return (
    <div className="p-6">
      <Title level={2}>Student Dashboard</Title>
      
      {/* My Timetable Section */}
      <Card title="My Timetable" className="mb-6">
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
                .filter(semesterTimetable => 
                  // Show only timetables for the student's year
                  isRelevantTimetable(semesterTimetable.semester) && 
                  // Show the selected algorithm (or default to the first one)
                  semesterTimetable.algorithm === "GA"
                )
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
                      key={semester}
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
          <Empty description="No timetable available for your year" />
        )}
      </Card>
      
      {/* My Enrolled Subjects Section */}
      <Card title="My Enrolled Subjects">
        {subjects && subjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects
              .filter(subject => isEnrolledSubject(subject.code))
              .map(subject => (
                <Card 
                  key={subject.code} 
                  size="small" 
                  title={subject.long_name}
                  extra={<Text type="secondary">{subject.code}</Text>}
                >
                  <p><strong>Type:</strong> {subject.type}</p>
                  <p><strong>Credits:</strong> {subject.credits}</p>
                  <p><strong>Department:</strong> {subject.department}</p>
                </Card>
              ))}
          </div>
        ) : (
          <Empty description="No subjects found" />
        )}
      </Card>
    </div>
  );
}

export default StudentDashboard;
