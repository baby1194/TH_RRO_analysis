// Card representation and utilities
class Card {
  constructor(rank, suit) {
    this.rank = rank;
    this.suit = suit;
  }

  toString() {
    return `${this.rank} of ${this.suit}`;
  }

  getValue() {
    const rankValues = {
      2: 2,
      3: 3,
      4: 4,
      5: 5,
      6: 6,
      7: 7,
      8: 8,
      9: 9,
      10: 10,
      J: 11,
      Q: 12,
      K: 13,
      A: 14,
    };
    return rankValues[this.rank];
  }
}

// Hand ranking constants
const HAND_RANKINGS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10,
};

/**
 * Evaluates the best 5-card hand from 7 cards (2 hole + 5 community)
 */
class HandEvaluator {
  static evaluateHand(holeCards, communityCards) {
    const allCards = [...holeCards, ...communityCards];
    const bestHand = this.getBestFiveCardHand(allCards);
    return bestHand;
  }

  static getBestFiveCardHand(cards) {
    const combinations = this.getCombinations(cards, 5);
    let bestHand = null;
    let bestRank = { ranking: 0, value: 0 };

    for (const combo of combinations) {
      const rank = this.rankHand(combo);
      if (this.compareHands(rank, bestRank) > 0) {
        bestHand = combo;
        bestRank = rank;
      }
    }

    return { cards: bestHand, rank: bestRank };
  }

  static getCombinations(arr, k) {
    if (k === 1) return arr.map((x) => [x]);
    if (k === arr.length) return [arr];

    const result = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const head = arr[i];
      const tailCombos = this.getCombinations(arr.slice(i + 1), k - 1);
      for (const combo of tailCombos) {
        result.push([head, ...combo]);
      }
    }
    return result;
  }

  static rankHand(cards) {
    const sortedCards = [...cards].sort((a, b) => b.getValue() - a.getValue());
    const ranks = sortedCards.map((card) => card.getValue());
    const suits = sortedCards.map((card) => card.suit);

    // Check for flush
    const isFlush = suits.every((suit) => suit === suits[0]);

    // Check for straight
    const isStraight = this.isStraight(ranks);

    // Count rank occurrences
    const rankCounts = {};
    ranks.forEach((rank) => {
      rankCounts[rank] = (rankCounts[rank] || 0) + 1;
    });

    const counts = Object.values(rankCounts).sort((a, b) => b - a);
    const pairs = counts.filter((count) => count === 2).length;
    const threes = counts.filter((count) => count === 3).length;
    const fours = counts.filter((count) => count === 4).length;

    // Determine hand type
    if (isFlush && isStraight) {
      if (ranks[0] === 14 && ranks[1] === 13) {
        return { ranking: HAND_RANKINGS.ROYAL_FLUSH, value: 0 };
      }
      return { ranking: HAND_RANKINGS.STRAIGHT_FLUSH, value: ranks[0] };
    }

    if (fours > 0) {
      const fourRank = Object.keys(rankCounts).find(
        (rank) => rankCounts[rank] === 4
      );
      const kicker = Object.keys(rankCounts).find(
        (rank) => rankCounts[rank] === 1
      );
      return {
        ranking: HAND_RANKINGS.FOUR_OF_A_KIND,
        value: parseInt(fourRank) * 100 + parseInt(kicker),
      };
    }

    if (threes > 0 && pairs > 0) {
      const threeRank = Object.keys(rankCounts).find(
        (rank) => rankCounts[rank] === 3
      );
      const pairRank = Object.keys(rankCounts).find(
        (rank) => rankCounts[rank] === 2
      );
      return {
        ranking: HAND_RANKINGS.FULL_HOUSE,
        value: parseInt(threeRank) * 100 + parseInt(pairRank),
      };
    }

    if (isFlush) {
      return {
        ranking: HAND_RANKINGS.FLUSH,
        value:
          ranks[0] * 10000 +
          ranks[1] * 1000 +
          ranks[2] * 100 +
          ranks[3] * 10 +
          ranks[4],
      };
    }

    if (isStraight) {
      // Check if this is A-2-3-4-5 straight by looking for A, 2, 3, 4, 5 in the ranks
      const hasA = ranks.includes(14);
      const has2 = ranks.includes(2);
      const has3 = ranks.includes(3);
      const has4 = ranks.includes(4);
      const has5 = ranks.includes(5);

      const straightValue = hasA && has2 && has3 && has4 && has5 ? 5 : ranks[0];
      return { ranking: HAND_RANKINGS.STRAIGHT, value: straightValue };
    }

    if (threes > 0) {
      const threeRank = Object.keys(rankCounts).find(
        (rank) => rankCounts[rank] === 3
      );
      const kickers = ranks
        .filter((rank) => rank !== parseInt(threeRank))
        .sort((a, b) => b - a);
      return {
        ranking: HAND_RANKINGS.THREE_OF_A_KIND,
        value: parseInt(threeRank) * 10000 + kickers[0] * 100 + kickers[1],
      };
    }

    if (pairs === 2) {
      const pairRanks = Object.keys(rankCounts)
        .filter((rank) => rankCounts[rank] === 2)
        .map((rank) => parseInt(rank))
        .sort((a, b) => b - a);
      const kicker = ranks.find((rank) => !pairRanks.includes(rank));
      return {
        ranking: HAND_RANKINGS.TWO_PAIR,
        value: pairRanks[0] * 10000 + pairRanks[1] * 100 + kicker,
      };
    }

    if (pairs === 1) {
      const pairRank = Object.keys(rankCounts).find(
        (rank) => rankCounts[rank] === 2
      );
      const kickers = ranks
        .filter((rank) => rank !== parseInt(pairRank))
        .sort((a, b) => b - a);
      return {
        ranking: HAND_RANKINGS.PAIR,
        value:
          parseInt(pairRank) * 1000000 +
          kickers[0] * 10000 +
          kickers[1] * 100 +
          kickers[2],
      };
    }

    return {
      ranking: HAND_RANKINGS.HIGH_CARD,
      value:
        ranks[0] * 100000000 +
        ranks[1] * 1000000 +
        ranks[2] * 10000 +
        ranks[3] * 100 +
        ranks[4],
    };
  }

  static isStraight(ranks) {
    const sortedRanks = [...ranks].sort((a, b) => b - a);

    // Check for A-2-3-4-5 straight first
    if (
      sortedRanks[0] === 14 &&
      sortedRanks[1] === 5 &&
      sortedRanks[2] === 4 &&
      sortedRanks[3] === 3 &&
      sortedRanks[4] === 2
    ) {
      return true;
    }

    // Check for regular straight
    for (let i = 0; i < sortedRanks.length - 1; i++) {
      if (sortedRanks[i] - sortedRanks[i + 1] !== 1) {
        return false;
      }
    }

    return true;
  }

  static compareHands(hand1, hand2) {
    if (hand1.ranking !== hand2.ranking) {
      return hand1.ranking - hand2.ranking;
    }
    return hand1.value - hand2.value;
  }
}

