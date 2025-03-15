import React, { useState } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  message,
  ConfigProvider,
  Button,
  Select,
} from "antd";
import GoldButton from "../../../components/buttons/GoldButton";
import { Popconfirm } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  getTeachers,
  addTeacher,
  updateTeacher,
  deleteTeacher,
  getSubjects,
} from "./data.api";
import { getFaculties, getYears } from "../../authentication/auth.api";
import { useEffect } from "react";
import TextInput from "./../../../components/input/TextInput";

const Teachers = () => {
  const teachers = useSelector((state) => state.data.teachers);
  const loading = useSelector((state) => state.data.loading);
  const { faculties, years } = useSelector((state) => state.auth);
  const { subjects } = useSelector((state) => state.data);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTeachers());
    dispatch(getSubjects());
    dispatch(getFaculties());
    dispatch(getYears());
  }, [dispatch]);

  useEffect(() => {
    setFilteredTeachers(teachers);
  }, [teachers]);

  const [filteredTeachers, setFilteredTeachers] = useState(teachers);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [form] = Form.useForm();

  const handleAddEditTeacher = (values) => {
    values.role = "faculty";
    console.log(values);
    if (editingTeacher) {
      dispatch(updateTeacher(values));
      dispatch(getTeachers());
      message.success("Teacher updated successfully!");
    } else {
      dispatch(addTeacher(values));
      dispatch(getTeachers());
      message.success("Teacher added successfully!");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteTeacher = (key) => {
    dispatch(deleteTeacher(key));
    dispatch(getTeachers());
    message.success("Teacher deleted successfully!");
  };

  const showAddEditModal = (teacher = null) => {
    console.log(teacher);
    setEditingTeacher(teacher);
    setIsModalVisible(true);
    if (teacher) {
      form.setFieldsValue(teacher);
    } else {
      form.resetFields();
    }
  };
  const handleSelectChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span className="text-gold-dark">
          {record.first_name + " " + record.last_name}
        </span>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
    },
    {
      title: "Subjects",
      dataIndex: "subjects",
      key: "subjects",
      render: (text, record) => (
        <span className="text-gold-dark">{record.subjects.join(", ")}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <>
          <Button type="link" onClick={() => showAddEditModal(record)}>
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this tag?"
            onConfirm={() => handleDeleteTeacher(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
        Teachers
      </h2>

      <div className="mb-4">
        <GoldButton onClick={() => showAddEditModal()}>Add Teacher</GoldButton>
      </div>

      <ConfigProvider
        theme={{
          components: {
            Table: {
              colorBgContainer: "transparent",
              colorText: "rgba(255,255,255,0.88)",
              headerColor: "rgba(255,255,255,0.88)",
              borderColor: "#2C4051",
              headerBg: "#243546",
            },
          },
        }}
      >
        <Table
          loading={loading}
          columns={columns}
          dataSource={filteredTeachers}
          rowKey="key"
          pagination={{ pageSize: 5 }}
          bordered
          style={{
            backgroundColor: "transparent",
            borderColor: "var(--color-gold)",
          }}
        />
      </ConfigProvider>

      <Modal
        title={editingTeacher ? "Edit Teacher" : "Add Teacher"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEditTeacher}>
          <Form.Item
            label="University Issued ID"
            name="id"
            rules={[
              { required: true, message: "Please enter the University ID" },
              {
                pattern: /^FA\d{7}$/,
                message:
                  "University ID must start with 'FA' followed by 7 digits",
              },
            ]}
          >
            <TextInput placeholder="Enter your University ID" />
          </Form.Item>
          <div className="flex flex-wrap -mx-4">
            <div className="w-full md:w-1/2 px-4 mb-4">
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Please enter your email" },
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                ]}
              >
                <TextInput placeholder="Enter your email" />
              </Form.Item>
            </div>
            <div className="w-full md:w-1/2 px-4 mb-4">
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  { required: true, message: "Please enter your username" },
                ]}
              >
                <TextInput placeholder="Enter your username" />
              </Form.Item>
            </div>
          </div>

          <div className="flex flex-wrap -mx-4">
            <div className="w-full md:w-1/2 px-4 mb-4">
              <Form.Item
                label="First Name"
                name="first_name"
                rules={[
                  { required: true, message: "Please enter your first name" },
                ]}
              >
                <TextInput placeholder="Enter your first name" />
              </Form.Item>
            </div>
            <div className="w-full md:w-1/2 px-4 mb-4">
              <Form.Item
                label="Last Name"
                name="last_name"
                rules={[
                  { required: true, message: "Please enter your last name" },
                ]}
              >
                <TextInput placeholder="Enter your last name" />
              </Form.Item>
            </div>
          </div>

          {!editingTeacher && (
            <div className="flex flex-wrap -mx-4">
              <div className="w-full md:w-1/2 px-4 mb-4">
                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    { required: true, message: "Please enter your password" },
                    {
                      min: 6,
                      message: "Password must be at least 6 characters long",
                    },
                  ]}
                >
                  <TextInput
                    type="password"
                    placeholder="Enter your password"
                  />
                </Form.Item>
              </div>
              <div className="w-full md:w-1/2 px-4 mb-4">
                <Form.Item
                  label="Confirm Password"
                  name="confirmPassword"
                  rules={[
                    { required: true, message: "Please confirm your password" },
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
                  <TextInput
                    type="password"
                    placeholder="Confirm your password"
                  />
                </Form.Item>
              </div>
            </div>
          )}
          <Form.Item
            label="Position"
            name="position"
            rules={[{ required: true, message: "Please select a position" }]}
          >
            <Select
              placeholder="Select Position"
              onChange={(value) => handleSelectChange("position", value)}
              style={{ width: "100%" }}
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
          <Form.Item
            label="Subjects"
            name="subject_ids"
            rules={[
              { required: true, message: "Please select at least one subject" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select subjects"
              showSearch={true}
              options={subjects.map((subject) => ({
                value: subject.code,
                label: subject.long_name,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <GoldButton
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "var(--color-gold-dark)",
                borderColor: "var(--color-gold-dark)",
                width: "100%",
              }}
              onClick={() => form.submit()}
            >
              {editingTeacher ? "Update" : "Add"}
            </GoldButton>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Teachers;
