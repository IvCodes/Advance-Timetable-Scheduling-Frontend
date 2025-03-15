import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  message,
  ConfigProvider,
  Button,
} from "antd";
import GoldButton from "../../../components/buttons/GoldButton";
import { Popconfirm } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { getSpaces, addSpace, updateSpace, deleteSpace } from "./data.api";

const Space = () => {
  const spaces = useSelector((state) => state.data.spaces);
  const loading = useSelector((state) => state.data.loading);
  const dispatch = useDispatch();

  const [filteredSpaces, setFilteredSpaces] = useState(spaces);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getSpaces());
  }, [dispatch]);

  useEffect(() => {
    setFilteredSpaces(spaces);
  }, [spaces]);

  const handleAddEditSpace = (values) => {
    console.log("here", values);
    if (editingSpace) {
      dispatch(updateSpace(values));
      dispatch(getSpaces());
      message.success("Space updated successfully!");
    } else {
      dispatch(addSpace(values));
      dispatch(getSpaces());
      message.success("Space added successfully!");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteSpace = (key) => {
    dispatch(deleteSpace(key));
    dispatch(getSpaces());
    message.success("Space deleted successfully!");
  };

  const showAddEditModal = (space = null) => {
    setEditingSpace(space);
    setIsModalVisible(true);
    if (space) {
      form.setFieldsValue(space);
    } else {
      form.resetFields();
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
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
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
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
            title="Are you sure to delete this space?"
            onConfirm={() => handleDeleteSpace(record.code)}
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
        Spaces
      </h2>

      <div className="mb-4">
        <GoldButton onClick={() => showAddEditModal()}>Add Space</GoldButton>
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
          dataSource={filteredSpaces}
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
        title={editingSpace ? "Edit Space" : "Add Space"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEditSpace}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter a name" }]}
          >
            <Input placeholder="Enter space name" />
          </Form.Item>

          <Form.Item
            label="Long Name"
            name="long_name"
            rules={[{ required: true, message: "Please enter a long name" }]}
          >
            <Input placeholder="Enter long name" />
          </Form.Item>

          <Form.Item
            label="Code"
            name="code"
            rules={[
              {
                required: true,
                message: "Code must be alphanumeric and 3-10 characters",
                pattern: "^[A-Z0-9]{3,10}$",
              },
            ]}
          >
            <Input placeholder="Enter code" />
          </Form.Item>

          <Form.Item
            label="Capacity"
            name="capacity"
            rules={[
              { required: true, message: "Please enter a valid capacity" },
              {
                type: "number",
                min: 1,
                message: "Capacity must be greater than 0",
              },
            ]}
          >
            <InputNumber placeholder="Enter capacity" min={1} />
          </Form.Item>

          <Form.Item label="Attributes (optional)" name="attributes">
            <Input.TextArea
              rows={3}
              placeholder="Enter attributes as key:value pairs"
            />
          </Form.Item>

          <Form.Item>
            <GoldButton
              type="primary"
              htmlType="submit"
              onClick={() => form.submit()}
              style={{
                backgroundColor: "var(--color-gold-dark)",
                borderColor: "var(--color-gold-dark)",
                width: "100%",
              }}
            >
              {editingSpace ? "Update" : "Add"}
            </GoldButton>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Space;
