import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/LogoTimeTableWiz_v2.png";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/authentication/auth.slice";
import { getNotifications } from "../../features/admin/Timetable/timetable.api";
import GoldButton from "../buttons/GoldButton";
import { Badge, Dropdown, Button, Spin } from "antd";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import NotificationsPanel from "../notificationPanel/NotificationPanel";

// Sample notifications for testing
const mockNotifications = [
  {
    id: 1,
    type: "timetable",
    message: "New timetable has been published for Spring 2025",
    timestamp: "2025-03-15T10:30:00",
    read: false
  },
  {
    id: 2,
    type: "faculty",
    message: "Faculty Dr. Smith has reported unavailability for next week",
    timestamp: "2025-03-14T15:45:00",
    read: false
  },
  {
    id: 3,
    type: "timetable",
    message: "Schedule changes for Mathematics department",
    timestamp: "2025-03-13T09:20:00",
    read: true
  },
  {
    id: 4,
    type: "general",
    message: "System maintenance scheduled for tonight",
    timestamp: "2025-03-12T18:00:00",
    read: true
  }
];

function Navbar({ links }) {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const { notifications: storeNotifications } = useSelector((state) => state.timetable);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localNotifications, setLocalNotifications] = useState(mockNotifications);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [dispatch, isAuthenticated]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      await dispatch(getNotifications()).unwrap();
      setLoading(false);
    } catch (error) {
      console.error("Error loading notifications:", error);
      setLoading(false);
      // Fallback to mock notifications if API fails
      console.log("Using mock notifications for testing");
    }
  };

  // Use mock notifications or store notifications if available
  const notifications = storeNotifications && storeNotifications.length > 0 
    ? storeNotifications 
    : localNotifications;

  // Filter important notifications (published timetable and faculty unavailability)
  const importantNotifications = notifications.filter(
    notification => 
      notification.type === "timetable" || 
      (notification.message && notification.message.toLowerCase().includes("faculty"))
  );
  
  const unreadCount = importantNotifications.filter(n => !n.read).length;

  const onClick = () => {
    dispatch(logout());
    navigate("/");
  };

  const toggleNotification = () => {
    setNotificationVisible(!notificationVisible);
  };

  const handleMarkAsRead = (id) => {
    // Update local notifications for testing
    setLocalNotifications(prev => 
      prev.map(notification => 
        notification.id === id ? {...notification, read: true} : notification
      )
    );
  };

  const handleMarkAllAsRead = () => {
    // Update local notifications for testing
    setLocalNotifications(prev => 
      prev.map(notification => ({...notification, read: true}))
    );
  };

  const notificationContent = (
    <div style={{ 
      width: '350px', 
      maxHeight: '400px', 
      overflow: 'auto', 
      backgroundColor: '#1f1f1f', 
      boxShadow: '0 3px 6px rgba(0,0,0,0.3)', 
      borderRadius: '8px', 
      color: '#f0f0f0' 
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '12px 16px', 
        borderBottom: '1px solid #282828',
        backgroundColor: '#243647'
      }}>
        <h3 style={{ margin: 0, color: '#f0f0f0' }}>Important Notifications</h3>
        <Button 
          type="text" 
          icon={<CloseOutlined style={{ color: '#f0f0f0' }}/>} 
          size="small" 
          onClick={toggleNotification}
          style={{ marginLeft: 'auto', color: '#f0f0f0' }} 
        />
      </div>
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#f0f0f0' }}>
          <Spin />
          <p>Loading notifications...</p>
        </div>
      ) : (
        <NotificationsPanel 
          filterImportant={true} 
          customNotifications={importantNotifications}
          onMarkRead={handleMarkAsRead}
          onMarkAllRead={handleMarkAllAsRead}
          darkTheme={true}
        />
      )}
    </div>
  );

  return (
    <div className="w-100 flex justify-between py-4 pt-8 border-b-[1px] border-b-[#E5E8EB]">
      <div className="flex-1 my-auto text-2xl flex font-extrabold ml-7 ">
        <img src={logo} className="w-[40px] h-fit my-auto mr-4" alt="" />
        TimeTableWiz
      </div>
      <div className="flex-1 text-right place-self-center">
        {links.map((link) => {
          return (
            <NavLink
              key={link.id}
              to={link.href}
              className={({ isActive }) =>
                `mx-4 text-base  tracking-wider   ${
                  isActive ? " font-bold" : " font-thin"
                }`
              }
            >
              {link.text}
            </NavLink>
          );
        })}
      </div>
      <div className="my-auto ml-10 mr-10 flex items-center justify-end">
        {isAuthenticated && (
          <div className="mr-4 relative">
            <Badge count={unreadCount} size="small" style={{ backgroundColor: '#1890ff' }}>
              <Button 
                type="link" 
                icon={<BellOutlined style={{ fontSize: '24px', color: '#f0f0f0' }} />} 
                onClick={toggleNotification}
                style={{ background: 'transparent', border: 'none', padding: '6px' }}
              />
            </Badge>
            {notificationVisible && (
              <div style={{ position: 'absolute', right: 0, top: '40px', zIndex: 1000 }}>
                {notificationContent}
              </div>
            )}
          </div>
        )}
        {isAuthenticated ? (
          <GoldButton bgColor={"#243647"} onClick={onClick}>
            Logout
          </GoldButton>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}

export default Navbar;
