import React, { useState, useEffect, useRef, useMemo } from "react";
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
  Calendar as AntCalendar, 
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
  ReadOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useSelector, useDispatch } from "react-redux";
import { 
  getDays, 
  getPeriods, 
  getSubjects, 
  getSpaces, 
  getTeachers 
} from "../../admin/DataManagement/data.api";
import { getFacultyTimetable } from "../../admin/Timetable/timetable.api";
import dayjs from 'dayjs';

const API_URL = import.meta.env.VITE_API_URL;

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

// Function to get all unavailable days for a faculty member
const getFacultyUnavailableDays = async (facultyId) => {
  try {
    // Call the actual API endpoint
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}faculty/faculty/unavailable-days/${facultyId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      console.error(`Error fetching unavailable days: ${response.status}`);
      return [];
    }
    
    const data = await response.json();
    console.log("Unavailable days raw data from API:", data);
    
    // Validate and format the data
    if (Array.isArray(data)) {
      // Map to ensure consistent format and avoid any potential issues
      return data.map(day => ({
        id: day.id,
        date: day.date,
        reason: day.reason || '',
        status: day.status || 'approved',
        substitute_id: day.substitute_id
      }));
    }
    
    return [];
  } catch (error) {
    console.error("Error in getFacultyUnavailableDays:", error);
    return [];
  }
};

// Function to get information about the current authenticated user
const getCurrentAuthenticatedUser = () => {
  try {
    // Get token to verify we're authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No authentication token found");
      return null;
    }
    
    // Try to parse JWT token to get user information
    try {
      // JWT tokens are in format: header.payload.signature
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload && payload.sub) {
          console.log("User ID extracted from JWT token:", payload.sub);
          return {
            id: payload.sub,
            // Other user details if available in the token
            ...payload
          };
        }
      }
    } catch (e) {
      console.error("Failed to parse JWT token:", e);
    }
    
    // If JWT extraction fails, try all localStorage options
    for (const key of ['user', 'userData', 'userInfo', 'auth', 'profile']) {
      const itemStr = localStorage.getItem(key);
      if (itemStr) {
        try {
          const data = JSON.parse(itemStr);
          if (data && (data.id || data._id || data.userId || data.user_id)) {
            console.log(`Found user info in localStorage.${key}:`, data);
            return {
              id: data.id || data._id || data.userId || data.user_id,
              ...data
            };
          }
        } catch (e) {
          console.log(`Error parsing ${key}:`, e);
        }
      }
    }
    
    // If we haven't returned yet, try a last fallback to the user_id field
    const userId = localStorage.getItem('user_id');
    if (userId) {
      console.log("Found direct user_id in localStorage:", userId);
      return { id: userId };
    }
    
    // If we get here, we couldn't find any user info
    console.error("Could not find user information in localStorage");
    return null;
  } catch (error) {
    console.error("Error in getCurrentAuthenticatedUser:", error);
    return null;
  }
};

// Function to mark a day as unavailable
const markDayAsUnavailable = async (facultyId, date, reason) => {
  try {
    // Get authenticated user
    const currentUser = getCurrentAuthenticatedUser();
    
    if (!currentUser || !currentUser.id) {
      console.error("Cannot make API call - user not authenticated");
      return false;
    }
    
    const userId = currentUser.id;
    console.log(`Marking ${date} as unavailable for faculty ID: ${userId}`);
    
    // Call the actual API endpoint
    const token = localStorage.getItem('token');
    
    // Log the request payload for debugging
    const payload = {
      faculty_id: userId,
      date: date,
      reason: reason || ''
    };
    console.log("Request payload:", payload);
    
    const response = await fetch(`${API_URL}faculty/faculty/unavailable-days`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(payload)
    });
    
    // Log the response for debugging
    console.log("Response status:", response.status);
    const responseText = await response.text();
    console.log("Response text:", responseText);
    
    // If there's JSON content, parse and return it
    if (responseText) {
      try {
        const responseData = JSON.parse(responseText);
        console.log("Response data:", responseData);
        return response.ok;
      } catch (e) {
        console.error("Error parsing JSON response:", e);
      }
    }
    
    return response.ok;
  } catch (error) {
    console.error("Error marking day as unavailable:", error);
    // Return false to indicate failure during development
    return false;
  }
};

