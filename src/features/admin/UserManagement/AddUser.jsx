import React, { useState, useEffect } from "react";
import { Form, Select, Button, notification } from "antd";
import TextInput from "../../../components/input/TextInput";
import { useDispatch, useSelector } from "react-redux";
import {
  getFaculties,
  getYears,
  registerUser,
} from "../../authentication/auth.api";

const { Option } = Select;

const AddOrRegisterUser = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("Student");
  const [subgroupOptions, setSubgroupOptions] = useState([]);
  const dispatch = useDispatch();

  const { faculties, years } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getFaculties());
    dispatch(getYears());
  }, [dispatch]);

  const handleRoleChange = (value) => {
    setRole(value);
    form.resetFields(["faculty", "year", "subgroup", "position"]);
  };

  const handleYearChange = (value) => {
    const selectedYear = years.find((y) => y.name === value);
    setSubgroupOptions(
      selectedYear?.subgroups.map((subgroup) => ({
        value: subgroup.code,
        label: subgroup.name,
      })) || []
    );
    form.setFieldsValue({ subgroup: null });
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await dispatch(registerUser(values));
      notification.success({
        message: "Success",
        description: "User registered successfully!",
      });
      form.resetFields();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to register user.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className=" p-6 rounded-xl shadow-md max-w-lg mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gwhite">
        Add/Register User
      </h2>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="id"
          label={<span className="text-gwhite">University ID</span>}
          rules={[
            { required: true, message: "Please enter the university ID" },
          ]}
        >
          <TextInput placeholder="Enter University ID" />
        </Form.Item>

        <Form.Item
          name="email"
          label={<span className="text-gwhite">Email</span>}
          rules={[
            { type: "email", message: "Invalid email!" },
            { required: true, message: "Please enter an email" },
          ]}
        >
          <TextInput placeholder="Enter Email" />
        </Form.Item>

        <Form.Item
          name="username"
          label={<span className="text-gwhite">Username</span>}
          rules={[{ required: true, message: "Please enter a username" }]}
        >
          <TextInput placeholder="Enter Username" />
        </Form.Item>

        <Form.Item
          name="password"
          label={<span className="text-gwhite">Password</span>}
          rules={[{ required: true, message: "Please enter a password" }]}
        >
          <TextInput type="password" placeholder="Enter Password" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span className="text-gwhite">Confirm Password</span>}
          dependencies={["password"]}
          rules={[
            { required: true, message: "Please confirm your password" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error("Passwords do not match!"));
              },
            }),
          ]}
        >
          <TextInput type="password" placeholder="Confirm Password" />
        </Form.Item>

        <Form.Item
          name="role"
          label={<span className="text-gwhite">Role</span>}
          initialValue="Student"
          rules={[{ required: true, message: "Please select a role" }]}
        >
          <Select onChange={handleRoleChange} placeholder="Select Role">
            <Option value="Student">Student</Option>
            <Option value="Faculty">Faculty</Option>
          </Select>
        </Form.Item>

        {role === "Student" && (
          <>
            <Form.Item
              name="faculty"
              label={<span className="text-gwhite">Faculty</span>}
              rules={[{ required: true, message: "Please select a faculty" }]}
            >
              <Select
                placeholder="Select Faculty"
                options={faculties.map((f) => ({
                  value: f.code,
                  label: f.long_name,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="year"
              label={<span className="text-gwhite"> Year </span>}
              rules={[{ required: true, message: "Please select a year" }]}
            >
              <Select
                placeholder="Select Year"
                options={years.map((y) => ({
                  value: y.name,
                  label: y.long_name,
                }))}
                onChange={handleYearChange}
              />
            </Form.Item>

            <Form.Item
              name="subgroup"
              label={<span className="text-gwhite">Subgroup</span>}
              rules={[{ required: true, message: "Please select a subgroup" }]}
            >
              <Select placeholder="Select Subgroup" options={subgroupOptions} />
            </Form.Item>
          </>
        )}

        {role === "Faculty" && (
          <Form.Item
            name="position"
            label={<span className="text-gwhite">Position</span>}
            rules={[{ required: true, message: "Please select a position" }]}
          >
            <Select
              placeholder="Select Position"
              options={[
                { value: "Lecturer", label: "Lecturer" },
                { value: "Senior Lecturer", label: "Senior Lecturer" },
                { value: "Assistant Lecturer", label: "Assistant Lecturer" },
                { value: "Lab Assistant", label: "Lab Assistant" },
                { value: "Instructor", label: "Instructor" },
              ]}
            />
          </Form.Item>
        )}

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full"
          >
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddOrRegisterUser;
