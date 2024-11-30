import React from "react";
import { Button, ConfigProvider } from "antd";

function GoldButton({ children, onClick, loading = false, type = "primary" }) {
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            colorPrimary: "#D9A648",
            algorithm: true,
          },
        },
      }}
    >
      <Button
        type={type}
        onClick={onClick}
        loading={loading}
        className="w-full"
      >
        {children}
      </Button>
    </ConfigProvider>
  );
}

export default GoldButton;