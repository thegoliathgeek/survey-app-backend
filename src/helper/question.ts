const QUESTIONS = [
  "Which of the following 20 images looks “rugged”?",
  "Please choose all that you consider “rugged” or align with your personal interpretation of “rugged?",
];

export const getQuestion = () => {
  return QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)];
};