/**
 * Generates all possible turn/river combinations from remaining deck
 */
class DeckGenerator {
  static generateAllTurnRiverCombinations(usedCards) {
    const allCards = this.generateFullDeck();
    const remainingCards = allCards.filter(
      (card) =>
        !usedCards.some(
          (used) => used.rank === card.rank && used.suit === card.suit
        )
    );

    const combinations = [];
    for (let i = 0; i < remainingCards.length; i++) {
      for (let j = i + 1; j < remainingCards.length; j++) {
        combinations.push({
          turn: remainingCards[i],
          river: remainingCards[j],
        });
      }
    }
    return combinations;
  }

  static generateAllTurnCombinations(usedCards) {
    const allCards = this.generateFullDeck();
    const remainingCards = allCards.filter(
      (card) =>
        !usedCards.some(
          (used) => used.rank === card.rank && used.suit === card.suit
        )
    );

    return remainingCards.map((card) => ({ turn: card }));
  }

  static generateFullDeck() {
    const ranks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    const suits = ["spade", "heart", "diamond", "club"];
    const deck = [];

    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push(new Card(rank, suit));
      }
    }
    return deck;
  }

  /**
   * Fisher-Yates shuffle algorithm for shuffling deck
   */
  static shuffleDeck(deck) {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Draws random cards from remaining deck
   */
  static drawRandomCards(usedCards, count) {
    const allCards = this.generateFullDeck();
    const remainingCards = allCards.filter(
      (card) =>
        !usedCards.some(
          (used) => used.rank === card.rank && used.suit === card.suit
        )
    );
    const shuffled = this.shuffleDeck(remainingCards);
    return shuffled.slice(0, count);
  }
}

/**
 * Groups regular outs by hand ranking and creates descriptive text
 */
class RegularOutsDescriber {
  static describeRegularOuts(
    playerOuts,
    playerCards,
    boardCards,
    allPlayerCards = null
  ) {
    if (playerOuts.length === 0) {
      return "No regular outs available";
    }

    // Group outs by hand ranking
    const groupedOuts = this.groupOutsByRanking(playerOuts);

    // Create descriptions for each ranking group
    const descriptions = [];

    for (const [ranking, outs] of Object.entries(groupedOuts)) {
      const description = this.describeRankingGroup(
        parseInt(ranking),
        outs,
        playerCards,
        boardCards,
        allPlayerCards
      );
      if (description) {
        descriptions.push(description);
      }
    }

    return descriptions.join(", ");
  }

  static groupOutsByRanking(outs) {
    const grouped = {};
    outs.forEach((out) => {
      const ranking = out.hand.rank.ranking;
      if (!grouped[ranking]) {
        grouped[ranking] = [];
      }
      grouped[ranking].push(out);
    });
    return grouped;
  }

