import React, { useState, useEffect } from "react";
import GoldButton from "../../components/buttons/GoldButton";
import TextInput from "../../components/input/TextInput";
import { notification } from "antd";
import { loginUser } from "./auth.api";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearError } from "./auth.slice";

function Login() {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setCredentials((prev) => ({ ...prev, [id]: value }));
  };

  const openNotification = (type, message, description) => {
    notification[type]({
      message,
      description,
      placement: "topRight",
      duration: 3,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      if (result) {
        const { access_token, token_type, role } = result;
        localStorage.setItem("token", `${token_type} ${access_token}`);
        localStorage.setItem("role", role);
        openNotification(
          "success",
          "Login Successful",
          "Welcome back! You have successfully logged in."
        );
        navigate("/");
      }
    } catch (err) {
      openNotification(
        "error",
        "Login Failed",
        err || "Invalid credentials. Please try again."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome Back
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                User ID
              </label>
              <TextInput
                id="id"
                name="id"
                required
                value={credentials.id}
                onChange={handleInputChange}
                placeholder="Enter your ID"
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <TextInput
                id="password"
                name="password"
                type="password"
                required
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="mt-1"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 text-center">
              {error}
            </div>
          )}

          <div>
            <GoldButton
              type="submit"
              disabled={loading}
              loading={loading}
              className="w-full"
            >
              {loading ? "Signing in..." : "Sign in"}
            </GoldButton>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;