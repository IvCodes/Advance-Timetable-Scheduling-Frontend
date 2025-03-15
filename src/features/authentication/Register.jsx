import React, { useState, useEffect } from "react";
import { Form, Input, Button, Select, notification, message, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  registerUser,
  getFaculties,
  getYears,
  checkIdExists,
} from "./auth.api";
import AuthContainer from "./AuthContainer";
import GoldButton from "../../components/buttons/GoldButton";
import { FacebookOutlined, GoogleOutlined, LoadingOutlined } from "@ant-design/icons";
import "./authContainer.css";

import AnimatedPage from "../../pages/AnimatedPage";
import {
  Collapse,
  ConfigProvider,
} from "antd";

function Register() {
  const [form] = Form.useForm();

  const [role, setRole] = React.useState("admin");

  const [subgroupOptions, setSubgroupOptions] = useState([]);

  const [loading, setLoading] = useState(false);

  const { error, faculties, years } = useSelector(
    (state) => state.auth
  );

  console.log(role);

  const openNotificationWithIcon = (type, title, description) => {
    notification[type]({
      message: title,
      description,
    });
  };

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getFaculties());
    dispatch(getYears());
  }, [dispatch]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [id]: value }));
  };

  const handleSelectChange = (field, value) => {
    if (field === "year") {
      const selectedYear = years.find((y) => y.name === value);
      if (selectedYear) {
        setSubgroupOptions(
          selectedYear.subgroups.map((subgroup) => ({
            value: subgroup.code,
            label: subgroup.name,
          }))
        );
      } else {
        setSubgroupOptions([]);
      }
    }
  };

  const handleSubmit = async (values) => {
    // Debug output
    console.log("Form submitted with values:", values);
    
    try {
      // Show loading state
      setLoading(true);
      
      // Ensure role is set correctly
      values.role = role;
      
      // Format ID if needed
      if (values.id && !values.id.match(/^(ST|FA|AD)\d{7}$/)) {
        if (role === "admin" && !values.id.startsWith("AD")) {
          values.id = `AD${values.id.replace(/^[A-Za-z]+/, "")}`;
        } else if (role === "faculty" && !values.id.startsWith("FA")) {
          values.id = `FA${values.id.replace(/^[A-Za-z]+/, "")}`;
        } else if (role === "student" && !values.id.startsWith("ST")) {
          values.id = `ST${values.id.replace(/^[A-Za-z]+/, "")}`;
        }
      }
      
      // Create a cleaned registration payload with only the fields needed by the backend
      const registrationPayload = {
        id: values.id,
        first_name: values.first_name,
        last_name: values.last_name,
        username: values.username,
        email: values.email,
        password: values.password,
        position: values.position || "Administrator", // Default if not set
        role: values.role,
        // These should be null for admin
        year: role === "admin" ? null : values.year,
        subgroup: role === "admin" ? null : values.subgroup,
        faculty: role === "admin" ? null : values.faculty
      };
      
      console.log("Sending registration payload:", registrationPayload);
      
      // Dispatch registration action
      const result = await dispatch(registerUser(registrationPayload));
      console.log("Registration API response:", result);
      
      if (result.type.endsWith('/fulfilled')) {
        openNotificationWithIcon(
          "success",
          "Registration Successful",
          "You have successfully registered"
        );
        navigate("/login");
      } else {
        openNotificationWithIcon(
          "error",
          "Registration Failed",
          result.payload || "Failed to register user"
        );
      }
    } catch (err) {
      console.error("Registration error:", err);
      openNotificationWithIcon(
        "error", 
        "Registration Failed", 
        err.message || "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const changeRole = (value) => {
    setRole(value);
    console.log(value);
  };

  const generateUniversityId = async () => {
    let isUnique = false;
    let generatedId = "";
    
    // Show loading message
    const loadingMessage = message.loading("Generating unique ID...", 0);
    
    try {
      // Try up to 5 times to generate a unique ID
      for (let attempts = 0; attempts < 5 && !isUnique; attempts++) {
        // Generate a random 7-digit number
        const randomDigits = Math.floor(1000000 + Math.random() * 9000000).toString().substring(0, 7);
        
        // Create the ID with the admin prefix (we're only generating IDs for admins)
        generatedId = `AD${randomDigits}`;
        
        // Check if the ID already exists
        try {
          const result = await dispatch(checkIdExists(generatedId));
          console.log("ID check result:", result);
          
          // If the ID doesn't exist, we can use it
          if (result.payload && !result.payload.exists) {
            isUnique = true;
          }
        } catch (error) {
          console.error("Error checking ID:", error);
          // If there's an error checking, assume it's unique (fallback)
          isUnique = true;
        }
      }
      
      // Close loading message
      loadingMessage();
      
      if (isUnique) {
        console.log("Generated unique ID:", generatedId);
        
        // Update the form with the generated ID
        form.setFieldsValue({ id: generatedId });
        
        // Manually update the input field for immediate visual feedback
        const idInput = document.querySelector('input#id');
        if (idInput) {
          idInput.value = generatedId;
          // Trigger input event to ensure React form state is updated
          const event = new Event('input', { bubbles: true });
          idInput.dispatchEvent(event);
        }
        
        message.success("Unique ID generated successfully!");
      } else {
        message.error("Could not generate a unique ID. Please try again or enter one manually.");
      }
    } catch (error) {
      // Close loading message
      loadingMessage();
      console.error("Error generating ID:", error);
      message.error("Error generating ID: " + (error.message || "Unknown error"));
    }
  };

  // Define admin positions
  const adminPositions = [
    "System Administrator",
    "Department Admin",
    "Resource Manager",
    "Administrator"
  ];

  return (
    <AnimatedPage>
      <div className="flex flex-col justify-center items-center h-full">
        <div className="flex flex-row w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="w-2/3 p-6">
            <h2 className="text-2xl font-semibold mb-6">Register</h2>
            <Form 
              form={form} 
              onFinish={handleSubmit} 
              labelCol={{ span: 24 }}
              initialValues={{ role: "admin" }}
              onFinishFailed={(errorInfo) => {
                console.log('Form validation failed:', errorInfo);
                message.error('Please fix the form errors before submitting');
              }}
            >
              <div className="mb-4">
                <Form.Item
                  label={<span className="text-gwhite">University ID</span>}
                  name="id"
                  className="relative"
                  rules={[
                    { 
                      required: true, 
                      message: "Please enter your University ID" 
                    },
                    {
                      validator: (_, value) => {
                        // Validate based on role
                        if (role === "student" && !value.match(/^ST\d{7}$/)) {
                          return Promise.reject("Student ID must be in format ST followed by 7 digits");
                        }
                        if (role === "faculty" && !value.match(/^FA\d{7}$/)) {
                          return Promise.reject("Faculty ID must be in format FA followed by 7 digits");
                        }
                        if (role === "admin" && !value.match(/^AD\d{7}$/)) {
                          return Promise.reject("Admin ID must be in format AD followed by 7 digits");
                        }
                        return Promise.resolve();
                      }
                    }
                  ]}
                >
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Enter University ID"
                      className="w-full"
                      id="id"
                      name="id"
                      value={form.getFieldValue('id')}
                      onChange={(e) => {
                        form.setFieldsValue({ id: e.target.value });
                      }}
                    />
                    {role === "admin" && (
                      <Button
                        type="primary"
                        onClick={generateUniversityId}
                        className="ml-2 bg-blue-600 hover:bg-blue-500"
                      >
                        Generate ID
                      </Button>
                    )}
                  </div>
                </Form.Item>
              </div>

              <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Email</span>}
                    name="email"
                    rules={[
                      { required: true, message: "Please enter your email" },
                      {
                        type: "email",
                        message: "Please enter a valid email address",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your email" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Username</span>}
                    name="username"
                    rules={[
                      { required: true, message: "Please enter your username" },
                    ]}
                  >
                    <Input placeholder="Enter your username" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">First Name</span>}
                    name="first_name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your first name" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Last Name</span>}
                    name="last_name"
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                    ]}
                  >
                    <Input placeholder="Enter your last name" />
                  </Form.Item>
                </div>
              </div>

              <div className="flex flex-wrap -mx-4">
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Password</span>}
                    name="password"
                    rules={[
                      { required: true, message: "Please enter your password" },
                    ]}
                  >
                    <Input.Password placeholder="Enter your password" />
                  </Form.Item>
                </div>
                <div className="w-full md:w-1/2 px-4 mb-4">
                  <Form.Item
                    label={
                      <span className="text-gwhite">Confirm Password</span>
                    }
                    name="confirmPassword"
                    dependencies={["password"]}
                    rules={[
                      {
                        required: true,
                        message: "Please confirm your password",
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue("password") === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(
                            new Error("Passwords do not match")
                          );
                        },
                      }),
                    ]}
                  >
                    <Input.Password placeholder="Confirm your password" />
                  </Form.Item>
                </div>
              </div>

              {role === "student" && (
                <>
                  <div className="mb-4">
                    <Form.Item
                      label={<span className="text-gwhite">Faculty</span>}
                      name="faculty"
                      rules={[
                        { required: true, message: "Please select a faculty" },
                      ]}
                    >
                      <Select
                        placeholder="Select Faculty"
                        options={faculties.map((faculty) => ({
                          value: faculty.code,
                          label: faculty.long_name,
                        }))}
                      />
                    </Form.Item>
                  </div>

                  <div className="mb-4">
                    <Form.Item
                      label={<span className="text-gwhite">Year</span>}
                      name="year"
                      rules={[
                        { required: true, message: "Please select a year" },
                      ]}
                    >
                      <Select
                        placeholder="Select Year"
                        options={years.map((year) => ({
                          value: year.name,
                          label: year.long_name,
                        }))}
                        onChange={(value) => handleSelectChange("year", value)}
                      />
                    </Form.Item>
                  </div>

                  <div className="mb-4">
                    <Form.Item
                      label={<span className="text-gwhite">Subgroup</span>}
                      name="subgroup"
                      rules={[
                        { required: true, message: "Please select a subgroup" },
                      ]}
                    >
                      <Select
                        placeholder="Select Subgroup"
                        options={subgroupOptions}
                      />
                    </Form.Item>
                  </div>
                </>
              )}

              {role === "faculty" && (
                <div className="mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Position</span>}
                    name="position"
                    rules={[
                      { required: true, message: "Please select a position" },
                    ]}
                  >
                    <Select
                      placeholder="Select Position"
                      options={[
                        { value: "Lecturer", label: "Lecturer" },
                        { value: "Senior Lecturer", label: "Senior Lecturer" },
                        {
                          value: "Assistant Lecturer",
                          label: "Assistant Lecturer",
                        },
                        { value: "Lab Assistant", label: "Lab Assistant" },
                        { value: "Instructor", label: "Instructor" },
                      ]}
                    />
                  </Form.Item>
                </div>
              )}

              {role === "admin" && (
                <div className="mb-4">
                  <Form.Item
                    label={<span className="text-gwhite">Position</span>}
                    name="position"
                    rules={[
                      { required: true, message: "Please select a position" },
                    ]}
                  >
                    <Select
                      placeholder="Select Position"
                      options={adminPositions.map((position) => ({
                        value: position,
                        label: position,
                      }))}
                    />
                  </Form.Item>
                </div>
              )}

              <GoldButton 
                type="primary"
                htmlType="submit"
                bgColor="#243647"
                disabled={loading}
                style={{ width: "100%" }}
                className="register-button"
              >
                {loading ? <Spin /> : "REGISTER"}
              </GoldButton>
            </Form>
          </div>

          <div className="w-1/3 p-6 bg-gray-100">
            <h2 className="text-xl font-semibold mb-4">Select Role</h2>
            <Select
              value={role}
              onChange={(values) => changeRole(values)}
              style={{ width: "100%" }}
              options={[
                { value: "student", label: "Student" },
                { value: "faculty", label: "Teacher" },
                { value: "admin", label: "Administrator" }
              ]}
            />
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
}

export default Register;
