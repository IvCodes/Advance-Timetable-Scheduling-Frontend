import React from "react";
import { Alert, Card, Typography, Row, Col } from "antd";
import moment from "moment";
import { getPeriods } from "../DataManagement/data.api";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import {
  getSelectedAlgorithm,
  getNotifications,
  setNotificationRead,
} from "../Timetable/timetable.api";

const AdminHome = () => {
  const { periods } = useSelector((state) => state.data);
  const { selectedAlgorithm, notifications } = useSelector(
    (state) => state.timetable
  );

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

  const currentPeriod = getCurrentPeriod();

  return (
    <div className="p-6">
      <div className="flex w-full justify-between space-x-10">
        <div className="flex-1 p-4 border-2 rounded-lg h-48 flex-col flex">
          <div className="text-lg font-thin">Cuurent Period</div>
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
        <div className="text-3xl font-bold ">Notifications</div>
        <hr className="mt-2" />
        {notifications.length > 0 ? (
          <div className="mt-10">
            {notifications.map((notification, index) => (
              <Alert
                key={index}
                message={notification.message}
                type={notification.type}
                showIcon
                className="mb-4"
                closable
                closeIcon={
                  <button
                    onClick={() => handleNotificationRead(notification._id)}
                    className="text-blue-500"
                  >
                    Mark as Read
                  </button>
                }
              />
            ))}
          </div>
        ) : (
          <div className="mt-10">No new notifications</div>
        )}
      </div>
    </div>
  );
};

export default AdminHome;
