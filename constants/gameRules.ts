export const rulesGroups = [
  {
    id: "raja_group",
    title: "Raja Mantri Chor Sipahi",
    subtitle: "Chor Police",
    image: require("@/assets/images/bg/chorpolice.png"), // 👈 game image
    rules: [
      {
        id: "1",
        title: "Choose Players",
        desc: "Players choose their names and avatars. If skipped, the game selects them.",
      },
      {
        id: "2",
        title: "Game Rounds",
        desc: "The game plays 4 rounds by default. You can change rounds in settings.",
      },
      {
        id: "3",
        title: "Hidden Cards",
        desc: "At the start of each round, all 4 cards are face down.",
      },
      {
        id: "4",
        title: "Start Round",
        desc: "Tap the button to start and reveal the cards.",
      },
      {
        id: "5",
        title: "Cards Open",
        desc: "Two cards open first. Two cards stay hidden.",
      },
      {
        id: "6",
        title: "King Points",
        desc: "The King card opens and gets 1000 points.",
      },
      {
        id: "7",
        title: "Police Turn",
        desc: "Police must find the Chor from the hidden cards.",
      },
      {
        id: "8",
        title: "Catch or Escape",
        desc: "If caught, Police gets 500 points. If not, Chor gets 500 points.",
      },
      {
        id: "9",
        title: "Mantri Bonus",
        desc: "Mantri always gets 800 points every round.",
      },
    ],
  },

  {
    id: "think_count",
    title: "Think & Count",
    subtitle: "Math Quiz Game",
    image: require("@/assets/images/bg/gamemode/1.png"), // 👈 game image
    rules: [
      {
        id: "1",
        title: "Choose Mode",
        desc: "First choose the game mode before starting the quiz.",
      },
      {
        id: "2",
        title: "New Questions",
        desc: "Every question is new. Questions never repeat.",
      },
      {
        id: "3",
        title: "Math for Kids",
        desc: "Math questions are made for kids aged 5 to 8.",
      },
      {
        id: "4",
        title: "Easy to Hard",
        desc: "Questions start easy and become harder step by step.",
      },
      {
        id: "5",
        title: "Answer Quiz",
        desc: "Choose the correct answer from the quiz options.",
      },
      {
        id: "6",
        title: "50-50 Help",
        desc: "Use 50-50 to remove 2 wrong options. Limited uses only.",
      },
      {
        id: "7",
        title: "Earn More Points",
        desc: "Harder questions give more points when solved.",
      },
      {
        id: "8",
        title: "Get Solution",
        desc: "If stuck, you can see the correct solution for each problem.",
      },
    ],
  },
];
