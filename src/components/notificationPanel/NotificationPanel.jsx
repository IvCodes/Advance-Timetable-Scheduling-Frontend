// NotificationsPanel.jsx
import React, { useEffect, useState } from "react";
import { Alert, Button } from "antd";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from 'prop-types';
import {
  getNotifications,
  setNotificationRead,
  markAllNotificationsRead
} from "../../features/admin/Timetable/timetable.api";

const NotificationsPanel = ({ 
  filterImportant = false, 
  customNotifications = null,
  onMarkRead = null,
  onMarkAllRead = null,
  darkTheme = false
}) => {
  const dispatch = useDispatch();
  const { notifications: allNotifications } = useSelector((state) => state.timetable);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  
  const notifications = customNotifications || allNotifications;

  // Dark theme styles
  const darkStyles = {
    container: {
      backgroundColor: '#1f1f1f',
      color: '#f0f0f0'
    },
    heading: {
      color: '#f0f0f0'
    },
    button: {
      color: '#40a9ff',
      borderColor: '#1890ff',
      backgroundColor: 'transparent'
    },
    primaryButton: {
      backgroundColor: '#1890ff',
      borderColor: '#1890ff',
      color: '#f0f0f0'
    },
    alert: {
      backgroundColor: '#282828',
      border: '1px solid #2d2d2d',
      color: '#f0f0f0'
    },
    divider: {
      borderColor: '#2d2d2d'
    }
  };

  useEffect(() => {
    if (!customNotifications) {
      dispatch(getNotifications());
    }
  }, [dispatch, customNotifications]);

  const handleNotificationRead = (id) => {
    if (onMarkRead) {
      // Use custom handler if provided
      onMarkRead(id);
    } else {
      // Use Redux action
      dispatch(setNotificationRead(id));
      if (!customNotifications) {
        dispatch(getNotifications());
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (onMarkAllRead) {
        // Use custom handler if provided
        onMarkAllRead();
      } else {
        // Use Redux action
        await dispatch(markAllNotificationsRead()).unwrap();
        if (!customNotifications) {
          await dispatch(getNotifications());
        }
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Filter important notifications if requested
  const filteredNotifications = filterImportant 
    ? notifications.filter(
        notification => 
          notification.type === "timetable" || 
          (notification.message && notification.message.toLowerCase().includes("faculty"))
      )
    : notifications;

  const sortedNotifications = [...filteredNotifications].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );
  
  const recentNotifications = sortedNotifications.slice(0, 5);
  const displayedNotifications = showAllNotifications ? sortedNotifications : recentNotifications;

  return (
    <div className="p-3" style={darkTheme ? darkStyles.container : {}}>
      <div className="flex justify-between items-center">
        <div className="text-xl font-bold" style={darkTheme ? darkStyles.heading : {}}>
          Notifications
        </div>
        <div className="flex space-x-2">
          {filteredNotifications.length > 0 && (
            <Button 
              type="primary" 
              size="small" 
              onClick={handleMarkAllAsRead}
              style={darkTheme ? darkStyles.primaryButton : {}}
            >
              Mark All as Read
            </Button>
          )}
          {filteredNotifications.length > 5 && (
            <Button
              type="default"
              size="small"
              onClick={() => setShowAllNotifications(!showAllNotifications)}
              style={darkTheme ? darkStyles.button : {}}
            >
              {showAllNotifications ? "Show Less" : "Show All"}
            </Button>
          )}
        </div>
      </div>
      <hr className="my-2" style={darkTheme ? darkStyles.divider : {}} />
      {filteredNotifications && filteredNotifications.length > 0 ? (
        <div className="mt-2">
          {displayedNotifications.map((notification, index) => (
            <Alert
              key={notification.id || index}
              message={
                <span style={darkTheme ? { color: '#f0f0f0' } : {}}>
                  {notification.message}
                </span>
              }
              type={notification.read ? "info" : "warning"}
              className="mb-2"
              showIcon
              style={darkTheme ? darkStyles.alert : {}}
              description={
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs" style={darkTheme ? { color: '#aaaaaa' } : { color: '#666666' }}>
                    {moment(notification.timestamp).fromNow()}
                  </span>
                  {!notification.read && (
                    <Button
                      type="link"
                      size="small"
                      onClick={() => handleNotificationRead(notification.id)}
                      style={darkTheme ? { color: '#40a9ff' } : {}}
                    >
                      Mark as Read
                    </Button>
                  )}
                </div>
              }
            />
          ))}
          {filteredNotifications.length > 5 && (
            <div className="text-center mt-2">
              <Button 
                type="link" 
                onClick={() => setShowAllNotifications(!showAllNotifications)}
                style={darkTheme ? { color: '#40a9ff' } : {}}
              >
                {showAllNotifications 
                  ? "Show fewer notifications" 
                  : `Show ${filteredNotifications.length - 5} more notifications`}
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4" style={darkTheme ? { color: '#f0f0f0' } : {}}>
          No new notifications
        </div>
      )}
    </div>
  );
};

NotificationsPanel.propTypes = {
  filterImportant: PropTypes.bool,
  customNotifications: PropTypes.array,
  onMarkRead: PropTypes.func,
  onMarkAllRead: PropTypes.func,
  darkTheme: PropTypes.bool
};

export default NotificationsPanel;
