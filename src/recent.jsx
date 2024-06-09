import React, { useState, useEffect } from "react";
import ChatBot from "react-simple-chatbot";
import { ThemeProvider } from "styled-components";
import axios from "axios";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
const App = () => {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState("hi");
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);
  const handleLanguageSelection = (lang) => {
    setLanguage(lang);
    console.log(lang);
    i18n.changeLanguage(lang);
    setIsLanguageSelected(true);
  };
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
          language: language,
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
          language: language,
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
      message: t("chooseLanguage"),
      trigger: "languageOptions",
    },
    {
      id: "languageOptions",
      options: [
        {
          value: "en",
          label: "English",
          trigger: () => {
            handleLanguageSelection("en");
            return "1";
          },
        },
        {
          value: "hi",
          label: "हिन्दी",
          trigger: () => {
            handleLanguageSelection("hi");
            return "1";
          },
        },
      ],
    },
    {
      id: "1",
      message: t("welcome"),
      trigger: "2",
    },
    {
      id: "2",
      message: t("assist"),
      trigger: "3",
    },
    {
      id: "3",
      message: t("options"),
      trigger: "4",
    },
    {
      id: "4",
      options: [
        {
          value: 1,
          label: t("option1"),
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
          label: t("option3"),
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
      message: t("typeQuery"),
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
      message: t("generalQuery"),
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
      message: t("restart"),
      trigger: "queryOptions",
    },
    {
      id: "queryOptions",
      options: [
        { value: t("continue"), label: t("continue"), trigger: "userInput" },
        { value: t("menu"), label: t("menu"), trigger: "3" },
        { value: t("lang"), label: t("lang"), trigger: "start" },
      ],
    },
    {
      id: "continueChat",
      message: t("restart"),
      trigger: "chatOptions",
    },
    {
      id: "chatOptions",
      options: [
        { value: t("continue"), label: t("continue"), trigger: "userInput" },
        { value: t("menu"), label: t("menu"), trigger: "3" },
        { value: t("lang"), label: t("lang"), trigger: "start" },
      ],
    },
  ];

  // Main ChatBot component

  return (
    <ThemeProvider theme={theme}>
      <ChatBot
        steps={steps}
        bubbleOptionStyle={{ backgroundColor: "white", color: "black" }}
        // speechSynthesis={{ enable: true, lang: "hi" }}
        recognitionLang={language}
        recognitionEnable={true}
        floating={true}
        width="400px"
        height="550px"
        headerTitle="UDDP chatbot"
        language={language}
        setLanguage={handleLanguageSelection}
      />
    </ThemeProvider>
  );
};

export default App;
