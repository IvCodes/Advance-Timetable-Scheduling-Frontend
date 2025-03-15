import React from "react";
import { NavLink } from "react-router-dom";
import logo from "../../assets/LogoTimeTableWiz_v2.png";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../features/authentication/auth.slice";
import GoldButton from "../buttons/GoldButton";

function Navbar({ links }) {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const onClick = () => {
    dispatch(logout());
    navigate("/");
  };

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
      <div className="my-auto ml-10 mr-10  justify-end">
        {" "}
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
