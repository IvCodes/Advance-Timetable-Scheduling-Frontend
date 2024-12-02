import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  ConfigProvider,
  Popconfirm,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getFaculties } from "../../../authentication/auth.api";
import { addFaculty, deleteFaculties, updateFaculties } from "../data.api";
import FacultyTable from "./FacultyTable";

export default function Faculties() {
  const { faculties, loading } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFaculties());
  }, [dispatch]);

  const columns = [
    {
      title: "Name",
      dataIndex: "short_name",
      key: "short_name",
      sorter: (a, b) => a.short_name.localeCompare(b.name),
    },
    {
      title: "Long Name",
      dataIndex: "long_name",
      key: "long_name",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
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
            title="Are you sure to delete this faculty?"
            onConfirm={() => handleDeleteFaculty(record.code)}
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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [form] = Form.useForm();

  const showAddEditModal = (faculty = null) => {
    setEditingFaculty(faculty);
    setIsModalVisible(true);
    if (faculty) {
      form.setFieldsValue(faculty);
    } else {
      form.resetFields();
    }
  };

  const handleEditFaculty = (values) => {
    console.log(values);
    if (editingFaculty) {
      dispatch(updateFaculties(values));
      message.success("Faculty updated successfully!");
    } else {
      dispatch(addFaculty(values));
      message.success("Faculty added successfully!");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteFaculty = (key) => {
    console.log(key);
    dispatch(deleteFaculties(key));
    message.success("Faculty deleted successfully!");
  };

  return (
    <div className="bg-white p-6 shadow-md max-w-4xl mx-auto">
      <div className="mb-4">
        <Button
          className="font-light"
          type="primary"
          onClick={() => showAddEditModal()}
        >
          Add Faculty
        </Button>
      </div>
      <FacultyTable
        columns={columns}
        filteredFaculties={faculties}
        loading={loading}
      />
      <Modal
        title={editingFaculty ? "Edit Faculty" : "Add Faculty"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleEditFaculty}>
          <Form.Item
            label="Name"
            name="short_name"
            rules={[
              { required: true, message: "Please enter a unique short name" },
            ]}
          >
            <Input placeholder="Enter faculty short name" />
          </Form.Item>

          <Form.Item label="Long Name" name="long_name">
            <Input placeholder="Enter long name" />
          </Form.Item>

          <Form.Item label="Code" name="code">
            <Input placeholder="Enter code " />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{
                backgroundColor: "var(--color-gold-dark)",
                borderColor: "var(--color-gold-dark)",
                width: "100%",
              }}
            >
              {editingFaculty ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
