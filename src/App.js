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
const queryUrl = "http://20.244.97.59:8000/v1/query";
const chatUrl = "http://20.244.97.59:8000/v1/chat";

const handleApiCall = async (url, body) => {
  try {
    const response = await axios.post(url, body);
    let message = response.data.output.text;

    if (typeof message !== "string") {
      console.error("API response text is not a string:", message);
      return "Sorry, I couldn't find any information.";
    }

    if (url === chatUrl) {
      message = message.replace(/Source:.*$/, "");
    }

    return message;
  } catch (error) {
    console.error("API call error:", error);
    return "Sorry, I couldn't find any information.";
  }
};

// Custom component to process the user's query for option 1
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

    handleApiCall(queryUrl, queryData).then((result) => {
      setResponseMessage(result);
      setLoading(false);
      triggerNextStep();
    });
  }, [queryText, triggerNextStep]);

  return <div>{loading ? "Processing your query..." : responseMessage}</div>;
};

// Custom component to process the user's query for option 3
const ProcessGeneralQuery = ({ steps, triggerNextStep }) => {
  const [loading, setLoading] = useState(true);
  const [responseMessage, setResponseMessage] = useState("");
  const queryText = steps.chatInput.value;

  useEffect(() => {
    const chatData = {
      input: {
        language: "en",
        text: queryText,
        context: "citizen",
      },
      output: {
        format: "text",
      },
    };

    handleApiCall(chatUrl, chatData).then((result) => {
      setResponseMessage(result);
      setLoading(false);
      triggerNextStep();
    });
  }, [queryText, triggerNextStep]);

  return <div>{loading ? "Processing your query..." : responseMessage}</div>;
};

// Updated steps array
const steps = [
  {
    id: "start",
    message: "Johar 🙏 ,To start kindly choose your Preferred Language:",
    trigger: "languageOptions",
  },
  {
    id: "languageOptions",
    options: [
      { value: "english", label: "English", trigger: "1" },
      { value: "हिन्दी", label: "हिन्दी", trigger: "1" },
    ],
  },
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
      // {
      //   value: 2,
      //   label:
      //     "Click here to know your scheme eligibility by providing your eligibility criteria",
      //   trigger: "6",
      // },
      {
        value: 3,
        label: "Click here for general queries related to portal and schemes",
        trigger: "7",
      },
      // {
      //   value: 4,
      //   label:
      //     "Discover your scheme eligibility by answering a few quick questions. Click here to get started!",
      //   trigger: "8",
      // },
    ],
  },
  {
    id: "5",
    message:
      "please type your query in the below input box. e.g - (I am 61 years old female construction worker belonging to scheduled caste category. what are my eligible schemes?)",
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
    // asMessage: true,
    trigger: "continueQuery",
  },
  {
    id: "responseMessage",
    message: ({ previousValue }) => previousValue,
    trigger: "continueQuery",
  },
  // {
  //   id: "6",
  //   message:
  //     "You selected to know your scheme eligibility by providing your eligibility criteria.",
  //   end: true,
  // },
  {
    id: "7",
    message:
      "please type your query in the below input box. e.g -\n1) What is maternity scheme\n2) what is eligible criteria of maternity\n3) I have 3 children. Am I eligible?",
    trigger: "chatInput",
  },
  {
    id: "chatInput",
    user: true,
    trigger: "processGeneralQuery",
  },
  {
    id: "processGeneralQuery",
    component: <ProcessGeneralQuery />,
    asMessage: true,
    trigger: "continueChat",
  },
  // {
  //   id: "8",
  //   message:
  //     "You selected to discover your scheme eligibility by answering a few quick questions.",
  //   end: true,
  // },
  {
    id: "continueQuery",
    message: "Do you want to continue or go to the main menu?",
    trigger: "queryOptions",
  },
  {
    id: "queryOptions",
    options: [
      { value: "continue", label: "Continue", trigger: "userInput" },
      { value: "mainMenu", label: "Main Menu", trigger: "3" },
      { value: "language", label: "language", trigger: "start" },
    ],
  },
  {
    id: "continueChat",
    message: "Do you want to continue or go to the main menu?",
    trigger: "chatOptions",
  },
  {
    id: "chatOptions",
    options: [
      { value: "continue", label: "Continue", trigger: "chatInput" },
      { value: "mainMenu", label: "Main Menu", trigger: "3" },
      { value: "language", label: "language", trigger: "start" },
    ],
  },
];

// Main ChatBot component
const UDDPChatBot = () => (
  <ThemeProvider theme={theme}>
    <ChatBot
      steps={steps}
      bubbleOptionStyle={{ backgroundColor: "white", color: "black" }}
      speechSynthesis={{ enable: true, lang: "hi" }}
      recognitionLang="hi"
      recognitionEnable={true}
      floating={true}
      width="400px"
      height="550px"
      headerTitle="UDDP chatbot"
    />
  </ThemeProvider>
);

export default UDDPChatBot;