// Function to mark a day as available (remove from unavailable list)
const markDayAsAvailable = async (facultyId, date) => {
  try {
    // Get authenticated user
    const currentUser = getCurrentAuthenticatedUser();
    
    if (!currentUser || !currentUser.id) {
      console.error("Cannot make API call - user not authenticated");
      return false;
    }
    
    const userId = currentUser.id;
    console.log(`Marking ${date} as available for faculty ID: ${userId}`);
    
    // Call the actual API endpoint
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}faculty/unavailable-days/${userId}/${date}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    // Log the response for debugging
    console.log("Response status:", response.status);
    
    try {
      const responseText = await response.text();
      console.log("Response text:", responseText);
      
      // If there's JSON content, parse and log it
      if (responseText) {
        try {
          const responseData = JSON.parse(responseText);
          console.log("Response data:", responseData);
        } catch (e) {
          console.error("Error parsing JSON response:", e);
        }
      }
    } catch (error) {
      console.error("Error reading response:", error);
    }
    
    return response.ok;
  } catch (error) {
    console.error("Error marking day as available:", error);
    // Return false to indicate failure during development
    return false;
  }
};

// Function to get current active classes
const getCurrentClasses = (timetable, facultyId, currentDay, currentPeriod) => {
  if (!timetable || !timetable.semesters) {
    return [];
  }
  
  const classes = [];
  
  // Look through all semesters in the published timetable
  for (const [semester, entries] of Object.entries(timetable.semesters)) {
    // Find entries for current day and period that involve this faculty
    const currentClasses = entries.filter(entry => {
      const matchesDay = entry.day && entry.day.name.toLowerCase() === currentDay.toLowerCase();
      const matchesPeriod = entry.period && 
        Array.isArray(entry.period) ? 
        entry.period.some(p => p.name.toLowerCase() === currentPeriod.toLowerCase()) : 
        entry.period?.name.toLowerCase() === currentPeriod.toLowerCase();
      
      return matchesDay && matchesPeriod;
    });
    
    if (currentClasses.length > 0) {
      classes.push(...currentClasses.map(cls => ({
        ...cls,
        semester: semester
      })));
    }
  }
  
  return classes;
};

