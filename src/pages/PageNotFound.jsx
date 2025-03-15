import React from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";

function PageNotFound() {
  return (
    <div>
      <h1>404 - Not Found!</h1>
      <Link to="/">
        <Button type="primary">Go Home</Button>
      </Link>
    </div>
  );
}

export default PageNotFound;
