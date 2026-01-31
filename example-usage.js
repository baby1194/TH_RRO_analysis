/**
 * Example usage of Texas Hold'em Runner-Runner Analysis
 */

const {
  analyzeRunnerRunnerOuts,
  analyzePreFlop,
  createCard,
} = require("./texas-holdem-runner-runner.js");

// Example 1: Basic usage
function example1() {
  console.log("=== Example 1: Basic Runner-Runner Analysis ===\n");

  // Board state (3 cards)
  const boardState = [
    createCard("9", "club"),
    createCard("4", "spade"),
    createCard("4", "heart"),
  ];

  // Players with their hole cards
  const players = [
    {
      id: "player1",
      cards: [createCard("6", "club"), createCard("8", "club")],
    },
    {
      id: "player2",
      cards: [createCard("Q", "club"), createCard("4", "heart")],
    },
  ];

  // Analyze runner-runner outs
  const results = analyzeRunnerRunnerOuts(boardState, players);

  console.log(
    `Total possible turn/river combinations: ${results.totalCombinations}`
  );
  console.log(`Ties: ${results.tieCount}`);
  console.log("\nResults:");

  results.playerResults.forEach((player) => {
    console.log(`\n${player.playerId}:`);
    console.log(`  Wins: ${player.winCount} combinations`);
    console.log(`  Win percentage: ${player.winPercentage.toFixed(2)}%`);
    console.log(`  Runner-runner outs: ${player.runnerRunnerOuts.length}`);
    console.log(`  Description: ${player.runnerRunnerDescription}`);

    // Show some example winning combinations
    if (player.runnerRunnerOuts.length > 0) {
      console.log("  Example winning combinations:");
      player.runnerRunnerOuts.slice(0, 3).forEach((out, index) => {
        console.log(
          `    ${index + 1}. Turn: ${out.turn.rank} of ${
            out.turn.suit
          }, River: ${out.river.rank} of ${out.river.suit}`
        );
      });
    }
  });

  return results;
}

// Example 2: Flush draw analysis
function example2() {
  console.log("\n\n=== Example 2: Flush Draw Analysis ===\n");

  const boardState = [
    createCard("A", "heart"),
    createCard("K", "heart"),
    createCard("Q", "spade"),
  ];

  const players = [
    {
      id: "flush_draw",
      cards: [createCard("J", "heart"), createCard("10", "heart")],
    },
    {
      id: "pair",
      cards: [createCard("A", "spade"), createCard("2", "club")],
    },
  ];

  const results = analyzeRunnerRunnerOuts(boardState, players);

  console.log(`Total combinations: ${results.totalCombinations}`);
  console.log(`Ties: ${results.tieCount}`);

  results.playerResults.forEach((player) => {
    console.log(`\n${player.playerId}:`);
    console.log(`  Win percentage: ${player.winPercentage.toFixed(2)}%`);
    console.log(`  Description: ${player.runnerRunnerDescription}`);

    // Analyze the types of winning hands
    const handTypes = {};
    player.runnerRunnerOuts.forEach((out) => {
      const ranking = out.hand.rank.ranking;
      const handName = getHandName(ranking);
      handTypes[handName] = (handTypes[handName] || 0) + 1;
    });

    console.log("  Winning hand types:");
    Object.entries(handTypes).forEach(([handName, count]) => {
      console.log(`    ${handName}: ${count} combinations`);
    });
  });

  return results;
}

// Example 3: Multiple players
function example3() {
  console.log("\n\n=== Example 3: Multiple Players Analysis ===\n");

  const boardState = [
    createCard("A", "spade"),
    createCard("K", "heart"),
    createCard("Q", "club"),
  ];

  const players = [
    {
      id: "straight_draw",
      cards: [createCard("J", "spade"), createCard("10", "heart")],
    },
    {
      id: "pair",
      cards: [createCard("A", "heart"), createCard("A", "club")],
    },
    {
      id: "high_card",
      cards: [createCard("K", "spade"), createCard("2", "diamond")],
    },
  ];

  const results = analyzeRunnerRunnerOuts(boardState, players);

  console.log(`Total combinations: ${results.totalCombinations}`);
  console.log(`Ties: ${results.tieCount}`);

  // Sort players by win percentage
  const sortedPlayers = results.playerResults.sort(
    (a, b) => b.winPercentage - a.winPercentage
  );

  console.log("\nRankings:");
  sortedPlayers.forEach((player, index) => {
    console.log(
      `${index + 1}. ${player.playerId}: ${player.winPercentage.toFixed(2)}%`
    );
    console.log(`   Description: ${player.runnerRunnerDescription}`);
  });

  return results;
}

