// NotificationSummary.jsx
import React from "react";
import { Alert, Button, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import moment from "moment";

const NotificationSummary = () => {
  const navigate = useNavigate(); 
  const { notifications } = useSelector((state) => state.timetable);
  const unreadCount = notifications.filter(n => !n.read).length;
  const recentNotifications = [...notifications]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 2);

  return (
    <div className="notification-summary">
      <div className="flex justify-between items-center mb-2">
        <div className="text-lg font-semibold">Recent Notifications</div>
        {unreadCount > 0 && (
          <Badge count={unreadCount} style={{ backgroundColor: '#1890ff' }} />
        )}
      </div>
      
      {recentNotifications.length > 0 ? (
        <>
          {recentNotifications.map((notification, index) => (
            <Alert
              key={notification._id || index}
              message={notification.message}
              type={notification.type === "timetable" ? "info" : notification.type}
              className="mb-2 text-xs"
              banner
              description={
                <div className="text-xs text-gray-500">
                  {notification.timestamp ? moment(notification.timestamp).fromNow() : "Unknown time"}
                </div>
              }
            />
          ))}
          <Button 
            type="primary" 
            size="small" 
            className="w-full text-center"
            onClick={() => navigate('/admin/dashboard', { state: { activeTab: '2' } })}
          >
            View all notifications
          </Button>
        </>
      ) : (
        <div className="text-gray-500 text-sm">No new notifications</div>
      )}
    </div>
  );
};

export default NotificationSummary;
