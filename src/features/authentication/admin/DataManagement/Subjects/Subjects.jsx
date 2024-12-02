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
  const { subjects } = useSelector((state) => state.data);

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
    if (editingSubject) {
      const updatedSubjects = subjects.map((subject) =>
        subject.key === editingSubject.key ? { ...subject, ...values } : subject
      );
      setSubjects(updatedSubjects);
      setFilteredSubjects(updatedSubjects);
      message.success("Subject updated successfully!");
    } else {
      const newSubject = { key: subjects.length + 1, ...values };
      setSubjects([...subjects, newSubject]);
      setFilteredSubjects([...subjects, newSubject]);
      message.success("Subject added successfully!");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteSubject = (key) => {
    const updatedSubjects = subjects.filter((subject) => subject.key !== key);
    setSubjects(updatedSubjects);
    setFilteredSubjects(updatedSubjects);
    message.success("Subject deleted successfully!");
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
        subject.name.toLowerCase().includes(value.toLowerCase()) ||
        subject.longName.toLowerCase().includes(value.toLowerCase()) ||
        subject.code.toLowerCase().includes(value.toLowerCase())
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
      title: "Comments",
      dataIndex: "description",
      key: "comments",
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
            onConfirm={() => handleDeleteSubject(record.key)}
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
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Enter subject name" />
          </Form.Item>

          <Form.Item
            label="Long Name"
            name="longName"
            rules={[{ required: true, message: "Please enter a long name" }]}
          >
            <Input placeholder="Enter subject long name" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[{ required: true, message: "Please enter a subject code" }]}
          >
            <Input placeholder="Enter subject code" />
          </Form.Item>

          <Form.Item
            label="Comments"
            name="comments"
            rules={[{ required: true, message: "Please enter comments" }]}
          >
            <Input.TextArea rows={3} placeholder="Enter any comments" />
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
