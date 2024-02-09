import { getQuestion } from "../helper/question";

const parseImageUrl = (url: string) => {
  const splitUrl = url.split("/");
  return {
    name: "",
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

export const getSurveyJson = (imageUrls: string[], pagesCount = 20) => {
  const IMAGE_COUNT = 20;
  // get title , description and name from db

  // loop to create 20 pages for given data

  let questionPages: SurveyJson = [];
  let imageIndex = 0;

  for (let i = 0; i < pagesCount; i++) {
    questionPages.push({
      name: `page${i + 1}`,
      elements: [
        {
          type: "imagepicker",
          name: `page${i + 1}`,
          title: getQuestion(),
          description: "You can select multiple images",
          isRequired: false,
          choices: imageUrls
            .slice(imageIndex, imageIndex + IMAGE_COUNT)
            .map((url) => parseImageUrl(url)),
          showLabel: true,
          multiSelect: true,
          fullWidth: true,
        },
      ],
    });

    if (imageIndex + IMAGE_COUNT > imageUrls.length) {
      imageIndex = 0;
    } else {
      imageIndex += IMAGE_COUNT;
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
        name: "pageend",
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