// Helper function to get hand name
function getHandName(ranking) {
  const handNames = {
    1: "High Card",
    2: "Pair",
    3: "Two Pair",
    4: "Three of a Kind",
    5: "Straight",
    6: "Flush",
    7: "Full House",
    8: "Four of a Kind",
    9: "Straight Flush",
    10: "Royal Flush",
  };
  return handNames[ranking] || "Unknown";
}

// Example 4: Detailed analysis of specific scenario
function example4() {
  console.log("\n\n=== Example 4: Detailed Scenario Analysis ===\n");

  // Scenario: Player 1 has flush draw, Player 2 has pair
  const boardState = [
    createCard("9", "club"),
    createCard("4", "spade"),
    createCard("4", "heart"),
  ];

  const players = [
    {
      id: "flush_draw",
      cards: [createCard("6", "club"), createCard("8", "club")],
    },
    {
      id: "pair",
      cards: [createCard("Q", "club"), createCard("4", "heart")],
    },
  ];

  const results = analyzeRunnerRunnerOuts(boardState, players);

  console.log("Scenario: Flush draw vs Two Pair");
  console.log(`Total combinations: ${results.totalCombinations}`);
  console.log(`Ties: ${results.tieCount}`);

  const flushDrawPlayer = results.playerResults[0];
  const pairPlayer = results.playerResults[1];

  console.log(`\nFlush draw player (${flushDrawPlayer.playerId}):`);
  console.log(`  Win percentage: ${flushDrawPlayer.winPercentage.toFixed(2)}%`);
  console.log(`  Winning combinations: ${flushDrawPlayer.winCount}`);
  console.log(`  Description: ${flushDrawPlayer.runnerRunnerDescription}`);

  // Analyze winning hand types for flush draw player
  const winningHands = {};
  flushDrawPlayer.runnerRunnerOuts.forEach((out) => {
    const handName = getHandName(out.hand.rank.ranking);
    winningHands[handName] = (winningHands[handName] || 0) + 1;
  });

  console.log("  Winning hand types:");
  Object.entries(winningHands).forEach(([handName, count]) => {
    const percentage = ((count / flushDrawPlayer.winCount) * 100).toFixed(1);
    console.log(`    ${handName}: ${count} (${percentage}%)`);
  });

  console.log(`\nPair player (${pairPlayer.playerId}):`);
  console.log(`  Win percentage: ${pairPlayer.winPercentage.toFixed(2)}%`);
  console.log(`  Winning combinations: ${pairPlayer.winCount}`);
  console.log(`  Description: ${pairPlayer.runnerRunnerDescription}`);

  return results;
}

// Example 5: Pre-flop Monte Carlo analysis
function example5() {
  console.log("\n\n=== Example 5: Pre-Flop Monte Carlo Analysis ===\n");

  // Pre-flop scenario: No board cards
  const players = [
    {
      id: "premium_pair",
      cards: [createCard("A", "spade"), createCard("A", "heart")],
    },
    {
      id: "suited_cards",
      cards: [createCard("K", "spade"), createCard("Q", "spade")],
    },
    {
      id: "off_suit",
      cards: [createCard("7", "diamond"), createCard("2", "club")],
    },
  ];

  console.log("Pre-flop scenario with 3 players:");
  players.forEach((player) => {
    console.log(
      `  ${player.id}: ${player.cards[0].rank} of ${player.cards[0].suit}, ${player.cards[1].rank} of ${player.cards[1].suit}`
    );
  });

  // Run Monte Carlo simulation
  const results = analyzePreFlop(players, 10000);

  console.log(`\nResults (${results.monteCarloIterations} iterations):`);
  console.log(`  Total Simulations: ${results.totalSimulations}`);
  console.log(`  Tie Count: ${results.tieCount}`);

  // Sort players by win percentage
  const sortedPlayers = results.playerResults.sort(
    (a, b) => b.winPercentage - a.winPercentage
  );

  console.log("\nPlayer Win Probabilities:");
  sortedPlayers.forEach((player, index) => {
    console.log(
      `${index + 1}. ${player.playerId}: ${player.winPercentage.toFixed(2)}% (${
        player.winCount
      } wins)`
    );
  });

  // Verify probabilities sum to approximately 100%
  const totalWinPercentage = results.playerResults.reduce(
    (sum, pr) => sum + pr.winPercentage,
    0
  );
  console.log(`\nTotal Win Percentage: ${totalWinPercentage.toFixed(2)}%`);

  return results;
}

// Run all examples
function runAllExamples() {
  console.log("🎯 Texas Hold'em Runner-Runner Analysis Examples\n");

  example1();
  example2();
  example3();
  example4();
  example5();

  console.log("\n✨ All examples completed!");
}

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
}

module.exports = {
  runAllExamples,
  example1,
  example2,
  example3,
  example4,
  example5,
};
