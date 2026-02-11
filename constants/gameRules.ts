export const rulesGroups = [
  {
    id: "raja_group",
    title: "Raja Mantri Chor Sipahi",
    subtitle: "Chor Police",
    image: require("@/assets/images/bg/gamemode/2.png"), // 👈 game image
    rules: [
      {
        id: "1",
        title: "Choose Players",
        desc: "Players choose their names and avatars. If skipped, the game selects them.",
      },
      {
        id: "2",
        title: "Game Rounds",
        desc: "The game plays 1 rounds by default. You can change rounds on clicking on round select button.",
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
        desc: "Select difficulty: Easy, Medium, or Hard before starting.",
      },
      {
        id: "2",
        title: "New Questions",
        desc: "Every quiz has new questions. No repeats.",
      },
      {
        id: "3",
        title: "50-50 Lifeline",
        desc: "Use 50-50 to remove two wrong answers. Limited uses.",
      },
      {
        id: "4",
        title: "View Solutions",
        desc: "After answering, you can see the correct answer.",
      },
      {
        id: "5",
        title: "Quit Penalty",
        desc: "If you quit before finishing, you lose 500 coins.",
      },
      {
        id: "6",
        title: "Easy Rewards",
        desc: "100% = 500 coins. 50% = 250 coins. Below 50% = -500 coins.",
      },
      {
        id: "7",
        title: "Medium Rewards",
        desc: "100% = 1500 coins. 50% = 750 coins. Below 50% = -700 coins.",
      },
      {
        id: "8",
        title: "Hard Rewards",
        desc: "100% = 3000 coins. 50% = 1500 coins. Below 50% = -1000 coins.",
      },
      {
        id: "9",
        title: "Accuracy Bonus",
        desc: "100% = +500 bonus. 90% = +300 bonus. 80% = +150 bonus.",
      },
      {
        id: "10",
        title: "Play Better, Earn More",
        desc: "Higher accuracy gives extra bonus coins.",
      },
    ],
  },
];
