import React, { useState } from "react";
import { Table, ConfigProvider, Button } from "antd";
import GoldButton from "../../../components/buttons/GoldButton";

const ConstraintsList = () => {
  const permanentConstraint = {
    key: 1,
    name: "Basic Time Constraints",
    weight: "100%",
    description: `These are the basic compulsory constraints (referring to time allocation) for any timetable. 
    The basic time constraints try to avoid:
    - Teachers assigned to more than one activity simultaneously
    - Students assigned to more than one activity simultaneously`,
    isPermanent: true,
  };

  const [constraints, setConstraints] = useState([
    permanentConstraint,
    {
      key: 2,
      name: "Room Availability",
      weight: "80%",
      description: "Ensures that rooms are available during allocated times.",
      isPermanent: false,
    },
    {
      key: 3,
      name: "Teacher Preferences",
      weight: "60%",
      description: "Tries to assign teachers to their preferred time slots.",
      isPermanent: false,
    },
    {
      key: 4,
      name: "Student Grouping",
      weight: "75%",
      description: "Groups students to avoid overlaps in their timetables.",
      isPermanent: false,
    },
  ]);

  const columns = [
    {
      title: "Constraint Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Weight",
      dataIndex: "weight",
      key: "weight",
      sorter: (a, b) => parseInt(a.weight) - parseInt(b.weight),
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
        <div className="min-w-52">
          {record.isPermanent ? (
            <span className="text-gray-500">Permanent</span>
          ) : (
            <div>
              <Button type="link" onClick={() => handleEdit(record)} className>
                Edit
              </Button>
              <Button
                type="link"
                danger
                onClick={() => handleDelete(record.key)}
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleEdit = (constraint) => {
    console.log("Edit Constraint:", constraint);
  };

  const handleDelete = (key) => {
    setConstraints(constraints.filter((constraint) => constraint.key !== key));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-7xl mx-auto">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
        Constraints List
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
    </div>
  );
};

export default ConstraintsList;
