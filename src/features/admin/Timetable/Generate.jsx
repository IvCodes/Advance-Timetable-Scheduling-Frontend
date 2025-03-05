import React, { useState, useEffect } from "react";
import { Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { generateTimetable } from "./timetable.api";
import { useDispatch, useSelector } from "react-redux";

export default function Generate() {
  const { timetable, generating } = useSelector((state) => state.timetable);

  const dispatch = useDispatch();

  const genTimetable = () => {
    dispatch(generateTimetable());
    console.log("Generating timetable");
  };

  const targetText = "Generating Timetable...";
  const randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const [displayedText, setDisplayedText] = useState(
    Array(targetText.length).fill(" ")
  );
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

  useEffect(() => {
    if (currentLetterIndex >= targetText.length) {
      setCurrentLetterIndex(0);
      setDisplayedText(Array(targetText.length).fill(" "));
    }

    const interval = setInterval(() => {
      setDisplayedText((prev) => {
        const updatedText = [...prev];
        updatedText[currentLetterIndex] =
          randomChars[Math.floor(Math.random() * randomChars.length)];
        return updatedText;
      });
    }, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setDisplayedText((prev) => {
        const updatedText = [...prev];
        updatedText[currentLetterIndex] = targetText[currentLetterIndex];
        return updatedText;
      });
      setCurrentLetterIndex((prev) => prev + 1);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentLetterIndex, generating]);

  return (
    <div className="bg-white p-6 rounded-xl  max-w-4xl mx-auto text-center">
      <h2 className="text-2xl font-semibold mb-6 text-center text-gold-dark">
        Generate Timetable
      </h2>
      {!generating && (
        <Button className="text-center" onClick={genTimetable}>
          Generate
        </Button>
      )}
      {generating && (
        <div
          style={{
            fontSize: "15px",
            fontFamily: "monospace",
            textAlign: "center",
          }}
        >
          {displayedText.join("")}
        </div>
      )}
    </div>
  );
}