  static describeRankingGroup(
    ranking,
    outs,
    playerCards,
    boardCards,
    allPlayerCards = null
  ) {
    const allCards = [...playerCards, ...boardCards];
    const allRanks = allCards.map((card) => card.rank);
    const allSuits = allCards.map((card) => card.suit);

    // Count occurrences of each rank and suit
    const rankCounts = {};
    const suitCounts = {};
    allRanks.forEach(
      (rank) => (rankCounts[rank] = (rankCounts[rank] || 0) + 1)
    );
    allSuits.forEach(
      (suit) => (suitCounts[suit] = (suitCounts[suit] || 0) + 1)
    );

    // Get unique turn cards for this ranking
    const uniqueCards = this.getUniqueCards(outs);

    switch (ranking) {
      case 10: // Royal Flush
        return this.describeRoyalFlush(uniqueCards);
      case 9: // Straight Flush
        return this.describeStraightFlush(uniqueCards);
      case 8: // Four of a Kind
        return this.describeFourOfAKind(uniqueCards, rankCounts);
      case 7: // Full House
        return this.describeFullHouse(uniqueCards, rankCounts);
      case 6: // Flush
        return this.describeFlush(uniqueCards, suitCounts);
      case 5: // Straight
        return this.describeStraight(uniqueCards);
      case 4: // Three of a Kind
        return this.describeThreeOfAKind(uniqueCards, rankCounts);
      case 3: // Two Pair
        return this.describeTwoPair(uniqueCards, rankCounts);
      case 2: // Pair
        return this.describePair(uniqueCards, rankCounts);
      default:
        return `${uniqueCards.length} cards for ranking ${ranking}`;
    }
  }

  static getUniqueCards(outs) {
    const unique = new Set();
    outs.forEach((out) => {
      const turn = out.turn;
      const turnSymbol = this.getSuitSymbol(turn.suit);
      const key = `${turn.rank}${turnSymbol}`;
      unique.add(key);
    });
    return Array.from(unique);
  }

  static getSuitSymbol(suit) {
    const suitSymbols = {
      spade: "♠",
      heart: "♥",
      diamond: "♦",
      club: "♣",
    };
    return suitSymbols[suit] || suit;
  }

  static describeRoyalFlush(cards) {
    if (cards.length === 0) return null;
    return `Any ${cards.join(", ")}(Royal Flush)`;
  }

  static describeStraightFlush(cards) {
    if (cards.length === 0) return null;
    return `Any ${cards.join(", ")}(Straight Flush)`;
  }

  static describeFourOfAKind(cards, rankCounts) {
    if (cards.length === 0) return null;

    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 3) {
        return `Any ${rank}(Four of a Kind)`;
      }
    }

    const neededRanks = new Set();
    cards.forEach((card) => {
      const rank = card.replace(/[♠♥♦♣]/, "");
      neededRanks.add(rank);
    });

    const ranks = Array.from(neededRanks);
    return `Any ${ranks.join(", ")}(Four of a Kind)`;
  }

  static describeFullHouse(cards, rankCounts) {
    if (cards.length === 0) return null;

    const neededRanks = new Set();
    cards.forEach((card) => {
      const rank = card.replace(/[♠♥♦♣]/, "");
      neededRanks.add(rank);
    });

    const ranks = Array.from(neededRanks);
    return `Any ${ranks.join(", ")}(Full House)`;
  }

  static describeFlush(cards, suitCounts) {
    if (cards.length === 0) return null;

    const neededSuits = new Set();
    cards.forEach((card) => {
      const suit = card.match(/[♠♥♦♣]/)[0];
      neededSuits.add(suit);
    });

    const suits = Array.from(neededSuits);
    const descriptions = [];

    for (const suit of suits) {
      descriptions.push(`Any ${suit}(Flush)`);
    }

    return descriptions.join(", ");
  }

  static describeStraight(cards) {
    if (cards.length === 0) return null;

    const neededRanks = new Set();
    cards.forEach((card) => {
      const rank = card.replace(/[♠♥♦♣]/, "");
      neededRanks.add(rank);
    });

    const ranks = Array.from(neededRanks);
    return `Any ${ranks.join(", ")}(Straight)`;
  }

  static describeThreeOfAKind(cards, rankCounts) {
    if (cards.length === 0) return null;

    // Check if player already has 2 of any rank
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 2) {
        return `Any ${rank}(Three of a Kind)`;
      }
    }

    const neededRanks = new Set();
    cards.forEach((card) => {
      const rank = card.replace(/[♠♥♦♣]/, "");
      neededRanks.add(rank);
    });

    const ranks = Array.from(neededRanks);
    return `Any ${ranks.join(", ")}(Three of a Kind)`;
  }

  static describeTwoPair(cards, rankCounts) {
    if (cards.length === 0) return null;

    const neededRanks = new Set();
    cards.forEach((card) => {
      const rank = card.replace(/[♠♥♦♣]/, "");
      neededRanks.add(rank);
    });

    const ranks = Array.from(neededRanks);
    return `Any ${ranks.join(", ")}(Two Pair)`;
  }

  static describePair(cards, rankCounts) {
    if (cards.length === 0) return null;

    const neededRanks = new Set();
    cards.forEach((card) => {
      const rank = card.replace(/[♠♥♦♣]/, "");
      neededRanks.add(rank);
    });

    const ranks = Array.from(neededRanks);
    return `Any ${ranks.join(", ")}(Pair)`;
  }
}

/**
 * Groups runner-runner outs by hand ranking and creates descriptive text
 */
