import React from "react";
import { Button } from "antd";
import { generateTimetable } from "./timetable.api";
import { useDispatch, useSelector } from "react-redux";

export default function Generate() {
  const { timetable } = useSelector((state) => state.timetable);

  const dispatch = useDispatch();

  const genTimetable = () => {
    dispatch(generateTimetable());
    console.log("Generating timetable");
  };

  return (
    <div className="bg-white p-6 rounded-xl  max-w-4xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
        Generate Timetable
      </h2>
      <Button className="text-center" onClick={genTimetable}>
        Generate
      </Button>
    </div>
  );
}
