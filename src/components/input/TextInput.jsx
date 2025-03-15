import React from "react";
import { Input, ConfigProvider } from "antd";

function TextInput({
  type = "text",
  id,
  placeholder,
  required = false,
  style = {},
  onChange,
}) {
  return (
    <ConfigProvider
      theme={{
        components: {
          Input: {
            activeBorderColor: "#D9A648",
            hoverBorderColor: "#D9A648",
          },
        },
      }}
    >
      <Input
        onChange={onChange}
        style={style}
        type={type}
        id={id}
        placeholder={placeholder}
        required={required}
        className="mt-1 block w-full p-2 border border-gray-300 rounded-md text-gblack"
      />
    </ConfigProvider>
  );
}

export default TextInput;
