import React, { useState, useEffect } from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import axios from "axios";

// Custom theme for the chatbot
const theme = {
  background: "#f5f8fb",
  fontFamily: "Arial, Helvetica, sans-serif",
  headerBgColor: "#00bfff",
  headerFontColor: "#fff",
  headerFontSize: "18px",
  botBubbleColor: "#00bfff",
  botFontColor: "#fff",
  userBubbleColor: "#fff",
  userFontColor: "#4a4a4a",
};

// Custom component to process the user's query
const ProcessQuery = ({ steps, triggerNextStep }) => {
  const [loading, setLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState("");
  const queryText = steps.userInput.value;

  useEffect(() => {
    const queryData = {
      input: {
        language: "en",
        text: queryText,
        audienceType: "citizen",
      },
      output: {
        format: "text",
      },
    };

    axios
      .post("http://20.244.97.59:8000/v1/query", queryData)
      .then((response) => {
        const result = response.data.output.text;
        setResponseMessage(result);
        setLoading(false);
        triggerNextStep();
      })
      .catch((error) => {
        setResponseMessage("There was an error processing your request.");
        setLoading(false);
        triggerNextStep();
      });
  }, [queryText, triggerNextStep]);

  return <div>{loading ? "Processing your query..." : responseMessage}</div>;
};

// Updated steps array
const steps = [
  {
    id: "1",
    message:
      "Johar 🙏 , I'm UDDP ChatBot and I am here to help you regarding information about the Resident Portal as well as any scheme related query.",
    trigger: "2",
  },
  {
    id: "2",
    message:
      "I can assist you in finding government schemes that you may be eligible for based on your demographic and socio-economic information.",
    trigger: "3",
  },
  {
    id: "3",
    message: "To begin, kindly choose from below options:",
    trigger: "4",
  },
  {
    id: "4",
    options: [
      {
        value: 1,
        label: "Click here to know your scheme eligibility by typing a query",
        trigger: "5",
      },
      {
        value: 2,
        label:
          "Click here to know your scheme eligibility by providing your eligibility criteria",
        trigger: "6",
      },
      {
        value: 3,
        label: "Click here for general queries related to portal and schemes",
        trigger: "7",
      },
      {
        value: 4,
        label:
          "Discover your scheme eligibility by answering a few quick questions. Click here to get started!",
        trigger: "8",
      },
    ],
  },
  {
    id: "5",
    message:
      "You selected to know your scheme eligibility by typing a query. Please type your query below:",
    trigger: "userInput",
  },
  {
    id: "userInput",
    user: true,
    trigger: "processQuery",
  },
  {
    id: "processQuery",
    component: <ProcessQuery />,

    trigger: "continuePrompt",
  },
  {
    id: "responseMessage",
    message: ({ previousValue }) => previousValue,
    trigger: "continuePrompt",
  },
  {
    id: "continuePrompt",
    message: "Do you want to continue or go to the main menu?",
    trigger: "continueOptions",
  },
  {
    id: "continueOptions",
    options: [
      { value: "continue", label: "Continue", trigger: "userInput" },
      { value: "mainMenu", label: "Main Menu", trigger: "3" },
    ],
  },
  {
    id: "6",
    message:
      "You selected to know your scheme eligibility by providing your eligibility criteria.",
    end: true,
  },
  {
    id: "7",
    message:
      "You selected to ask general queries related to the portal and schemes.",
    end: true,
  },
  {
    id: "8",
    message:
      "You selected to discover your scheme eligibility by answering a few quick questions.",
    end: true,
  },
];

// Main ChatBot component
const UDDPChatBot = () => (
  <ThemeProvider theme={theme}>
    <ChatBot
      steps={steps}
      bubbleOptionStyle={{ backgroundColor: "white", color: "black" }}
      floating={true}
    />
  </ThemeProvider>
);

export default UDDPChatBot;
