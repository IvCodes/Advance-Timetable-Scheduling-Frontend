import React from "react";
import { Modal, Typography, Collapse, Tag, List, Space, Divider } from "antd";
import {
  ClockCircleOutlined,
  EnvironmentOutlined,
  WarningOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const ConflictDetailsModal = ({ visible, onClose, conflicts }) => {
  if (!conflicts || conflicts.length === 0) {
    return null;
  }

  const getConflictIcon = (type) => {
    switch (type) {
      case "room_conflict":
        return <EnvironmentOutlined style={{ color: "#f5222d" }} />;
      case "teacher_conflict":
        return <WarningOutlined style={{ color: "#fa8c16" }} />;
      case "time_conflict":
        return <ClockCircleOutlined style={{ color: "#faad14" }} />;
      default:
        return <WarningOutlined style={{ color: "#ff4d4f" }} />;
    }
  };

  const getConflictColor = (type) => {
    switch (type) {
      case "room_conflict":
        return "#f5222d";
      case "teacher_conflict":
        return "#fa8c16";
      case "time_conflict":
        return "#faad14";
      default:
        return "#ff4d4f";
    }
  };

  return (
    <Modal
      title={
        <Space>
          <WarningOutlined style={{ color: "#ff4d4f" }} />
          <span>Scheduling Conflicts Detected</span>
        </Space>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <div className="conflict-details">
        <Text
          type="secondary"
          style={{ marginBottom: "16px", display: "block" }}
        >
          The following conflicts were detected with your timetable changes:
        </Text>

        <Collapse defaultActiveKey={["0"]}>
          {conflicts.map((conflict, index) => (
            <Panel
              key={index}
              header={
                <Space>
                  {getConflictIcon(conflict.type)}
                  <Text strong>{conflict.description}</Text>
                </Space>
              }
              style={{ marginBottom: 16 }}
            >
              <div style={{ padding: "8px 0" }}>
                <Space direction="vertical" style={{ width: "100%" }}>
                  <div>
                    <Text strong>Day:</Text> <Tag>{conflict.details?.day}</Tag>
                  </div>

                  <div>
                    <Text strong>Periods:</Text>{" "}
                    {conflict.details?.periods.map((period, i) => (
                      <Tag key={i} color="blue">
                        {period}
                      </Tag>
                    ))}
                  </div>

                  <Divider orientation="left" plain>
                    Conflicting Activities
                  </Divider>

                  <List
                    bordered
                    dataSource={conflict.details?.activities || []}
                    renderItem={(activity, i) => (
                      <List.Item>
                        <Space direction="vertical" style={{ width: "100%" }}>
                          <Text>
                            <Text strong>Subject:</Text> {activity.subject}
                          </Text>
                          <Text>
                            <Text strong>Activity ID:</Text>{" "}
                            {activity.activity_id}
                          </Text>
                        </Space>
                      </List.Item>
                    )}
                  />
                </Space>
              </div>
            </Panel>
          ))}
        </Collapse>

        <div style={{ marginTop: 16 }}>
          <Text type="secondary">
            Please resolve these conflicts before saving your changes.
          </Text>
        </div>
      </div>
    </Modal>
  );
};

export default ConflictDetailsModal;