class RunnerRunnerDescriber {
  static describeRunnerRunnerOuts(
    playerOuts,
    playerCards,
    boardCards,
    allPlayerCards = null,
    regularOuts = []
  ) {
    if (playerOuts.length === 0) {
      return "No runner-runner outs available";
    }

    // Filter out runner-runner outs that contain cards from regular outs
    const filteredOuts = this.filterOutOverlappingCombinations(
      playerOuts,
      regularOuts
    );

    if (filteredOuts.length === 0) {
      return "No runner-runner outs available (all covered by regular outs)";
    }

    // Group outs by hand ranking
    const groupedOuts = this.groupOutsByRanking(filteredOuts);

    // Create descriptions for each ranking group
    const descriptions = [];

    for (const [ranking, outs] of Object.entries(groupedOuts)) {
      const description = this.describeRankingGroup(
        parseInt(ranking),
        outs,
        playerCards,
        boardCards,
        allPlayerCards
      );
      if (description) {
        descriptions.push(description);
      }
    }

    return descriptions.join(", ");
  }

  static filterOutOverlappingCombinations(runnerRunnerOuts, regularOuts) {
    if (regularOuts.length === 0) {
      return runnerRunnerOuts;
    }

    // Get all cards from regular outs
    const regularOutCards = new Set();
    regularOuts.forEach((out) => {
      const cardKey = `${out.turn.rank}${out.turn.suit}`;
      regularOutCards.add(cardKey);
    });

    // Filter out runner-runner combinations that contain any regular out card
    return runnerRunnerOuts.filter((out) => {
      const turnCardKey = `${out.turn.rank}${out.turn.suit}`;
      const riverCardKey = `${out.river.rank}${out.river.suit}`;

      // If either turn or river card is in regular outs, exclude this combination
      return (
        !regularOutCards.has(turnCardKey) && !regularOutCards.has(riverCardKey)
      );
    });
  }

  static groupOutsByRanking(outs) {
    const grouped = {};
    outs.forEach((out) => {
      const ranking = out.hand.rank.ranking;
      if (!grouped[ranking]) {
        grouped[ranking] = [];
      }
      grouped[ranking].push(out);
    });
    return grouped;
  }

  static describeRankingGroup(
    ranking,
    outs,
    playerCards,
    boardCards,
    allPlayerCards = null
  ) {
    const allCards = [...playerCards, ...boardCards];
    const allRanks = allCards.map((card) => card.rank);
    const allSuits = allCards.map((card) => card.suit);

    // Count occurrences of each rank and suit
    const rankCounts = {};
    const suitCounts = {};
    allRanks.forEach(
      (rank) => (rankCounts[rank] = (rankCounts[rank] || 0) + 1)
    );
    allSuits.forEach(
      (suit) => (suitCounts[suit] = (suitCounts[suit] || 0) + 1)
    );

    // Get unique turn/river combinations for this ranking
    const uniqueCombinations = this.getUniqueCombinations(outs);

    switch (ranking) {
      case 10: // Royal Flush
        return this.describeRoyalFlush(uniqueCombinations);
      case 9: // Straight Flush
        return this.describeStraightFlush(uniqueCombinations);
      case 8: // Four of a Kind
        return this.describeFourOfAKind(uniqueCombinations, rankCounts);
      case 7: // Full House
        return this.describeFullHouse(uniqueCombinations, rankCounts);
      case 6: // Flush
        return this.describeFlush(
          uniqueCombinations,
          suitCounts,
          outs,
          playerCards,
          boardCards,
          allPlayerCards
        );
      case 5: // Straight
        return this.describeStraight(uniqueCombinations);
      case 4: // Three of a Kind
        return this.describeThreeOfAKind(uniqueCombinations, rankCounts);
      case 3: // Two Pair
        return this.describeTwoPair(uniqueCombinations, rankCounts);
      case 2: // Pair
        return this.describePair(uniqueCombinations, rankCounts);
      default:
        return `${uniqueCombinations.length} combinations for ranking ${ranking}`;
    }
  }

  static getUniqueCombinations(outs) {
    const unique = new Set();
    outs.forEach((out) => {
      const turn = out.turn;
      const river = out.river;
      const turnSymbol = this.getSuitSymbol(turn.suit);
      const riverSymbol = this.getSuitSymbol(river.suit);
      const key =
        turn.getValue() < river.getValue()
          ? `${turn.rank}${turnSymbol}+${river.rank}${riverSymbol}`
          : `${river.rank}${riverSymbol}+${turn.rank}${turnSymbol}`;
      unique.add(key);
    });
    return Array.from(unique);
  }

  static getSuitSymbol(suit) {
    const suitSymbols = {
      spade: "♠",
      heart: "♥",
      diamond: "♦",
      club: "♣",
    };
    return suitSymbols[suit] || suit;
  }

  static describeRoyalFlush(combinations) {
    if (combinations.length === 0) return null;

    if (combinations.length === 1) {
      const example = combinations[0].split("+");
      const turn = example[0];
      const river = example[1];
      return `${turn}+${river}(Royal Flush)`;
    }

    // Show all combinations when there are multiple
    const allCombinations = combinations.map((combo) => {
      const parts = combo.split("+");
      return `${parts[0]}+${parts[1]}`;
    });

    return `Every ${allCombinations.join(", ")}(Royal Flush)`;
  }

