import questions from "../data/questions.json";

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
  // get title , description and name from db

  // loop to create 20 pages for given data

  let questionPages: SurveyJson = [];
  let imageIndex = 0;

  for (let i = 0; i < pagesCount; i++) {
    questionPages.push({
      name: `page${i}`,
      elements: [
        {
          type: "imagepicker",
          name: `page${i + 1}`,
          title: questions[i],
          description: "Please select all that apply.",
          isRequired: false,
          choices: imageUrls
            .slice(imageIndex, imageIndex + 25)
            .map((url) => parseImageUrl(url)),
          showLabel: true,
          multiSelect: true,
          fullWidth: true,
        },
      ],
    });

    if (imageIndex + 25 > imageUrls.length) {
      imageIndex = 0;
    } else {
      imageIndex += 25;
    }
  }

  return {
    title: "Survery App",
    logoPosition: "left",
    showQuestionNumbers: "off",
    showProgressBar: "bottom",
    focusFirstQuestionAutomatic: false,
    pages: [
      ...questionPages,
      {
        name: "Demographics",
        elements: [
          {
            type: "text",
            name: "mturk_id",
            hideNumber: true,
            title: "Enter your MTurk id?",
            isRequired: true,
            // validators: [
            //   {
            //     type: "regex",
            //     text: "Age should be between 01 to 99",
            //     regex: "^\\d{2}$",
            //   },
            // ],
          },

          {
            type: "panel",
            name: "age",
            elements: [
              {
                hideNumber: true,
                type: "radiogroup",
                name: "gender",
                title: "What is your gender?",
                isRequired: true,
                choices: ["male", "female", "other"],
                showNoneItem: false,
              },
              {
                type: "text",
                name: "age",
                hideNumber: true,
                title: "what is your age?",
                isRequired: true,
                validators: [
                  {
                    type: "regex",
                    text: "Age should be between 01 to 99",
                    regex: "^\\d{2}$",
                  },
                ],
                maxLength: 2,
              },
            ],
            title: "Demographics",
          },
        ],
      },
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
