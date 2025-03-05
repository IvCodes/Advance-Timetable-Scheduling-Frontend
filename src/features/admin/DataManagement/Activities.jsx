import React, { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  ConfigProvider,
  Button,
} from "antd";
import GoldButton from "../../../components/buttons/GoldButton";
import { Popconfirm } from "antd";
import { useSelector, useDispatch } from "react-redux";
import {
  getActivities,
  addActivity,
  updateActivity,
  deleteActivity,
  getTeachers,
} from "./data.api";
import { getYears } from "../../authentication/auth.api";
import { usePresence } from "framer-motion";

const Activities = () => {
  const activities = useSelector((state) => state.data.activities);
  const teachers = useSelector((state) => state.data.teachers);
  const years = useSelector((state) => state.auth.years);

  const dispatch = useDispatch();

  const [filteredActivities, setFilteredActivities] = useState(activities);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [subgroups, setSubgroups] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    dispatch(getActivities());
    dispatch(getTeachers());
    dispatch(getYears());
  }, [dispatch]);

  useEffect(() => {
    setFilteredActivities(activities);
  }, [activities]);

  useEffect(() => {
    if (years.length > 0) {
      const subgroupss = [];
      years.forEach((year) => {
        year.subgroups.forEach((subgroup) => {
          subgroupss.push({
            id: subgroup.code,
            name: `Year ${year.name}  - ${subgroup.name}`,
          });
        });
      });

      setSubgroups(subgroupss);
    }
  }, [years]);

  console.log(subgroups);

  const handleAddEditActivity = (values) => {
    if (editingActivity) {
      dispatch(updateActivity({ ...editingActivity, ...values }));
      message.success("Activity updated successfully!");
    } else {
      dispatch(addActivity(values));
      message.success("Activity added successfully!");
    }
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDeleteActivity = (key) => {
    dispatch(deleteActivity(key));
    message.success("Activity deleted successfully!");
  };

  const showAddEditModal = (activity = null) => {
    setEditingActivity(activity);
    setIsModalVisible(true);
    if (activity) {
      form.setFieldsValue(activity);
    } else {
      form.resetFields();
    }
  };

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Teachers",
      dataIndex: "teacher_ids",
      key: "teacher_ids",
      render: (_, record) =>
        record.teacher_ids.map((id) => {
          const teacher = teachers.find((teacher) => teacher.id === id);
          return (
            <span key={id}>
              {teacher?.id} -{teacher?.first_name} {teacher?.last_name}
            </span>
          );
        }),
    },
    {
      title: "Subgroups",
      dataIndex: "subgroup_ids",
      key: "subgroup_ids",
      render: (_, record) =>
        record.subgroup_ids.map((id) => {
          const subgroup = subgroups?.find((subgroup) => subgroup.id === id);
          return <span key={id}>{subgroup?.name}</span>;
        }),
    },
    {
      title: "Duration",
      dataIndex: "duration",
      key: "duration",
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
            title="Are you sure to delete this activity?"
            onConfirm={() => handleDeleteActivity(record.key)}
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
        Activities
      </h2>

      <div className="mb-4">
        <GoldButton onClick={() => showAddEditModal()}>Add Activity</GoldButton>
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
          dataSource={filteredActivities}
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
        title={editingActivity ? "Edit Activity" : "Add Activity"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEditActivity}>
          <Form.Item
            label="Code"
            name="code"
            rules={[
              { required: true, message: "Please enter a valid code" },
              {
                pattern: /^AC-\d{3}$/,
                message: "Code must match AC-XXX format",
              },
            ]}
          >
            <Input placeholder="Enter activity code (e.g., AC-001)" />
          </Form.Item>

          <Form.Item
            label="Subject"
            name="subject"
            rules={[{ required: true, message: "Please enter the subject" }]}
          >
            <Input placeholder="Enter subject name" />
          </Form.Item>

          <Form.Item
            label="Teachers"
            name="teacher_ids"
            rules={[
              { required: true, message: "Please select at least one teacher" },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select teachers"
              showSearch={true}
              options={teachers.map((teacher) => ({
                value: teacher.id,
                label:
                  teacher.id +
                  " - " +
                  teacher.first_name +
                  " " +
                  teacher.last_name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Subgroups"
            name="subgroup_ids"
            rules={[
              {
                required: true,
                message: "Please select at least one subgroup",
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Select subgroups"
              options={subgroups?.map((subgroup) => ({
                value: subgroup.id,
                label: subgroup.name,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Duration (Periods)"
            name="duration"
            rules={[
              { required: true, message: "Please enter duration in periods" },
              {
                type: "number",
                min: 1,
                message: "Duration must be at least 1 period",
              },
            ]}
          >
            <InputNumber placeholder="Enter duration" min={1} />
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
              {editingActivity ? "Update" : "Add"}
            </GoldButton>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Activities;
