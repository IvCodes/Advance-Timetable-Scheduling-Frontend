import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  ConfigProvider,
} from "antd";
import { Popconfirm } from "antd";

const Tags = () => {
  const [tags, setTags] = useState([
    {
      key: 1,
      name: "Science",
      longName: "Scientific Studies",
      code: "SCI",
      comments: "Related to science.",
    },
    {
      key: 2,
      name: "Math",
      longName: "Mathematics",
      code: "MTH",
      comments: "Related to mathematics.",
    },
  ]);

  const [filteredTags, setFilteredTags] = useState(tags);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [form] = Form.useForm();

  const handleAddEditTag = (values) => {
    if (editingTag) {
      const updatedTags = tags.map((tag) =>
        tag.key === editingTag.key ? { ...tag, ...values } : tag
      );
      setTags(updatedTags);
      setFilteredTags(updatedTags);
      message.success("Tag updated successfully!");
    } else {
      const newTag = { key: tags.length + 1, ...values };
      setTags([...tags, newTag]);
      setFilteredTags([...tags, newTag]);
      message.success("Tag added successfully!");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteTag = (key) => {
    const updatedTags = tags.filter((tag) => tag.key !== key);
    setTags(updatedTags);
    setFilteredTags(updatedTags);
    message.success("Tag deleted successfully!");
  };

  const showAddEditModal = (tag = null) => {
    setEditingTag(tag);
    setIsModalVisible(true);
    if (tag) {
      form.setFieldsValue(tag);
    } else {
      form.resetFields();
    }
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
      dataIndex: "longName",
      key: "longName",
    },
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Comments",
      dataIndex: "comments",
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
            title="Are you sure to delete this tag?"
            onConfirm={() => handleDeleteTag(record.key)}
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
        Tags
      </h2>

      <div className="mb-4">
        <Button type="primary" onClick={() => showAddEditModal()}>
          Add Tag
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
          dataSource={filteredTags}
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
        title={editingTag ? "Edit Tag" : "Add Tag"}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEditTag}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              { required: true, message: "Please enter a unique tag name" },
            ]}
          >
            <Input placeholder="Enter tag name" />
          </Form.Item>

          <Form.Item label="Long Name" name="longName">
            <Input placeholder="Enter long name (optional)" />
          </Form.Item>

          <Form.Item label="Code" name="code">
            <Input placeholder="Enter code (optional)" />
          </Form.Item>

          <Form.Item label="Comments" name="comments">
            <Input.TextArea rows={3} placeholder="Enter comments (optional)" />
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
              {editingTag ? "Update" : "Add"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Tags;