  static describeStraightFlush(combinations) {
    if (combinations.length === 0) return null;

    if (combinations.length === 1) {
      const example = combinations[0].split("+");
      const turn = example[0];
      const river = example[1];
      return `${turn}+${river}(Straight Flush)`;
    }

    const allCombinations = combinations.map((combo) => {
      const parts = combo.split("+");
      return `${parts[0]}+${parts[1]}`;
    });

    return `Every ${allCombinations.join(", ")}(Straight Flush)`;
  }

  static describeFourOfAKind(combinations, rankCounts) {
    if (combinations.length === 0) return null;

    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 3) {
        return `${rank}+Any Card(Four of a Kind)`;
      }
    }

    const neededRanks = new Set();
    combinations.forEach((combo) => {
      const parts = combo.split("+");
      const turnRank = parts[0].replace(/[♠♥♦♣]/, "");
      const riverRank = parts[1].replace(/[♠♥♦♣]/, "");
      if (turnRank === riverRank) {
        neededRanks.add(turnRank);
      }
    });

    if (neededRanks.size > 0) {
      const ranks = Array.from(neededRanks).map((rank) => `${rank}+${rank}`);
      return `Every ${ranks.join(", ")}(Four of a Kind)`;
    }

    // If no matching pairs found, show all combinations
    const allCombinations = Array.from(
      new Set(
        combinations.map((combo) => {
          const parts = combo.split("+");
          return `${parts[0].replace(/[♠♥♦♣]/, "")}+${parts[1].replace(/[♠♥♦♣]/, "")}`;
        })
      )
    );
    return `Every ${allCombinations.join(", ")}(Four of a Kind)`;
  }

  static describeFullHouse(combinations, rankCounts) {
    if (combinations.length === 0) return null;

    const neededPairs = new Set();
    const neededSingles = new Set();

    combinations.forEach((combo) => {
      const parts = combo.split("+");
      const turnRank = parts[0].replace(/[♠♥♦♣]/, "");
      const riverRank = parts[1].replace(/[♠♥♦♣]/, "");

      if (turnRank === riverRank) {
        neededPairs.add(turnRank);
      } else {
        neededSingles.add(`${turnRank}+${riverRank}`);
      }
    });

    const descriptions = [];
    if (neededPairs.size > 0) {
      const pairs = Array.from(neededPairs).map((rank) => `${rank}+${rank}`);
      descriptions.push(`Every ${pairs.join(", ")}(Full House)`);
    }
    if (neededSingles.size > 0) {
      descriptions.push(
        `Every ${Array.from(neededSingles).join(", ")}(Full House)`
      );
    }

    return descriptions.join(", ");
  }

  static describeFlush(
    combinations,
    suitCounts,
    outs,
    playerCards,
    boardCards,
    allPlayerCards = null
  ) {
    if (combinations.length === 0) return null;

    // Find the suit that would complete the flush
    const neededSuits = new Set();
    combinations.forEach((combo) => {
      const parts = combo.split("+");
      const turnSuit = parts[0].match(/[♠♥♦♣]/)[0];
      const riverSuit = parts[1].match(/[♠♥♦♣]/)[0];
      if (turnSuit === riverSuit) {
        neededSuits.add(turnSuit);
      }
    });

    if (neededSuits.size > 0) {
      const suits = Array.from(neededSuits);
      const descriptions = [];

      for (const suit of suits) {
        const exceptionList = this.findFlushExceptions(
          suit,
          playerCards,
          boardCards,
          outs,
          allPlayerCards
        );
        if (exceptionList.length > 0) {
          descriptions.push(
            `Every 2X${suit}(Flush)(except ${exceptionList.join(", ")})`
          );
        } else {
          descriptions.push(`Every 2X${suit}(Flush)`);
        }
      }

      return descriptions.join(", ");
    }

    // If not same suit, list all specific combinations
    const allCombinations = Array.from(
      new Set(
        combinations.map((combo) => {
          const parts = combo.split("+");
          return `${parts[0]}+${parts[1]}`;
        })
      )
    );
    return `Every ${allCombinations.join(", ")}(Flush)`;
  }

  static findFlushExceptions(
    suit,
    playerCards,
    boardCards,
    outs,
    allPlayerCards = null
  ) {
    const exceptions = [];
    const usedCards = [...allPlayerCards.flat(), ...boardCards];
    console.log("usedCards:", usedCards);

    // Get the suit symbol for the target suit
    const suitSymbol = this.getSuitSymbol(this.getSuitFromSymbol(suit));

    // Find all available ranks in this suit that could make a flush
    const allRanks = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];
    const availableRanks = allRanks.filter((rank) => {
      return !usedCards.some(
        (card) => card.rank === rank && this.getSuitSymbol(card.suit) === suit
      );
    });

    for (const rank of availableRanks) {
      if (
        this.wouldThisRankCauseLoss(
          rank,
          playerCards,
          boardCards,
          allPlayerCards
        )
      ) {
        exceptions.push(`${suitSymbol}${rank}`);
      }
    }

    return exceptions;
  }

  static getSuitFromSymbol(symbol) {
    const symbolToSuit = {
      "♠": "spade",
      "♥": "heart",
      "♦": "diamond",
      "♣": "club",
    };
    return symbolToSuit[symbol] || symbol;
  }

  static wouldThisRankCauseLoss(
    rank,
    playerCards,
    boardCards,
    allPlayerCards = null
  ) {
    let allCards = [...playerCards, ...boardCards];

    if (allPlayerCards) {
      allCards = [...boardCards];
      allPlayerCards.forEach((playerCardSet) => {
        allCards = [...allCards, ...playerCardSet];
      });
    }

    const rankCounts = {};
    allCards.forEach((card) => {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    });

    if (rankCounts[rank] >= 2) {
      return true;
    }

    return false;
  }

  static describeStraight(combinations) {
    if (combinations.length === 0) return null;

    const neededCombinations = new Set();
    combinations.forEach((combo) => {
      const parts = combo.split("+");
      const turnRank = parts[0].replace(/[♠♥♦♣]/, "");
      const riverRank = parts[1].replace(/[♠♥♦♣]/, "");
      neededCombinations.add(`${turnRank}+${riverRank}`);
    });

    // Always show all combinations, regardless of count
    return `Every ${Array.from(neededCombinations).join(", ")}(Straight)`;
  }

  static describeThreeOfAKind(combinations, rankCounts) {
    if (combinations.length === 0) return null;

    // Check if player already has 2 of any rank
    for (const [rank, count] of Object.entries(rankCounts)) {
      if (count >= 2) {
        return `${rank}+Any Card(Three of a Kind)`;
      }
    }

    // Otherwise, need specific pairs
    const neededRanks = new Set();
    combinations.forEach((combo) => {
      const parts = combo.split("+");
      const turnRank = parts[0].replace(/[♠♥♦♣]/, "");
      const riverRank = parts[1].replace(/[♠♥♦♣]/, "");
      if (turnRank === riverRank) {
        neededRanks.add(turnRank);
      }
    });

    if (neededRanks.size > 0) {
      const ranks = Array.from(neededRanks).map((rank) => `${rank}+${rank}`);
      return `Every ${ranks.join(", ")}(Three of a Kind)`;
    }

    // If no matching pairs found, show all combinations
    const allCombinations = Array.from(
      new Set(
        combinations.map((combo) => {
          const parts = combo.split("+");
          return `${parts[0].replace(/[♠♥♦♣]/, "")}+${parts[1].replace(/[♠♥♦♣]/, "")}`;
        })
      )
    );
    return `Every ${allCombinations.join(", ")}(Three of a Kind)`;
  }

  static describeTwoPair(combinations, rankCounts) {
    if (combinations.length === 0) return null;

    const neededPairs = new Set();
    const neededSingles = new Set();

    combinations.forEach((combo) => {
      const parts = combo.split("+");
      const turnRank = parts[0].replace(/[♠♥♦♣]/, "");
      const riverRank = parts[1].replace(/[♠♥♦♣]/, "");

      if (turnRank === riverRank) {
        neededPairs.add(turnRank);
      } else {
        neededSingles.add(`${turnRank}+${riverRank}`);
      }
    });

    const descriptions = [];
    if (neededPairs.size > 0) {
      const pairs = Array.from(neededPairs).map((rank) => `${rank}+${rank}`);
      descriptions.push(`Every ${pairs.join(", ")}(Two Pair)`);
    }
    if (neededSingles.size > 0) {
      descriptions.push(
        `Every ${Array.from(neededSingles).join(", ")}(Two Pair)`
      );
    }

    return descriptions.join(", ");
  }

  static describePair(combinations, rankCounts) {
    if (combinations.length === 0) return null;

    const neededRanks = new Set();
    combinations.forEach((combo) => {
      const parts = combo.split("+");
      const turnRank = parts[0].replace(/[♠♥♦♣]/, "");
      const riverRank = parts[1].replace(/[♠♥♦♣]/, "");
      if (turnRank === riverRank) {
        neededRanks.add(turnRank);
      }
    });

    if (neededRanks.size > 0) {
      const ranks = Array.from(neededRanks).map((rank) => `${rank}+${rank}`);
      return `Every ${ranks.join(", ")}(Pair)`;
    }

    // If no matching pairs found, show all combinations
    const allCombinations = Array.from(
      new Set(
        combinations.map((combo) => {
          const parts = combo.split("+");
          return `${parts[0].replace(/[♠♥♦♣]/, "")}+${parts[1].replace(/[♠♥♦♣]/, "")}`;
        })
      )
    );
    return `Every ${allCombinations.join(", ")}(Pair)`;
  }
}

