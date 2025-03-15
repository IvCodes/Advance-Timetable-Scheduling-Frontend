import React, { useState } from "react";
import logo from "../../assets/LogoTimeTableWiz_v2.png";
import { Button } from "antd";
import GoldButton from "../buttons/GoldButton";

import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../features/authentication/auth.slice";
import { useNavigate } from "react-router-dom";

function Header() {
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onClick = () => {
    dispatch(logout());
    navigate("/");
  };

  return (
    <div className="w-full h-16  flex justify-between px-8 align-middle">
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
    </div>
  );
}

export default Header;
