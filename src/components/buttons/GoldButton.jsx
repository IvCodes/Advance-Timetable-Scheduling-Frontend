import React from "react";
import { Button } from "antd";
import { ConfigProvider } from "antd";

function GoldButton({ children, onClick, disabled, bgColor, htmlType, style, className }) {
  return (
    <ConfigProvider
      theme={{
        components: {
          Button: {
            // defaultHoverBorderColor: "#a6702e",
          },
        },
      }}
    >
      <Button
        style={{
          backgroundColor: bgColor || "#1D80E9",
          color: "white",
          fontWeight: "bold",
          fontFamily: "Archivo, Arial, Helvetica, sans-serif",
          letterSpacing: "1px",
          padding: "10px 20px",
          border: "none",
          ...style
        }}
        onClick={onClick}
        disabled={disabled}
        htmlType={htmlType}
        className={className}
      >
        {children}
      </Button>
    </ConfigProvider>
  );
}

export default GoldButton;
