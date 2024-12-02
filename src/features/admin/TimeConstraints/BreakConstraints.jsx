import React, { useState } from "react";
import { Table, Modal, Button, Checkbox, ConfigProvider, Input } from "antd";
import GoldButton from "../../../components/buttons/GoldButton";

const BreakConstraints = () => {
  const [constraints, setConstraints] = useState([
    {
      key: 1,
      name: "Morning Break",
      description: "Break between 2nd and 3rd period on Mondays and Wednesdays",
      weight: 50,
      breaks: [
        [false, true, false, false, false],
        [false, false, false, false, false],
        [false, true, false, false, false],
        [false, false, false, false, false],
        [false, false, false, false, false],
      ],
    },
    {
      key: 2,
      name: "Lunch Break",
      description: "Break after 4th period on all days",
      weight: 100,
      breaks: [
        [false, false, false, true, false],
        [false, false, false, true, false],
        [false, false, false, true, false],
        [false, false, false, true, false],
        [false, false, false, true, false],
      ],
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingConstraint, setEditingConstraint] = useState(null);
  const [modalName, setModalName] = useState("");
  const [modalWeight, setModalWeight] = useState(100);
  const [selectedBreaks, setSelectedBreaks] = useState([]);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const periods = [
    "Period 1",
    "Period 2",
    "Period 3",
    "Period 4",
    "Period 5",
    "Period 6",
    "Period 7",
  ];

  const showModal = (constraint = null) => {
    if (constraint) {
      setEditingConstraint(constraint.key);
      setModalName(constraint.name);
      setModalWeight(constraint.weight);
      setSelectedBreaks([...constraint.breaks]);
    } else {
      setEditingConstraint(null);
      setModalName("");
      setModalWeight(100);
      setSelectedBreaks(
        Array(periods.length)
          .fill(null)
          .map(() => Array(days.length).fill(false))
      );
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleBreakToggle = (periodIndex, dayIndex) => {
    const updatedBreaks = [...selectedBreaks];
    updatedBreaks[periodIndex][dayIndex] =
      !updatedBreaks[periodIndex][dayIndex];
    setSelectedBreaks(updatedBreaks);
  };

  const columns = [
    {
      title: "Break Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
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
        <div>
          <Button type="link" onClick={() => showModal(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record.key)}>
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const handleDelete = (key) => {
    setConstraints(constraints.filter((constraint) => constraint.key !== key));
  };

  const handleAddOrUpdateConstraint = () => {
    if (editingConstraint) {
      const updatedConstraints = constraints.map((constraint) =>
        constraint.key === editingConstraint
          ? {
              ...constraint,
              name: modalName,
              weight: modalWeight,
              breaks: selectedBreaks,
            }
          : constraint
      );
      setConstraints(updatedConstraints);
    } else {
      const newConstraint = {
        key: constraints.length + 1,
        name: modalName,
        description: `Break constraint with ${modalWeight}% weight`,
        weight: modalWeight,
        breaks: selectedBreaks,
      };
      setConstraints([...constraints, newConstraint]);
    }
    setIsModalVisible(false);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
        Break Constraints
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
          columns={columns}
          dataSource={constraints}
          rowKey="key"
          pagination={{ pageSize: 5 }}
          bordered
          style={{
            backgroundColor: "transparent",
            borderColor: "var(--color-gold)",
          }}
        />
      </ConfigProvider>

      <GoldButton onClick={() => showModal()} style={{ marginTop: "20px" }}>
        Add Break Constraint
      </GoldButton>

      <Modal
        title={
          editingConstraint ? "Edit Break Constraint" : "Add Break Constraint"
        }
        visible={isModalVisible}
        onCancel={handleCancel}
        onOk={handleAddOrUpdateConstraint}
      >
        <Input
          placeholder="Enter break name"
          value={modalName}
          onChange={(e) => setModalName(e.target.value)}
          className="mb-4"
          required={true}
        />
        <Input
          type="number"
          placeholder="Enter weight (%)"
          value={modalWeight}
          onChange={(e) => setModalWeight(e.target.value)}
          className="mb-4"
          required={true}
        />

        <h3 className="text-lg font-semibold mb-4">Select Breaks</h3>

        <table className="table-auto w-full text-center mb-6">
          <thead>
            <tr>
              <th></th>
              {days.map((day, index) => (
                <th key={index} className="p-2">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period, periodIndex) => (
              <tr key={periodIndex}>
                <td className="p-2">{period}</td>
                {days.map((_, dayIndex) => (
                  <td key={dayIndex} className="p-2">
                    <Checkbox
                      checked={selectedBreaks[periodIndex]?.[dayIndex] || false}
                      onChange={() => handleBreakToggle(periodIndex, dayIndex)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Modal>
    </div>
  );
};

export default BreakConstraints;
