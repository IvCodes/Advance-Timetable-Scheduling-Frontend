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
  const [filteredTeachers, setFilteredTeachers] = useState([]);

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

      // Initialize filtered teachers based on the selected subject
      const selectedSubject = initialData.subject;
      filterTeachersBySubject(selectedSubject);
    }
  }, [visible, initialData, form, teachers]);

  // Function to filter teachers by subject
  const filterTeachersBySubject = (subjectCode) => {
    if (!subjectCode || !teachers) {
      setFilteredTeachers([]);
      return;
    }

    const filtered = teachers.filter(
      (teacher) => teacher.subjects && teacher.subjects.includes(subjectCode)
    );
    setFilteredTeachers(filtered);
  };

  // Handle subject change
  const handleSubjectChange = (value) => {
    filterTeachersBySubject(value);
    // Clear teacher selection if current teacher doesn't teach the new subject
    const currentTeacher = form.getFieldValue("teacher");
    const teacherStillValid = filteredTeachers.some(
      (t) => t.id === currentTeacher
    );

    if (!teacherStillValid) {
      form.setFieldsValue({ teacher: undefined });
    }
  };

  // Validate that the number of periods matches the duration
  const validatePeriods = (_, value) => {
    const duration = form.getFieldValue("duration");
    if (!value || !duration) {
      return Promise.resolve();
    }

    if (value.length !== duration) {
      return Promise.reject(
        new Error(
          `Please select exactly ${duration} periods to match the duration`
        )
      );
    }

    return Promise.resolve();
  };

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
          <Select
            mode="multiple"
            placeholder="Select subgroups"
            disabled
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
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
          <Select
            disabled
            showSearch
            optionFilterProp="children"
            onChange={handleSubjectChange}
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {subjects?.map((subject) => (
              <Select.Option key={subject.code} value={subject.code}>
                {subject.long_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="teacher" label="Teacher" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {filteredTeachers.map((teacher) => (
              <Select.Option key={teacher.id} value={teacher.id}>
                {`${teacher.first_name} ${teacher.last_name}`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="room" label="Room" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {spaces?.map((room) => (
              <Select.Option key={room.name} value={room.name}>
                {`${room.long_name} (${room.code})`}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item name="day" label="Day" rules={[{ required: true }]}>
          <Select
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {days?.map((day) => (
              <Select.Option key={day.name} value={day.name}>
                {day.long_name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="period"
          label="Periods"
          rules={[
            { required: true, message: "Please select periods" },
            { validator: validatePeriods },
          ]}
        >
          <Select
            mode="multiple"
            placeholder="Select time periods"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
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
