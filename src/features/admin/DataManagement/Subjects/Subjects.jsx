import React, { useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  message,
  Popconfirm,
  ConfigProvider,
} from "antd";
import GoldButton from "../../../../components/buttons/GoldButton";
import { useSelector, useDispatch } from "react-redux";
import {
  getSubjects,
  addSubjects,
  updateSubjects,
  deleteSubjects,
} from "../data.api";
import { useEffect } from "react";

const Subjects = () => {
  const { subjects, loading } = useSelector((state) => state.data);

  const [filteredSubjects, setFilteredSubjects] = useState(subjects);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);

  const [form] = Form.useForm();

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSubjects());
  }, [dispatch]);

  useEffect(() => {
    setFilteredSubjects(subjects);
  }, [subjects]);

  const handleAddEditSubject = (values) => {
    console.log(values);
    if (editingSubject) {
      dispatch(updateSubjects({ ...editingSubject, ...values }));
      dispatch(getSubjects());
      message.success("Subject updated successfully!");
    } else {
      dispatch(addSubjects(values));
      dispatch(getSubjects());
      console.log(subjects);
      const newSubject = { key: subjects.length + 1, ...values };
      message.success("Subject added successfully!");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteSubject = (key) => {
    dispatch(deleteSubjects(key));
    message.success("Subject deleted successfully!");
    dispatch(getSubjects());
  };

  const showAddEditModal = (subject = null) => {
    setEditingSubject(subject);
    setIsModalVisible(true);
    if (subject) {
      form.setFieldsValue(subject);
    } else {
      form.resetFields();
    }
  };

  const handleSearch = (value) => {
    const filtered = subjects.filter(
      (subject) =>
        subject.name?.toLowerCase().includes(value.toLowerCase()) ||
        subject.long_name?.toLowerCase().includes(value.toLowerCase()) ||
        subject.code?.includes(value)
    );
    setFilteredSubjects(filtered);
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Long Name",
      dataIndex: "long_name",
      key: "longName",
      sorter: (a, b) => a.longName.localeCompare(b.longName),
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
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
            title="Are you sure to delete this subject?"
            onConfirm={() => handleDeleteSubject(record.code)}
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
        Subjects
      </h2>

      <div className="mb-4">
        <ConfigProvider
          theme={{
            components: {
              Input: {
                activeBorderColor: "#D9A648",
                hoverBorderColor: "#D9A648",
              },
            },
          }}
        >
          <Input.Search
            placeholder="Search by name, long name, or code"
            onSearch={handleSearch}
            enterButton
            allowClear
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gblack"
          />
        </ConfigProvider>
      </div>

      <div className="mb-4">
        <Button type="primary" onClick={() => showAddEditModal()}>
          Add Subject
        </Button>
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
          dataSource={filteredSubjects}
          rowKey="key"
          pagination={{ pageSize: 5 }}
          bordered
          style={{
            backgroundColor: "transpoarent",
            borderColor: "var(--color-gold)",
          }}
        />
      </ConfigProvider>

      <Modal
        title={editingSubject ? "Edit Subject" : "Add Subject"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEditSubject}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter a name" },
              {
                pattern: /^[a-zA-Z0-9\s]+$/,
                message: "Name can only contain letters, numbers, and spaces",
              },
              { max: 50, message: "Name cannot exceed 50 characters" },
            ]}
          >
            <Input placeholder="Enter subject name" />
          </Form.Item>

          <Form.Item
            label="Long Name"
            name="long_name"
            rules={[
              { required: true, message: "Please enter a long name" },
              {
                pattern: /^[a-zA-Z0-9\s]+$/,
                message:
                  "Long name can only contain letters, numbers, and spaces",
              },
              { max: 100, message: "Long name cannot exceed 100 characters" },
            ]}
          >
            <Input placeholder="Enter subject long name" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[
              { required: true, message: "Please enter a subject code" },
              {
                pattern: /^[A-Z]{2,5}[0-9]{2,4}$/,
                message:
                  "Code must start with 2-5 uppercase letters followed by 2-4 numbers (e.g., CS101)",
              },
            ]}
          >
            <Input placeholder="Enter subject code" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              {
                max: 250,
                message: "Description cannot exceed 250 characters",
              },
            ]}
          >
            <Input.TextArea rows={3} placeholder="Enter any description" />
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
              {editingSubject ? "Update" : "Add"}
            </GoldButton>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Subjects;
