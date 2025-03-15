import React from "react";
import { Table, ConfigProvider } from "antd";

function FacultyTable({ columns, filteredFaculties, loading }) {
  return (
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
        columns={columns || []}
        dataSource={filteredFaculties || []}
        rowKey="key"
        pagination={{ pageSize: 10 }}
        bordered
        style={{
          backgroundColor: "transparent",
          borderColor: "var(--color-gold)",
        }}
      />
    </ConfigProvider>
  );
}

export default FacultyTable;
