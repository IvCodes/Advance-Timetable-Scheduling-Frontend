import React, { useState } from "react";
import GoldButton from "../../components/buttons/GoldButton";
import TextInput from "../../components/input/TextInput";
import { notification } from "antd";
import { loginUser } from "./auth.api";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function Login() {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
  };

  const openNotificationWithIcon = (type, title, description) => {
    notification[type]({
      message: title,
      description,
    });
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(credentials));
      if (result.payload) {
        const { access_token, token_type, role } = result.payload;

        localStorage.setItem("token", `${token_type} ${access_token}`);
        localStorage.setItem("role", `${role}`);

        openNotificationWithIcon(
          "success",
          "Login Successful",
          "You have successfully logged in"
        );
        navigate("/");
      }
    } catch (error) {
      openNotificationWithIcon(
        "error",
        "Login Failed",
        error?.message || "An error occurred while logging in"
      );
    }
  };

  return (
    <div className="flex flex-col gap-4 p-6">
      <h2 className="text-2xl font-bold text-center">Login</h2>
      <form onSubmit={login} className="flex flex-col gap-4">
        <div>
          <TextInput
            id="id"
            placeholder="Enter your ID"
            required
            onChange={handleInputChange}
          />
        </div>
        <div>
          <TextInput
            type="password"
            id="password"
            placeholder="Enter your password"
            required
            onChange={handleInputChange}
          />
        </div>
        <GoldButton loading={loading}>Login</GoldButton>
      </form>
    </div>
  );
}

export default Login;