const FacultyDashboard = () => {
  const dispatch = useDispatch();
  const { days, periods, subjects, teachers, spaces } = useSelector((state) => state.data);
  const { facultyTimetable, loading } = useSelector((state) => state.timetable);
  
  // Refs for scroll functionality
  const timetableRef = useRef(null);
  const availabilityRef = useRef(null);
  const currentClassesRef = useRef(null);
  
  // Faculty state
  const [facultyId, setFacultyId] = useState(null);
  const [facultySubjects, setFacultySubjects] = useState([]);
  const [unavailableDays, setUnavailableDays] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [reason, setReason] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentView, setCurrentView] = useState('month');
  
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
  
  // Function to get the current faculty ID from various sources
  const getCurrentFacultyId = () => {
    try {
      // Debug: Log all localStorage items to see what's available
      console.log("LocalStorage contents:");
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        try {
          const value = localStorage.getItem(key);
          console.log(`${key}: ${value}`);
        } catch (e) {
          console.log(`${key}: [Error reading value]`);
        }
      }
      
      // 1. Try direct user_id in localStorage (most reliable)
      const userId = localStorage.getItem('user_id');
      if (userId) {
        console.log("Found user_id in localStorage:", userId);
        return userId;
      }
      
      // 2. Try user object in localStorage
      const userString = localStorage.getItem('user');
      if (userString) {
        try {
          const user = JSON.parse(userString);
          if (user && user.id) {
            console.log("Found user ID in localStorage.user:", user.id);
            return user.id;
          }
        } catch (e) {
          console.error("Error parsing user JSON:", e);
        }
      }
      
      // 3. Try userData object
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        try {
          const userData = JSON.parse(userDataString);
          if (userData && userData.id) {
            console.log("Found user ID in localStorage.userData:", userData.id);
            return userData.id;
          }
        } catch (e) {
          console.error("Error parsing userData JSON:", e);
        }
      }
      
      // 4. Try to extract from JWT token
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
            console.log("Decoded JWT token payload:", payload);
            
            // Look for common fields that might contain the user ID
            if (payload.sub) {
              console.log("Found user ID in JWT token (sub field):", payload.sub);
              return payload.sub;
            }
            if (payload.id) {
              console.log("Found user ID in JWT token (id field):", payload.id);
              return payload.id;
            }
            if (payload.user_id) {
              console.log("Found user ID in JWT token (user_id field):", payload.user_id);
              return payload.user_id;
            }
          }
        } catch (e) {
          console.error("Error decoding JWT token:", e);
        }
      }
      
      // 5. Fallback to facultyId prop if available
      if (facultyId) {
        console.log("Using facultyId prop:", facultyId);
        return facultyId;
      }
      
      // 6. Final fallback - try to get from URL if neither is available
      const urlParams = new URLSearchParams(window.location.search);
      const idFromUrl = urlParams.get('id');
      if (idFromUrl) {
        console.log("Found ID in URL parameter:", idFromUrl);
        return idFromUrl;
      }
      
      // If we still don't have an ID, check current user in console
      console.error("Could not find faculty ID in any location. Debug info:");
      console.log("localStorage:", Object.keys(localStorage));
      console.log("facultyId prop:", facultyId);
      console.log("URL params:", window.location.search);
      
      // If we still don't have an ID, return null
      return null;
    } catch (error) {
      console.error("Error getting faculty ID:", error);
      return facultyId || null; // Fallback to prop
    }
  };

  // Fetch the needed data on component mount
  useEffect(() => {
    dispatch(getDays());
    dispatch(getPeriods());
    dispatch(getSubjects());
    dispatch(getSpaces());
    dispatch(getTeachers());
    
    // Get user details from localStorage
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        if (user && user.id) {
          setFacultyId(user.id);
          console.log("Set faculty ID from localStorage:", user.id);
          
          // Fetch faculty-specific published timetable
          dispatch(getFacultyTimetable(user.id));
        } else {
          // Try to get faculty ID from other sources
          const currentFacultyId = getCurrentFacultyId();
          if (currentFacultyId) {
            setFacultyId(currentFacultyId);
            console.log("Set faculty ID from getCurrentFacultyId:", currentFacultyId);
            dispatch(getFacultyTimetable(currentFacultyId));
          } else {
            console.error("No faculty ID found, cannot load timetable");
            message.error("Could not determine your faculty ID. Please log in again.");
          }
        }
      } else {
        // Try to get faculty ID from other sources
        const currentFacultyId = getCurrentFacultyId();
        if (currentFacultyId) {
          setFacultyId(currentFacultyId);
          console.log("Set faculty ID from getCurrentFacultyId:", currentFacultyId);
          dispatch(getFacultyTimetable(currentFacultyId));
        } else {
          console.error("No faculty ID found, cannot load timetable");
          message.error("Could not determine your faculty ID. Please log in again.");
        }
      }
    } catch (error) {
      console.error("Error getting user data from localStorage:", error);
      // Try to get faculty ID from other sources
      const currentFacultyId = getCurrentFacultyId();
      if (currentFacultyId) {
        setFacultyId(currentFacultyId);
        console.log("Set faculty ID from getCurrentFacultyId after error:", currentFacultyId);
        dispatch(getFacultyTimetable(currentFacultyId));
      } else {
        console.error("No faculty ID found after error, cannot load timetable");
        message.error("Could not determine your faculty ID. Please log in again.");
      }
    }
    
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

  // Log period structure when it's available
  useEffect(() => {
    if (periods && periods.length > 0) {
      console.log("Period structure example:", periods[0]);
      console.log("All periods:", periods);
    }
  }, [periods]);

  // Fetch unavailable days when facultyId is set
  useEffect(() => {
    const fetchUnavailableDays = async () => {
      try {
        const currentFacultyId = getCurrentFacultyId() || getCurrentAuthenticatedUser()?.id;
        
        if (!currentFacultyId) {
          console.warn("Could not determine faculty ID for unavailability");
          message.warning("Could not determine your faculty ID. Some features may not work correctly.");
          return;
        }
        
        console.log("Fetching unavailable days for faculty ID:", currentFacultyId);
        const days = await getFacultyUnavailableDays(currentFacultyId);
        
        if (days && Array.isArray(days)) {
          console.log(`Setting ${days.length} unavailable days in state`);
          setUnavailableDays(days);
        } else {
          console.error("Received invalid data format for unavailable days");
          setUnavailableDays([]);
        }
      } catch (error) {
        console.error("Error fetching unavailable days:", error);
        message.error("Failed to load unavailable days");
        setUnavailableDays([]);
      }
    };
    
    fetchUnavailableDays();
  }, []);

  // Update active classes when currentDayName, currentPeriodName, or timetable changes
  useEffect(() => {
    if (facultyId && currentDayName && currentPeriodName && facultyTimetable) {
      const classes = getCurrentClasses(facultyTimetable, facultyId, currentDayName, currentPeriodName);
      setActiveClasses(classes);
    } else {
      setActiveClasses([]);
    }
  }, [facultyId, currentDayName, currentPeriodName, facultyTimetable]);

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
  const generateDataSource = (timetableEntries, days, periods) => {
    // Make sure we have data to work with
    if (!timetableEntries || !Array.isArray(timetableEntries) || !days || !periods) {
      console.error("Missing required data for timetable generation:", { 
        hasTimetable: !!timetableEntries && Array.isArray(timetableEntries), 
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
        const activity = findMatchingActivity(timetableEntries, day, period);
        rowData[day.name] = prepareCellData(activity);
      });
      
      return rowData;
    });
  };

  // Helper function to get semester name in readable format  
  const getSemName = (semester) => {
    const year = parseInt(semester.substring(3, 4));
    const sem = parseInt(semester.substring(4, 6));
    return { year, sem };
  };
  
  // Helper function to create a simple status dataset for calendar rendering
  const getUnavailabilityStatusMap = () => {
    const statusMap = {};
    
    // Add each unavailable day to the map with its status
    unavailableDays.forEach(day => {
      statusMap[day.date] = {
        status: day.status,
        reason: day.reason
      };
    });
    
    console.log("Availability status map:", statusMap);
    return statusMap;
  };

  // Create a clean dedicated component for availability calendar
  const AvailabilityCalendar = () => {
    const unavailabilityMap = useMemo(() => getUnavailabilityStatusMap(), [unavailableDays]);
    
    // Calendar date cell renderer - restored to original style
    const dateCellRender = (date) => {
      const dateString = date.format('YYYY-MM-DD');
      const dayOfWeek = date.day(); // 0 is Sunday, 6 is Saturday
      
      // Skip rendering for weekends (Saturday and Sunday)
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return <Badge status="default" text="Weekend" />;
      }
      
      // Check if date is unavailable
      const dayInfo = unavailabilityMap[dateString];
      if (dayInfo) {
        const status = dayInfo.status === 'pending' ? 'warning' : 'error';
        const text = dayInfo.status === 'pending' ? 'Pending' : 'Unavailable';
        
        return (
          <div>
            <Badge status={status} text={text} />
            {dayInfo.reason && (
              <Tooltip title={dayInfo.reason}>
                <InfoCircleOutlined style={{ marginLeft: 5 }} />
              </Tooltip>
            )}
          </div>
        );
      }
      
      return null;
    };
    
    return (
      <div className="my-4">
        <AntCalendar
          fullscreen={true}
          cellRender={(date, info) => {
            if (info.type === 'date') {
              return dateCellRender(date);
            }
            return null;
          }}
          disabledDate={disabledDate}
          onSelect={handleCalendarSelect}
          className="faculty-calendar"
        />
      </div>
    );
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
      setReason(existingDate.reason || '');
    } else {
      setReason('');
    }
    
    setModalVisible(true);
  };
  
  // Handle marking a day as unavailable
  const handleMarkUnavailable = async () => {
    if (!selectedDate) return;
    
    const isAlreadyUnavailable = unavailableDays.some(day => day.date === selectedDate);
    let success = false;
    
    // Get current authenticated user
    const currentUser = getCurrentAuthenticatedUser();
    
    if (!currentUser || !currentUser.id) {
      message.error("User authentication information not found. Please log in again.");
      return;
    }
    
    const currentFacultyId = currentUser.id;
    console.log("Using authenticated faculty ID:", currentFacultyId);
    
    if (isAlreadyUnavailable) {
      // Mark as available (remove from unavailable list)
      success = await markDayAsAvailable(currentFacultyId, selectedDate);
      if (success) {
        setUnavailableDays(prevDays => prevDays.filter(day => day.date !== selectedDate));
        message.success("Day marked as available");
      } else {
        message.error("Failed to update availability");
      }
    } else {
      // Mark as unavailable
      success = await markDayAsUnavailable(currentFacultyId, selectedDate, reason);
      if (success) {
        const newUnavailableDay = { 
          date: selectedDate,
          reason: reason || '',
          status: 'pending'
        };
        setUnavailableDays(prevDays => [...prevDays, newUnavailableDay]);
        message.success("Day marked as unavailable");
      } else {
        message.error("Failed to update availability");
      }
    }
    
    if (success) {
      setModalVisible(false);
      setReason('');
    }
  };

  const markClassDayAsUnavailable = async (cls) => {
    try {
      // Format the date from the class
      const formattedDate = dayjs(cls.date).format('YYYY-MM-DD');
      
      // Create reason based on class details
      const reason = `Unavailable for ${cls.subject?.name || 'class'} (${cls.period?.name || 'period'})`;
      
      // Get authenticated user
      const currentUser = getCurrentAuthenticatedUser();
      
      if (!currentUser || !currentUser.id) {
        message.error("User authentication information not found. Please log in again.");
        return false;
      }
      
      const currentFacultyId = currentUser.id;
      console.log("Using authenticated faculty ID for class day:", currentFacultyId);
      
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}faculty/faculty/unavailable-days`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          faculty_id: currentFacultyId,
          date: formattedDate,
          reason: reason
        })
      });
      
      if (response.ok) {
        notification.success({
          message: 'Success',
          description: `Marked as unavailable for ${dayjs(formattedDate).format('dddd')}`
        });
        fetchUnavailableDays();
      } else {
        const errorData = await response.json();
        notification.error({
          message: 'Error',
          description: errorData.detail || 'Failed to mark day as unavailable'
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

  // Function to render published timetable data
  const renderPublishedTimetable = (publishedTimetable) => {
    if (!publishedTimetable || !publishedTimetable.semesters) {
      console.log("No published timetable data available:", publishedTimetable);
      return [{
        label: "No Published Timetable",
        key: "no-timetable",
        children: (
          <Alert
            type="info"
            message="There is no published timetable available yet. Please check back later."
          />
        )
      }];
    }
    
    console.log("Rendering published timetable:", publishedTimetable);
    
    // Convert published timetable format to tabs
    return Object.entries(publishedTimetable.semesters).map(([semesterKey, semesterData]) => {
      const columns = generateColumns(days);
      
      // Validate timetable entries
      if (!Array.isArray(semesterData) || semesterData.length === 0) {
        return {
          label: `Year ${getSemName(semesterKey).year} Semester ${getSemName(semesterKey).sem}`,
          key: `${semesterKey}_${Math.random().toString(36).substring(2, 7)}`,
          children: (
            <Alert
              type="info"
              message={`No classes assigned to you in ${semesterData.long_name || semesterKey}`}
            />
          )
        };
      }
      
      const dataSource = generateDataSource(
        semesterData,
        days,
        periods
      );

      console.log(`Generated dataSource for ${semesterKey} with ${dataSource.length} rows`);
      
      return {
        label: `Year ${getSemName(semesterKey).year} Semester ${getSemName(semesterKey).sem}`,
        key: `${semesterKey}_${Math.random().toString(36).substring(2, 7)}`,
        children: (
          <ConfigProvider
            theme={{
              components: {
                Table: {
                  colorBgContainer: "transparent",
                  colorText: "rgba(0,0,0,0.88)",
                  headerColor: "rgba(0,0,0,0.88)",
                  borderColor: "#d9d9d9",
                },
              },
            }}
          >
            <Table
              columns={columns}
              dataSource={dataSource}
              pagination={false}
              bordered
              size="middle"
              className="timetable-table"
            />
          </ConfigProvider>
        ),
      };
    });
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
          >
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Spin size="large" />
              </div>
            ) : !facultyTimetable || !facultyTimetable.semesters ? (
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
                    <Text strong>Current Faculty ID:</Text> {facultyId}
                  </p>
                  
                  <Tabs defaultActiveKey="all" className="custom-tabs">
                    <Tabs.TabPane tab="All Semesters" key="all">
                      {Object.keys(facultyTimetable.semesters).length === 0 ? (
                        <Empty description="No classes assigned to you in any semester" />
                      ) : (
                        <div>
                          {Object.entries(facultyTimetable.semesters).map(([semesterKey, semesterData]) => (
                            <div key={semesterKey} className="mb-8">
                              <Title level={4} className="mb-4">
                                {semesterKey}
                              </Title>
                              
                              {Array.isArray(semesterData) && semesterData.length > 0 ? (
                                <Table
                                  columns={generateColumns(days)}
                                  dataSource={generateDataSource(
                                    semesterData,
                                    days,
                                    periods
                                  )}
                                  pagination={false}
                                  bordered
                                  size="middle"
                                  className="custom-timetable"
                                />
                              ) : (
                                <Empty description={`No classes assigned to you in ${semesterKey}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Tabs.TabPane>
                    
                    {Object.entries(facultyTimetable.semesters).map(([semesterKey, semesterData]) => (
                      <Tabs.TabPane 
                        tab={semesterKey} 
                        key={semesterKey}
                      >
                        {!Array.isArray(semesterData) || semesterData.length === 0 ? (
                          <Empty description={`No classes assigned to you in ${semesterKey}`} />
                        ) : (
                          <Table
                            columns={generateColumns(days)}
                            dataSource={generateDataSource(
                              semesterData,
                              days,
                              periods
                            )}
                            pagination={false}
                            bordered
                            size="middle"
                            className="custom-timetable"
                          />
                        )}
                      </Tabs.TabPane>
                    ))}
                  </Tabs>
                  
                  {/* Debug Info */}
                  {import.meta.env.DEV && (
                    <div className="mt-4 p-4 bg-gray-100 rounded">
                      <Text strong>Debug Info:</Text>
                      <pre className="text-xs mt-2">
                        Has timetable: {facultyTimetable ? "Yes" : "No"}{"\n"}
                        Has semesters: {facultyTimetable?.semesters ? `Yes (${Object.keys(facultyTimetable.semesters).length})` : "No"}{"\n"}
                        FacultyId: {facultyId}{"\n"}
                        Days: {days?.length || 0}{"\n"}
                        Periods: {periods?.length || 0}
                      </pre>
                    </div>
                  )}
                </div>
              </ConfigProvider>
            )}
          </Card>
          
          {/* Availability Calendar */}
          <Card 
            title="Manage Availability" 
            className="mb-6"
            ref={availabilityRef}
          >
            <div className="mb-4">
              <Paragraph>
                Use the calendar below to mark days when you are unavailable to teach.
                This information will be visible to administrators for planning.
                <br />
                <Text type="secondary">Note: Weekends are already marked as non-working days.</Text>
              </Paragraph>
              
              {/* Use the improved calendar component with original UI */}
              <AvailabilityCalendar />
              
              {/* Button to refresh calendar data - keep this functionality */}
              <Button 
                onClick={async () => {
                  message.info("Refreshing unavailable days...");
                  const currentFacultyId = getCurrentFacultyId();
                  if (currentFacultyId) {
                    const days = await getFacultyUnavailableDays(currentFacultyId);
                    if (days && Array.isArray(days)) {
                      setUnavailableDays(days);
                      message.success(`Refreshed ${days.length} unavailable days`);
                    }
                  }
                }}
                icon={<ReloadOutlined />}
                style={{ marginTop: '10px' }}
              >
                Refresh Calendar
              </Button>
            </div>
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
            title="Mark Unavailability"
            open={modalVisible}
            onCancel={() => setModalVisible(false)}
            footer={null}
          >
            <div className="mb-4">
              <Text>Date: {selectedDate}</Text>
            </div>
            
            <div className="mb-4">
              <Text>Reason for unavailability:</Text>
              <TextArea 
                rows={4} 
                placeholder="Enter reason for unavailability" 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-2"
              />
              
              <div className="mt-4">
                <Button 
                  type="primary" 
                  onClick={() => handleMarkUnavailable()}
                >
                  Mark as Unavailable
                </Button>
                <Button 
                  onClick={() => setModalVisible(false)}
                  style={{ marginLeft: 8 }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
          
          {/* For more complex pages */}
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
