import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  message,
  ConfigProvider,
  Checkbox,
} from "antd";
const { TextArea } = Input;
import GoldButton from "./../../../components/buttons/GoldButton";
import {
  getUniInfo,
  updateUniInfo,
  addDay,
  getDays,
  getPeriods,
  updatePeriods,
} from "./data.api";
import { useSelector, useDispatch } from "react-redux";

