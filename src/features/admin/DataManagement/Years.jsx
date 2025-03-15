import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  ConfigProvider,
  Button,
} from "antd";
import GoldButton from "../../../components/buttons/GoldButton";
import { Popconfirm } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  getYears,
  addYear,
  updateYear,
  deleteYear,
} from "../../authentication/auth.api";

const Years = () => {
  const years = useSelector((state) => state.auth.years);
  const dispatch = useDispatch();

  const [filteredYears, setFilteredYears] = useState(years);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getYears());
  }, [dispatch]);

  useEffect(() => {
    setFilteredYears(years);
  }, [years]);

  const handleAddEditYear = (values) => {
    if (editingYear) {
      dispatch(updateYear({ ...editingYear, ...values }));
      message.success("Year updated successfully!");
    } else {
      dispatch(addYear(values));
      message.success("Year added successfully!");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteYear = (key) => {
    dispatch(deleteYear(key));
    message.success("Year deleted successfully!");
  };

  const showAddEditModal = (year = null) => {
    setEditingYear(year);
    setIsModalVisible(true);
    if (year) {
      form.setFieldsValue({
        ...year,
        subgroups: year.subgroups.map((sg) => `${sg.name} (${sg.code})`),
      });
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
      title: "Total Capacity",
      dataIndex: "total_capacity",
      key: "total_capacity",
    },
    {
      title: "Total Students",
      dataIndex: "total_students",
      key: "total_students",
    },
    {
      title: "Subgroups",
      dataIndex: "subgroups",
      key: "subgroups",
      render: (subgroups) =>
        subgroups.map((sg) => `${sg.name} (${sg.code})`).join(", "),
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
            title="Are you sure to delete this year?"
            onConfirm={() => handleDeleteYear(record.key)}
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
        Years
      </h2>

      <div className="mb-4">
        <GoldButton onClick={() => showAddEditModal()}>Add Year</GoldButton>
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
          dataSource={filteredYears}
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
        title={editingYear ? "Edit Year" : "Add Year"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEditYear}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the year name" }]}
          >
            <InputNumber placeholder="Enter year name (e.g., 1)" min={1} />
          </Form.Item>

          <Form.Item
            label="Long Name"
            name="long_name"
            rules={[{ required: true, message: "Please enter a long name" }]}
          >
            <Input placeholder="Enter long name (e.g., First Year)" />
          </Form.Item>

          <Form.Item
            label="Total Capacity"
            name="total_capacity"
            rules={[
              { required: true, message: "Please enter the total capacity" },
              {
                type: "number",
                min: 1,
                message: "Capacity must be at least 1",
              },
            ]}
          >
            <InputNumber placeholder="Enter total capacity" min={1} />
          </Form.Item>

          <Form.Item
            label="Total Students"
            name="total_students"
            rules={[
              {
                type: "number",
                min: 0,
                message: "Total students must be non-negative",
              },
            ]}
          >
            <InputNumber placeholder="Enter total students" min={0} />
          </Form.Item>

          <Form.Item label="Subgroups" name="subgroups">
            <Select
              mode="multiple"
              placeholder="Select subgroups"
              options={years
                .flatMap((year) => year.subgroups)
                .map((subgroup) => ({
                  value: subgroup.code,
                  label: `${subgroup.name} (${subgroup.code})`,
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
            >
              {editingYear ? "Update" : "Add"}
            </GoldButton>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Years;