/**
 * Monte Carlo simulation for pre-flop win probability
 * @param {Array} players - Array of player objects with hole cards
 * @param {number} iterations - Number of Monte Carlo simulations (default: 10000)
 * @returns {Object} Results with win probabilities for each player
 */
function analyzePreFlop(players, iterations = 10000) {
  // Convert input to Card objects
  const playerCards = players.map((player) =>
    player.cards.map((card) => new Card(card.rank, card.suit))
  );

  // Collect all used cards
  const usedCards = [...playerCards.flat()];

  // Initialize results
  const results = {
    boardStage: "preflop",
    monteCarloIterations: iterations,
    totalSimulations: 0,
    tieCount: 0,
    playerResults: players.map((player, index) => ({
      playerId: player.id || index,
      winCount: 0,
      winPercentage: 0,
    })),
  };

  // Run Monte Carlo simulations
  for (let i = 0; i < iterations; i++) {
    // Draw random 5 community cards
    const communityCards = DeckGenerator.drawRandomCards(usedCards, 5);

    // Evaluate each player's hand
    const playerHands = playerCards.map((cards, index) => ({
      playerIndex: index,
      hand: HandEvaluator.evaluateHand(cards, communityCards),
    }));

    // Find winner(s) - check for ties
    const sortedHands = playerHands.sort((a, b) =>
      HandEvaluator.compareHands(b.hand.rank, a.hand.rank)
    );

    // Check if there's a clear winner (no tie)
    const bestHand = sortedHands[0];
    const isTie =
      sortedHands.length > 1 &&
      HandEvaluator.compareHands(
        bestHand.hand.rank,
        sortedHands[1].hand.rank
      ) === 0;

    // Count wins and ties
    if (!isTie) {
      const winnerResult = results.playerResults[bestHand.playerIndex];
      winnerResult.winCount++;
    } else {
      results.tieCount++;
    }

    results.totalSimulations++;
  }

  // Calculate win percentages
  results.playerResults.forEach((playerResult) => {
    playerResult.winPercentage =
      (playerResult.winCount / results.totalSimulations) * 100;
  });

  return results;
}

