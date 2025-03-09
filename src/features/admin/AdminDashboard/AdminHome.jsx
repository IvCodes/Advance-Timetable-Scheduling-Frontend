import React, { useState } from "react";
import { Alert, Card, Typography, Row, Col, Button } from "antd";
import moment from "moment";
import { getPeriods } from "../DataManagement/data.api";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  getSelectedAlgorithm,
  getNotifications,
  setNotificationRead,
  markAllNotificationsRead
} from "../Timetable/timetable.api";

const AdminHome = () => {
  const { periods } = useSelector((state) => state.data);
  const { selectedAlgorithm, notifications } = useSelector(
    (state) => state.timetable
  );
  const [showAllNotifications, setShowAllNotifications] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getPeriods());
    dispatch(getSelectedAlgorithm());
    dispatch(getNotifications());
  }, [dispatch]);

  const getCurrentPeriod = () => {
    const now = moment();
    const timeRanges = periods.map((period) => {
      const [startTime, endTime] = period.long_name.split(" - ");
      return {
        name: period.name,
        startTime,
        endTime,
        isInterval: period.is_interval,
      };
    });
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

  const handleNotificationRead = (id) => {
    dispatch(setNotificationRead(id));
    dispatch(getNotifications());
  };

const handleMarkAllAsRead = async () => {
  try {
    await dispatch(markAllNotificationsRead()).unwrap();
    await dispatch(getNotifications());
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
};
  const currentPeriod = getCurrentPeriod();
  // Get only the 5 most recent notifications for the compact view
  const sortedNotifications = [...notifications]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
  const recentNotifications = sortedNotifications.slice(0, 5);
  
  // Determine which notifications to display based on the toggle state
  const displayedNotifications = showAllNotifications ? sortedNotifications : recentNotifications;
  
    return (
      <div className="p-6">
        <div className="flex w-full justify-between space-x-10">
          <div className="flex-1 p-4 border-2 rounded-lg h-48 flex-col flex">
            <div className="text-lg font-thin">Current Period</div>
            <div className="flex-1 content-center">
              <div className="text-6xl font-black">{currentPeriod.name}</div>
              <div className="text-xl font-regular">
                {currentPeriod.startTime} - {currentPeriod.endTime}
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 border-2 rounded-lg h-48 flex flex-col">
            <div className="text-lg font-thin">Selected Algorithm</div>
            <div className="flex-1 content-center">
              <div className="text-5xl font-black">
                {selectedAlgorithm?.selected_algorithm == "GA"
                  ? "Genetic Algorithm"
                  : selectedAlgorithm?.selected_algorithm == "CO"
                  ? "Ant Colony Optimization"
                  : selectedAlgorithm?.selected_algorithm == "RL"
                  ? "Reinforcement Learning"
                  : "-"}
              </div>
            </div>
          </div>
          <div className="flex-1 p-4 border-2 rounded-lg h-48 flex flex-col">
            <div className="text-lg font-thin">Additional Information</div>
          </div>
        </div>
  
        <div className="mt-14 mb-6">
          <div className="flex justify-between items-center">
            <div className="text-3xl font-bold">Notifications</div>
            <div className="flex space-x-4">
              {notifications.length > 0 && (
                <Button 
                  type="primary" 
                  size="small" 
                  onClick={handleMarkAllAsRead}
                >
                  Mark All as Read
                </Button>
              )}
              {notifications.length > 5 && (
                <Button 
                  type="default" 
                  size="small" 
                  onClick={() => setShowAllNotifications(!showAllNotifications)}
                >
                  {showAllNotifications ? "Show Recent" : "Show All"}
                </Button>
              )}
            </div>
          </div>
          <hr className="mt-2" />
          {notifications && notifications.length > 0 ? (
            <div className="mt-4">
              {displayedNotifications.map((notification, index) => (
                <Alert
                  key={notification._id || index}
                  message={notification.message}
                  type={notification.type === "timetable" ? "info" : notification.type}
                  showIcon
                  className="mb-2 py-1 text-sm"
                  closable
                  closeIcon={
                    <span
                      onClick={() => handleNotificationRead(notification._id)}
                      className="text-blue-500 text-xs cursor-pointer hover:underline"
                    >
                      Mark as Read
                    </span>
                  }
                  description={
                    <div className="text-xs text-gray-500">
                      {notification.timestamp ? moment(notification.timestamp).fromNow() : "Unknown time"}
                    </div>
                  }
                />
              ))}
              {notifications.length > 5 && (
                <div className="text-center mt-2">
                  <Button 
                    type="link" 
                    onClick={() => setShowAllNotifications(!showAllNotifications)}
                  >
                    {showAllNotifications 
                      ? "Show fewer notifications" 
                      : `Show ${notifications.length - 5} more notifications`}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-10">No new notifications</div>
          )}
        </div>
      </div>
   
  
  );
};

export default AdminHome;
