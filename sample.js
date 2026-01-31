// texas-holdem-runner-runner.js is the core file
// I am showing the usage of it and it's output sample
// my whatsapp +1 (337) 343-6919 TGname @berry381 please contact me here for convenience

const {
  analyzeRunnerRunnerOuts,
  createCard,
} = require("./texas-holdem-runner-runner.js");

// Define the board state (3 cards)
const boardState = [
  createCard("10", "diamond"),
  createCard("3", "diamond"),
  createCard("6", "heart"),
];

// Define players with their hole cards
const players = [
  {
    id: "player1",
    cards: [createCard("10", "spade"), createCard("3", "heart")],
  },
  {
    id: "player2",
    cards: [createCard("J", "heart"), createCard("2", "diamond")],
  },
];

// Analyze runner-runner outs
const results = analyzeRunnerRunnerOuts(boardState, players);

// Result Object

const resultsObject = {
  totalCombinations: 990,
  tieCount: 0,
  playerResults: [
    {
      playerId: "player1",
      runnerRunnerOuts: [],
      winCount: 907,
      winPercentage: 91.61616161616162,
      runnerRunnerDescription: "Current winner - no runner-runner outs needed",
    },
    {
      playerId: "player2",
      runnerRunnerOuts: [
        // here is the output of the runner-runner outs
      ],
      winCount: 83,
      winPercentage: 8.383838383838384,
      runnerRunnerDescription:
        "Every 2+J, 6+J(Two Pair), Every 2+2, J+J(Three of a Kind), Every 4+5(Straight), Every 2X♦(Flush)",
    },
  ],
};
