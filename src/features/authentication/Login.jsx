import React, { useState } from "react";
import GoldButton from "../../components/buttons/GoldButton";
import { Form, Input, notification, Spin, Button } from "antd";
import AnimatedPage from "../../pages/AnimatedPage";
import { loginUser } from "./auth.api";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

function Login() {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const { loading, error } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loadingState, setLoading] = useState(false);

  const openNotificationWithIcon = (type, title, description) => {
    notification[type]({
      message: title,
      description,
    });
  };

  const login = async (values) => {
    try {
      console.log("Login with values:", values);
      
      // Ensure we're using the correct login credentials structure
      const credentials = {
        username: values.id,
        password: values.password,
      };
      
      console.log("Sending login request with credentials:", credentials);
      setLoading(true);
      
      const response = await dispatch(loginUser(credentials));
      console.log("Login response:", response);
      
      if (response.type.endsWith('/rejected')) {
        const errorMessage = response.payload || "Login failed. Please check your credentials.";
        console.error("Login error:", errorMessage);
        openNotificationWithIcon("error", "Login Failed", errorMessage);
        return;
      }
      
      // Extract user data from response
      const userData = response.payload;
      console.log("Login successful. User data:", userData);
      
      // Save token and role to local storage
      if (userData.token) {
        localStorage.setItem("token", userData.token);
      } else if (userData.access_token) {
        // Handle old format for backward compatibility
        localStorage.setItem("token", userData.access_token);
      } else {
        console.error("No token received in login response");
        openNotificationWithIcon("error", "Login Failed", "No authentication token received");
        return;
      }
      
      // Save user role
      const role = userData.role || "student";
      localStorage.setItem("role", role);
      console.log("Saved user role:", role);
      
      // Navigate based on role
      if (role === "admin") {
        navigate("/admin/dashboard");
      } else if (role === "faculty") {
        navigate("/faculty/dashboard");
      } else {
        navigate("/student/dashboard");
      }
      
      openNotificationWithIcon("success", "Login Successful", "Welcome back!");
    } catch (error) {
      console.error("Login error:", error);
      openNotificationWithIcon(
        "error",
        "Login Failed",
        error.message || "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="flex flex-col justify-center items-center h-full">
        <div className="flex flex-row w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="w-1/2 p-8 bg-gray-100">
            <h2 className="text-4xl font-semibold mb-6">Welcome Back!</h2>
            <div>
              Log in to your account to access your timetable and other features
            </div>
          </div>
          <div className="w-1/2 p-8">
            <h2 className="text-2xl font-semibold mb-6">
              Login to TimeTableWiz
            </h2>
            <Form
              form={form}
              name="login_form"
              initialValues={{ remember: true }}
              onFinish={login}
              labelCol={{ span: 24 }}
            >
              <Form.Item
                label={<span className="text-gwhite">ID</span>}
                name="id"
                rules={[
                  { required: true, message: "Please enter your ID" },
                  {
                    pattern: /^(AD|FA|ST)\d{7}$/,
                    message:
                      "ID must start with FA, AD or ST followed by 7 digits",
                  },
                ]}
              >
                <Input type="text" placeholder="Enter your ID" />
              </Form.Item>

              <Form.Item
                label={<span className="text-gwhite">Password</span>}
                name="password"
                rules={[
                  { required: true, message: "Please enter your password" },
                ]}
              >
                <Input.Password placeholder="Enter your password" />
              </Form.Item>

              <Form.Item className="mb-4 text-center">
                <Button type="primary" htmlType="submit" bgcolor={"#243647"}>
                  {loadingState ? <Spin /> : "Login"}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Login;
