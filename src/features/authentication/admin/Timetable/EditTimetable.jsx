import React, { useState, useEffect } from "react";
import { Modal, Form, Select, InputNumber, message } from "antd";
import { useSelector } from "react-redux";

const EditTimetableModal = ({
  visible,
  onCancel,
  onSubmit,
  initialData,
  timetableId,
  algorithm,
}) => {
  const [form] = Form.useForm();
  const { days, periods, subjects, teachers, spaces } = useSelector(
    (state) => state.data
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && initialData) {
      // Convert subgroup to array if it's not already
      const subgroupValue = Array.isArray(initialData.subgroup)
        ? initialData.subgroup
        : initialData.subgroup
        ? [initialData.subgroup]
        : [];

      form.setFieldsValue({
        subgroup: subgroupValue,
        subject: initialData.subject,
        teacher: initialData.teacher,
        room: initialData.room, // Direct string value
        day: initialData.day, // Direct string value
        period: initialData.period, // Array of period names
        duration: initialData.duration,
      });
    }
  }, [visible, initialData, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      // Find full objects from the selected values
      const selectedDay = days.find((d) => d.name === values.day);
      const selectedRoom = spaces.find((s) => s.name === values.room);
      const selectedPeriods = periods.filter((p) =>
        values.period.includes(p.name)
      );
      const selectedTeacher = teachers.find((t) => t.id === values.teacher);

      const updatedActivity = {
        subgroup: values.subgroup, // Now it will be an array of subgroups
        activity_id: initialData.activity_id,
        session_id: initialData.session_id,
        day: {
          _id: selectedDay?._id,
          name: selectedDay?.name,
          long_name: selectedDay?.long_name,
        },
        period: selectedPeriods.map((p) => ({
          _id: p?._id,
          name: p?.name,
          long_name: p?.long_name,
          is_interval: p?.is_interval,
        })),
        room: {
          _id: selectedRoom?._id,
          name: selectedRoom?.name,
          long_name: selectedRoom?.long_name,
          code: selectedRoom?.code,
          capacity: selectedRoom?.capacity,
        },
        teacher: selectedTeacher?.id,
        duration: values.duration,
        subject: values.subject,
      };

      onSubmit(updatedActivity); // Pass the updated activity to the parent
    } catch (error) {
      console.error("Error updating timetable:", error);
      message.error("Failed to update timetable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Edit Timetable Entry"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      width={600}
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="subgroup"
          label="Subgroups"
          rules={[{ required: true }]}
        >
          <Select mode="multiple" placeholder="Select subgroups" disabled>
            {[
              "SEM101",
              "SEM102",
              "SEM201",
              "SEM202",
              "SEM301",
              "SEM302",
              "SEM401",
              "SEM402",
            ].map((sg) => (
              <Select.Option key={sg} value={sg}>
                {sg}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
          <Select>
            {subjects?.map((subject) => (
              <Select.Option key={subject.code} value={subject.code}>
                {subject.long_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="teacher" label="Teacher" rules={[{ required: true }]}>
          <Select>
            {teachers?.map((teacher) => (
              <Select.Option key={teacher.id} value={teacher.id}>
                {`${teacher.first_name} ${teacher.last_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="room" label="Room" rules={[{ required: true }]}>
          <Select>
            {spaces?.map((room) => (
              <Select.Option key={room.name} value={room.name}>
                {`${room.long_name} (${room.code})`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="day" label="Day" rules={[{ required: true }]}>
          <Select>
            {days?.map((day) => (
              <Select.Option key={day.name} value={day.name}>
                {day.long_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="period" label="Periods" rules={[{ required: true }]}>
          <Select mode="multiple">
            {periods?.map((period) => (
              <Select.Option key={period.name} value={period.name}>
                {period.long_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="duration"
          label="Duration (hours)"
          rules={[{ required: true }]}
        >
          <InputNumber min={1} max={6} disabled />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditTimetableModal;
