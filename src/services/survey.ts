const parseImageUrl = (url: string) => {
  const splitUrl = url.split("/");
  return {
    name: splitUrl[splitUrl.length - 1],
    imageLink: url,
    value: splitUrl[splitUrl.length - 1],
  };
};

export type SurveyJson = {
  name: string;
  elements: {
    type: string;
    name: string;
    title: string;
    description: string;
    isRequired: boolean;
    choices: {
      name: string;
      imageLink: string;
      value: string;
    }[];
    showLabel: boolean;
    multiSelect: boolean;
    fullWidth: boolean;
  }[];
  maxImageWidth?: number;
  maxImageHeight?: number;
}[];

export const getSurveyJson = (imageUrls: string[], pagesCount = 25) => {
  // get title , description and name from db

  // loop to create 25 pages for given data

  let questionPages: SurveyJson = [];
  let imageIndex = 0;

  for (let i = 0; i < pagesCount; i++) {
    questionPages.push({
      name: `page${i}`,
      elements: [
        {
          type: "imagepicker",
          name: `animals${i}`,
          title: "Which animals would you like to see in real life?",
          description: "Please select all that apply.",
          isRequired: true,
          choices: imageUrls
            .slice(imageIndex, imageIndex + 24)
            .map((url) => parseImageUrl(url)),
          showLabel: true,
          multiSelect: true,
          fullWidth: true,
        },
      ],
    });

    if (imageIndex + 24 > imageUrls.length) {
      imageIndex = 0;
    } else {
      imageIndex += 24;
    }
  }

  return {
    title: "Survery App",
    logoPosition: "left",
    showProgressBar: "bottom",
    focusFirstQuestionAutomatic: false,
    pages: [
      ...questionPages,
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
  };
};
