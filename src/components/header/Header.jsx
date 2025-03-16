import React, { useState, useEffect } from "react";
import logo from "../../assets/LogoTimeTableWiz_v2.png";
import { Button, Badge, Dropdown, Space, Tooltip } from "antd";
import { BellOutlined, CloseOutlined } from "@ant-design/icons";
import GoldButton from "../buttons/GoldButton";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/authentication/auth.slice";
import { getNotifications } from "../../features/admin/Timetable/timetable.api";
import { useNavigate } from "react-router-dom";
import NotificationsPanel from "../notificationPanel/NotificationPanel";

function Header() {
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);
  const { notifications } = useSelector((state) => state.timetable);
  const [notificationVisible, setNotificationVisible] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getNotifications());
    }
  }, [dispatch, isAuthenticated]);

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

  const notificationContent = (
    <div style={{ width: '350px', maxHeight: '400px', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <h3 style={{ margin: 0 }}>Important Notifications</h3>
        <Button 
          type="text" 
          icon={<CloseOutlined />} 
          size="small" 
          onClick={toggleNotification}
          style={{ marginLeft: 'auto' }} 
        />
      </div>
      <NotificationsPanel 
        filterImportant={true} 
        customNotifications={importantNotifications} 
      />
    </div>
  );

  return (
    <div className="w-full h-16 flex justify-between px-8 align-middle">
      <div className="my-auto basis-1/4">
        {isAuthenticated ? (
          <>
            <div className="my-auto tracking-wide">
              Welcome, {user ? user.name : "user"}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
      <div className="my-auto text-2xl flex font-extrabold basis-1/2 justify-center">
        <img src={logo} className="w-[35px] h-fit my-auto mr-4" alt="" />
        TimeTableWiz
      </div>
      <div className="my-auto basis-1/4 flex justify-end items-center">
        {isAuthenticated && (
          <Dropdown 
            overlay={notificationContent} 
            placement="bottomRight" 
            trigger={["click"]}
            visible={notificationVisible}
            onVisibleChange={setNotificationVisible}
          >
            <Badge count={unreadCount} size="small" className="mr-6">
              <Tooltip title="Notifications">
                <BellOutlined 
                  style={{ fontSize: '20px', cursor: 'pointer' }} 
                  onClick={toggleNotification}
                />
              </Tooltip>
            </Badge>
          </Dropdown>
        )}
        {isAuthenticated && <GoldButton text="Sign out" onClick={onClick} />}
      </div>
    </div>
  );
}

export default Header;