function analyzeOuts(boardState, players) {
  // Convert input to Card objects
  const boardCards = boardState.map((card) => new Card(card.rank, card.suit));
  const playerCards = players.map((player) =>
    player.cards.map((card) => new Card(card.rank, card.suit))
  );

  // Collect all used cards
  const usedCards = [...boardCards, ...playerCards.flat()];

  // Determine analysis type based on board card count
  const isFlop = boardCards.length === 3;
  const isTurn = boardCards.length === 4;

  // Initialize results
  const results = {
    boardStage: isFlop ? "flop" : isTurn ? "turn" : "unknown",
    totalCombinations: 0,
    totalTurnCombinations: 0,
    tieCount: 0,
    tiePercentage: 0,
    playerResults: players.map((player, index) => ({
      playerId: player.id || index,
      regularOuts: [],
      runnerRunnerOuts: [],
      regularWinCount: 0,
      runnerRunnerWinCount: 0,
      regularWinPercentage: 0,
      runnerRunnerWinPercentage: 0,
    })),
  };

  if (isFlop) {
    const turnCombinations =
      DeckGenerator.generateAllTurnCombinations(usedCards);
    results.totalTurnCombinations = turnCombinations.length;

    const turnRiverCombinations =
      DeckGenerator.generateAllTurnRiverCombinations(usedCards);
    results.totalCombinations = turnRiverCombinations.length;

    for (const combo of turnCombinations) {
      const fullBoard = [...boardCards, combo.turn];

      const playerHands = playerCards.map((cards, index) => ({
        playerIndex: index,
        hand: HandEvaluator.evaluateHand(cards, fullBoard),
      }));

      // Find winner(s) - check for ties
      const sortedHands = playerHands.sort((a, b) =>
        HandEvaluator.compareHands(b.hand.rank, a.hand.rank)
      );

      // Check if there's a clear winner (no tie)
      const bestHand = sortedHands[0];
      const isTie =
        sortedHands.length > 1 &&
        HandEvaluator.compareHands(
          bestHand.hand.rank,
          sortedHands[1].hand.rank
        ) === 0;

      // Only count as win if there's no tie
      if (!isTie) {
        const winnerResult = results.playerResults[bestHand.playerIndex];
        winnerResult.regularOuts.push({
          turn: combo.turn,
          hand: bestHand.hand,
        });
        winnerResult.regularWinCount++;
      }
    }

    // Analyze runner-runner outs (turn + river)
    for (const combo of turnRiverCombinations) {
      const fullBoard = [...boardCards, combo.turn, combo.river];

      // Evaluate each player's hand
      const playerHands = playerCards.map((cards, index) => ({
        playerIndex: index,
        hand: HandEvaluator.evaluateHand(cards, fullBoard),
      }));

      // Find winner(s) - check for ties
      const sortedHands = playerHands.sort((a, b) =>
        HandEvaluator.compareHands(b.hand.rank, a.hand.rank)
      );

      // Check if there's a clear winner (no tie)
      const bestHand = sortedHands[0];
      const isTie =
        sortedHands.length > 1 &&
        HandEvaluator.compareHands(
          bestHand.hand.rank,
          sortedHands[1].hand.rank
        ) === 0;

      // Only count as win if there's no tie
      if (!isTie) {
        const winnerResult = results.playerResults[bestHand.playerIndex];
        winnerResult.runnerRunnerOuts.push({
          turn: combo.turn,
          river: combo.river,
          hand: bestHand.hand,
        });
        winnerResult.runnerRunnerWinCount++;
      } else {
        // Count ties
        results.tieCount++;
      }
    }

    // Calculate win percentages
    results.playerResults.forEach((playerResult) => {
      playerResult.regularWinPercentage =
        (playerResult.regularWinCount / results.totalTurnCombinations) * 100;
      playerResult.runnerRunnerWinPercentage =
        (playerResult.runnerRunnerWinCount / results.totalCombinations) * 100;
    });

    results.tiePercentage =
      (results.tieCount / results.totalCombinations) * 100;

    // Find the winner (highest regular win percentage)
    const winner = results.playerResults.reduce((best, current) =>
      current.regularWinPercentage > best.regularWinPercentage ? current : best
    );

    // Add descriptive text for both regular and runner-runner outs
    results.playerResults.forEach((playerResult, index) => {
      if (playerResult !== winner) {
        // Regular outs description
        playerResult.regularOutsDescription =
          RegularOutsDescriber.describeRegularOuts(
            playerResult.regularOuts,
            playerCards[index],
            boardCards,
            playerCards
          );

        // Runner-runner outs description
        playerResult.runnerRunnerDescription =
          RunnerRunnerDescriber.describeRunnerRunnerOuts(
            playerResult.runnerRunnerOuts,
            playerCards[index],
            boardCards,
            playerCards,
            playerResult.regularOuts
          );
      } else {
        // Clear outs and descriptions for the winner
        playerResult.regularOuts = [];
        playerResult.runnerRunnerOuts = [];
        playerResult.regularOutsDescription =
          "Current winner - no regular outs needed";
        playerResult.runnerRunnerDescription =
          "Current winner - no runner-runner outs needed";
      }
    });
  } else if (isTurn) {
    // Turn: Only analyze regular outs (river only)

    // Generate all possible river combinations for regular outs analysis
    const riverCombinations =
      DeckGenerator.generateAllTurnCombinations(usedCards);
    results.totalTurnCombinations = riverCombinations.length;
    results.totalCombinations = riverCombinations.length; // Same for turn analysis

    // Analyze regular outs (river only)
    for (const combo of riverCombinations) {
      const fullBoard = [...boardCards, combo.turn]; // combo.turn is actually the river card

      // Evaluate each player's hand
      const playerHands = playerCards.map((cards, index) => ({
        playerIndex: index,
        hand: HandEvaluator.evaluateHand(cards, fullBoard),
      }));

      // Find winner(s) - check for ties
      const sortedHands = playerHands.sort((a, b) =>
        HandEvaluator.compareHands(b.hand.rank, a.hand.rank)
      );

      // Check if there's a clear winner (no tie)
      const bestHand = sortedHands[0];
      const isTie =
        sortedHands.length > 1 &&
        HandEvaluator.compareHands(
          bestHand.hand.rank,
          sortedHands[1].hand.rank
        ) === 0;

      // Only count as win if there's no tie
      if (!isTie) {
        const winnerResult = results.playerResults[bestHand.playerIndex];
        winnerResult.regularOuts.push({
          turn: combo.turn, // This is actually the river card
          hand: bestHand.hand,
        });
        winnerResult.regularWinCount++;
      } else {
        // Count ties
        results.tieCount++;
      }
    }

    // Calculate win percentages
    results.playerResults.forEach((playerResult) => {
      playerResult.regularWinPercentage =
        (playerResult.regularWinCount / results.totalTurnCombinations) * 100;
      playerResult.runnerRunnerWinPercentage = 0; // No runner-runner analysis on turn
    });

    results.tiePercentage =
      (results.tieCount / results.totalTurnCombinations) * 100;

    // Find the winner (highest regular win percentage)
    const winner = results.playerResults.reduce((best, current) =>
      current.regularWinPercentage > best.regularWinPercentage ? current : best
    );

    // Add descriptive text for regular outs only
    results.playerResults.forEach((playerResult, index) => {
      if (playerResult !== winner) {
        // Regular outs description (river cards)
        playerResult.regularOutsDescription =
          RegularOutsDescriber.describeRegularOuts(
            playerResult.regularOuts,
            playerCards[index],
            boardCards,
            playerCards
          );

        // No runner-runner outs on turn
        playerResult.runnerRunnerDescription =
          "No runner-runner outs available on turn";
      } else {
        // Clear outs and descriptions for the winner
        playerResult.regularOuts = [];
        playerResult.runnerRunnerOuts = [];
        playerResult.regularOutsDescription =
          "Current winner - no regular outs needed";
        playerResult.runnerRunnerDescription =
          "Current winner - no runner-runner outs needed";
      }
    });
  }

  return results;
}

function analyzeRunnerRunnerOuts(boardState, players) {
  const results = analyzeOuts(boardState, players);

  // Return only runner-runner specific data for backward compatibility
  return {
    totalCombinations: results.totalCombinations,
    tieCount: results.tieCount,
    tiePercentage: results.tiePercentage,
    playerResults: results.playerResults.map((player) => ({
      playerId: player.playerId,
      runnerRunnerOuts: player.runnerRunnerOuts,
      winCount: player.runnerRunnerWinCount,
      winPercentage: player.runnerRunnerWinPercentage,
      runnerRunnerDescription: player.runnerRunnerDescription,
    })),
  };
}

function createCard(rank, suit) {
  return { rank, suit };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    analyzeOuts,
    analyzeRunnerRunnerOuts,
    analyzePreFlop,
    createCard,
    Card,
    HandEvaluator,
    DeckGenerator,
    RegularOutsDescriber,
    RunnerRunnerDescriber,
  };
}
