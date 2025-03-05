import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  message,
  ConfigProvider,
  Checkbox,
  Spin,
} from "antd";
const { TextArea } = Input;
import GoldButton from "./../../../components/buttons/GoldButton";
import {
  getUniInfo,
  updateUniInfo,
  addDay,
  getDays,
  getPeriods,
  updatePeriods,
} from "./data.api";
import { useSelector, useDispatch } from "react-redux";

const daysOfWeek = [
  { label: "Monday", value: "Mon" },
  { label: "Tuesday", value: "Tue" },
  { label: "Wednesday", value: "Wed" },
  { label: "Thursday", value: "Thu" },
  { label: "Friday", value: "Fri" },
  { label: "Saturday", value: "Sat" },
  { label: "Sunday", value: "Sun" },
];

const Basic = () => {
  const { uniInfo, loading, error, days, periods } = useSelector(
    (state) => state.data
  );
  const initialData = {
    institution_name: "",
    description: "",
  };
  const [isEditing, setIsEditing] = useState(false);
  const [institutionData, setInstitutionData] = useState(initialData);
  const [selectedDays, setSelectedDays] = useState([]);
  const [isDaysModalVisible, setDaysModalVisible] = useState(false);
  const [isPeriodsModalVisible, setPeriodsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [localPeriods, setLocalPeriods] = useState([]);
  const [isChanged, setIsChanged] = useState(false);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUniInfo());
    dispatch(getDays());
    dispatch(getPeriods());
  }, [dispatch]);

  useEffect(() => {
    setInstitutionData(uniInfo);
  }, [uniInfo]);

  useEffect(() => {
    if (days?.length != 0) {
      const x = [];
      days.map((day) => {
        x.push(day.name);
      });

      setSelectedDays(x);
      console.log("days", selectedDays);
    }
  }, [days]);

  useEffect(() => {
    setLocalPeriods(periods.map((p, idx) => ({ ...p, key: "P" + p.name })));
  }, [periods]);

  const [form] = Form.useForm();

  const handleSaveDays = () => {
    console.log("selectedDays", selectedDays);
    const newDays = selectedDays.map((day, index) => ({
      key: days.length + index + 1,
      name: day,
      long_name: daysOfWeek.find((d) => d.value === day).label,
    }));
    dispatch(addDay(newDays));
    message.success("Days added successfully!");
    setDaysModalVisible(false);
    setSelectedDays([]);
  };

  const handleDaysChange = (selected) => {
    console.log("selected", selected);
    setSelectedDays(selected);
  };

  const handleAddRow = () => {
    const formatTime = (hour, minute) => {
      return `${hour.toString().padStart(2, "0")}.${minute
        .toString()
        .padStart(2, "0")}`;
    };

    const periodIndex = localPeriods.length;
    const baseHour = 8;
    const baseMinute = 30;

    var startHour = baseHour + Math.floor((baseMinute + periodIndex * 60) / 60);
    const startMinute = (baseMinute + periodIndex * 60) % 60;
    if (startHour > 23) {
      startHour -= 24;
    }
    var endHour =
      baseHour + Math.floor((baseMinute + periodIndex * 60 + 59) / 60);
    if (endHour > 23) {
      endHour -= 24;
    }
    const endMinute = (baseMinute + periodIndex * 60 + 59) % 60;

    const newPeriod = {
      name: `P${localPeriods.length + 1}`,
      long_name: `${formatTime(startHour, startMinute)} - ${formatTime(
        endHour,
        endMinute
      )}`,
      is_interval: false,
      key: localPeriods.length + 1,
    };

    setLocalPeriods([...localPeriods, newPeriod]);
    setIsChanged(true);
  };

  const handleRemoveRow = () => {
    if (localPeriods.length > 0) {
      setLocalPeriods(localPeriods.slice(0, -1));
      setIsChanged(true);
    }
  };

  const handleInputChange = (key, field, value) => {
    const updatedPeriods = localPeriods.map((period) =>
      period.key === key ? { ...period, [field]: value } : period
    );
    setLocalPeriods(updatedPeriods);
    setIsChanged(true);
  };

  const handleSaveP = () => {
    const validPeriods = localPeriods.map(({ key, ...rest }) => rest);
    dispatch(updatePeriods(validPeriods));
    message.success("Periods updated successfully!");
    setIsChanged(false);
  };

  const columnsDays = [
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
  ];

  const columnsPeriods = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => <span>{text}</span>,
    },
    {
      title: "Long Name",
      dataIndex: "long_name",
      key: "long_name",
      render: (text, record) => <span>{text}</span>,
    },
    {
      title: "Interval",
      dataIndex: "is_interval",
      key: "is_interval",
      render: (checked, record) => (
        <Checkbox
          checked={checked}
          onChange={(e) =>
            handleInputChange(record.key, "is_interval", e.target.checked)
          }
        />
      ),
    },
  ];

  const handleEdit = () => {
    setIsEditing(true);
    form.setFieldsValue(institutionData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    form.resetFields();
  };

  const handleSave = (values) => {
    setInstitutionData(values);
    dispatch(updateUniInfo(values));
    setIsEditing(false);
    message.success("Institution data updated successfully!");
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
        Institution Basic Information
      </h2>

      {isEditing ? (
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label={<span className="text-gwhite">Institution Name</span>}
            name="institution_name"
            style={{ color: "white" }}
            rules={[
              { required: true, message: "Please enter institution name" },
              {
                pattern: /^[a-zA-Z0-9\s]+$/,
                message:
                  "Institution name can only contain letters and numbers",
              },
            ]}
          >
            <Input placeholder="Enter institution name" />
          </Form.Item>

          <Form.Item
            label={<span className="text-gwhite">Description</span>}
            name="description"
          >
            <TextArea rows={4} placeholder="Enter Description" />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-end gap-2">
              <Button onClick={handleCancel} className="bg-gray-200">
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  backgroundColor: "var(--color-gold-dark)",
                  borderColor: "var(--color-gold-dark)",
                }}
              >
                Save
              </Button>
            </div>
          </Form.Item>
        </Form>
      ) : (
        <div>
          <div>
            <p className="text-gold-darker font-thin text-sm">
              Institution Name
            </p>{" "}
            <div className="text-2xl mb-4">
              {institutionData?.institution_name}
            </div>
          </div>
          <div className="mb-6">
            <p className="text-gold-darker font-thin text-sm">Description</p>{" "}
            <div className="text-lgl mb-4">{institutionData?.description}</div>
          </div>
          <GoldButton
            type="primary"
            onClick={handleEdit}
            style={{
              backgroundColor: "var(--color-gold-dark)",
              borderColor: "var(--color-gold-dark)",
              marginTop: "20px",
            }}
          >
            Edit
          </GoldButton>
        </div>
      )}
      <h2 className=" mt-14 text-2xl font-semibold mb-6 text-center text-gold-dark">
        Institution Days & Periods
      </h2>

      <div className="bg-white p-6 rounded-xl shadow-md max-w-2xl mx-auto">
        <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
          Institution Days
        </h2>

        <div className="mb-8">
          <Button type="primary" onClick={() => setDaysModalVisible(true)}>
            Add Days
          </Button>
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
              className="mt-4"
              columns={columnsDays}
              dataSource={days}
              rowKey="key"
              pagination={false}
              bordered
            />
          </ConfigProvider>
        </div>

        <Modal
          title="Select Days"
          open={isDaysModalVisible}
          onCancel={() => setDaysModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setDaysModalVisible(false)}>
              Cancel
            </Button>,
            <Button
              key="save"
              type="primary"
              onClick={handleSaveDays}
              disabled={selectedDays.length === 0}
            >
              Save
            </Button>,
          ]}
        >
          <Form>
            <Form.Item label="Select Days">
              <Checkbox.Group
                options={daysOfWeek}
                value={selectedDays}
                onChange={handleDaysChange}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
          Institution Periods
        </h2>
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
            columns={columnsPeriods}
            dataSource={localPeriods}
            rowKey="key"
            pagination={false}
            bordered
            style={{ marginBottom: "16px" }}
          />
        </ConfigProvider>
        <div className="flex justify-between">
          <div>
            <Button
              onClick={handleAddRow}
              style={{
                borderColor: "var(--color-gold-dark)",
              }}
            >
              + Add Period
            </Button>
            <Button
              onClick={handleRemoveRow}
              disabled={localPeriods.length === 0}
              style={{
                backgroundColor: `${
                  localPeriods.length === 0 ? "transparent" : ""
                }`,
                borderColor: "transparent",
                marginLeft: "20px",
              }}
            >
              - Remove Period
            </Button>
          </div>
          <Button
            type="primary"
            onClick={handleSaveP}
            disabled={!isChanged}
            style={{
              backgroundColor: "var(--color-gold-dark)",
              borderColor: "var(--color-gold-dark)",
            }}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Basic;
