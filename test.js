// import fs from "fs";
const fs = require("fs");
const {
  analyzeRunnerRunnerOuts,
  createCard,
  analyzeOuts,
  analyzePreFlop,
} = require("./texas-holdem-runner-runner.js");

// Define the board state (3 cards)
const boardState = [
  createCard("4", "heart"),
  createCard("J", "club"),
  createCard("Q", "heart"),
];

// Define players with their hole cards
const players = [
  {
    id: "player1",
    cards: [createCard("5", "spade"), createCard("6", "diamond")],
  },
  {
    id: "player2",
    cards: [createCard("Q", "club"), createCard("9", "club")],
  },
];

const results = analyzeOuts(boardState, players);

fs.writeFileSync("results.json", JSON.stringify(results, null, 2));
// console.log(`Total combinations: ${results.totalCombinations}`);
// console.log(`Ties: ${results.tieCount}`);

// const results1 = analyzePreFlop(players);
// fs.writeFileSync("results1.json", JSON.stringify(results1, null, 2));
