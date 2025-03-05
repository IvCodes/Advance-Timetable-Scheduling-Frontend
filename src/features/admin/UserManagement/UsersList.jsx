import React, { useState } from "react";
import { Table, Button, Modal, Popconfirm, ConfigProvider } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getUsers } from "./users.api";
import { render } from "react-dom";

const UsersList = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const dispatch = useDispatch();

  const { users, loading } = useSelector((state) => state.users);

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const showEditModal = (record) => {
    setEditingUser(record);
    setIsModalVisible(true);
  };

  const handleEditUser = () => {
    setIsModalVisible(false);
  };

  const handleDeleteUser = (key) => {
    setUsers(users.filter((user) => user.key !== key));
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <span>
          {record.first_name} {record.last_name}
        </span>
      ),
    },
    {
      title: "University ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex space-x-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => showEditModal(record)}
            style={{ backgroundColor: "var(--color-gold-dark)" }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDeleteUser(record.key)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="danger"
              icon={<DeleteOutlined />}
              style={{
                backgroundColor: "var(--color-gold-darkest)",
                borderColor: "var(--color-gold-darkest)",
                color: "var(--color-white)",
              }}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div>
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
          dataSource={users}
          columns={columns}
          pagination={true}
          bordered
          style={{
            backgroundColor: "transpoarent",
            borderColor: "var(--color-gold)",
          }}
        />
      </ConfigProvider>
      <Modal
        title="Edit User"
        open={isModalVisible}
        onOk={handleEditUser}
        onCancel={() => setIsModalVisible(false)}
        okButtonProps={{ style: { backgroundColor: "var(--color-gold)" } }}
        cancelButtonProps={{
          style: { backgroundColor: "var(--color-gold-darkest-2)" },
        }}
      >
        <p>Edit the user details here.</p>
      </Modal>
    </div>
  );
};

export default UsersList;
