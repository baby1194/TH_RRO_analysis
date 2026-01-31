/**
 * Test hand evaluation for three of a kind vs full house
 */

const { HandEvaluator, Card } = require("./texas-holdem-runner-runner.js");

function testHandEvaluation() {
  console.log("=== Testing Hand Evaluation ===\n");

  // Test case: A♠ A♥ 6♠ 6♥ 6♦
  // This should be three of a kind (6s), not full house
  const cards = [
    new Card("A", "spade"),
    new Card("A", "heart"),
    new Card("6", "spade"),
    new Card("6", "heart"),
    new Card("6", "diamond"),
  ];

  console.log(
    "Cards:",
    cards.map((c) => `${c.rank} of ${c.suit}`)
  );

  const hand = HandEvaluator.evaluateHand(
    [cards[0], cards[1]],
    [cards[2], cards[3], cards[4]]
  );
  console.log("\nHand evaluation:");
  console.log("  Ranking:", hand.rank.ranking);
  console.log("  Value:", hand.rank.value);

  // Check what the hand evaluator thinks
  const allCards = [...cards];
  const ranks = allCards.map((card) => card.getValue());
  const suits = allCards.map((card) => card.suit);

  console.log("\nRanks:", ranks);
  console.log("Suits:", suits);

  // Count rank occurrences
  const rankCounts = {};
  ranks.forEach((rank) => (rankCounts[rank] = (rankCounts[rank] || 0) + 1));
  console.log("Rank counts:", rankCounts);

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  console.log("Counts:", counts);

  const pairs = counts.filter((count) => count === 2).length;
  const threes = counts.filter((count) => count === 3).length;
  const fours = counts.filter((count) => count === 4).length;

  console.log("Pairs:", pairs);
  console.log("Threes:", threes);
  console.log("Fours:", fours);

  if (threes > 0 && pairs > 0) {
    console.log("This is a FULL HOUSE!");
  } else if (threes > 0) {
    console.log("This is THREE OF A KIND!");
  }
}

if (require.main === module) {
  testHandEvaluation();
}

module.exports = { testHandEvaluation };
