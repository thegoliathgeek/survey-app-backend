const parseImageUrl = (url: string) => {
  const splitUrl = url.split("/");
  return {
    name: splitUrl[splitUrl.length - 1],
    imageLink: url,
    value: splitUrl[splitUrl.length - 1],
  };
};

export const getSurveyJson = (imageUrls: string[]) => {
  return {
    title: "Survery App",
    logoPosition: "left",
    focusFirstQuestionAutomatic: false,
    pages: [
      {
        name: "page1",
        elements: [
          {
            type: "imagepicker",
            name: "animals",
            title: "Which animals would you like to see in real life?",
            description: "Please select all that apply.",
            isRequired: true,
            choices: imageUrls.map((url) => parseImageUrl(url)),
            showLabel: true,
            multiSelect: true,
            fullWidth: true,
          },
        ],
      },
      {
        name: "page2",
        elements: [
          {
            type: "rating",
            name: "nps-score",
            title: {
              default: "How was your experience with UI today?",
            },
            rateCount: 11,
            rateMin: 0,
            rateMax: 10,
            minRateDescription: {
              default: "Very unlikely",
            },
            maxRateDescription: {
              default: "Very likely",
            },
          },
        ],
      },
    ],
    showQuestionNumbers: "off",
  };
};
