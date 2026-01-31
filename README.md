# Texas Hold'em Runner-Runner Analysis

A comprehensive JavaScript library for analyzing runner-runner outs in Texas Hold'em poker. This tool calculates all possible turn/river combinations and determines which player would win in each scenario. Now includes Monte Carlo simulation for pre-flop win probabilities.

## Features

- **Complete Hand Evaluation**: Supports all standard poker hand rankings
- **Runner-Runner Analysis**: Calculates all possible turn/river combinations
- **Pre-Flop Analysis**: Monte Carlo simulation for win probabilities before the flop
- **Multiple Players**: Supports 2+ players in a single analysis
- **Detailed Results**: Provides win percentages, hand types, and example combinations
- **Descriptive Text**: Human-readable descriptions of runner-runner outs grouped by hand type
- **Winner Focus**: Current winner shows no runner-runner outs (they don't need them to win)
- **Tie Handling**: Properly handles ties (no win credited to any player)
- **High Performance**: Optimized for speed with efficient algorithms
- **Clean API**: Easy-to-use functions with structured input/output

## Installation

No dependencies required! Just include the main file in your project.

```javascript
const {
  analyzeRunnerRunnerOuts,
  analyzePreFlop,
  createCard,
} = require("./texas-holdem-runner-runner.js");
```

## Quick Start

```javascript
// Define the board state (3 cards)
const boardState = [
  createCard("9", "club"),
  createCard("4", "spade"),
  createCard("4", "heart"),
];

// Define players with their hole cards
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

console.log(`Total combinations: ${results.totalCombinations}`);
console.log(`Ties: ${results.tieCount}`);
console.log(
  `Player 1 win percentage: ${results.playerResults[0].winPercentage.toFixed(
    2
  )}%`
);
console.log(
  `Player 1 description: ${results.playerResults[0].runnerRunnerDescription}`
);
console.log(
  `Player 2 win percentage: ${results.playerResults[1].winPercentage.toFixed(
    2
  )}%`
);
console.log(
  `Player 2 description: ${results.playerResults[1].runnerRunnerDescription}`
);
```

## API Reference

### `analyzeRunnerRunnerOuts(boardState, players)`

Analyzes all possible turn/river combinations for the given board state and players.

**Parameters:**

- `boardState` (Array): Array of 3 card objects representing the flop
- `players` (Array): Array of player objects with their hole cards

**Returns:**

- `Object`: Analysis results containing:
  - `totalCombinations`: Total number of turn/river combinations analyzed
  - `tieCount`: Number of combinations that resulted in ties (not counted as wins)
  - `playerResults`: Array of results for each player

**Player Result Object:**

- `playerId`: Player identifier
- `winCount`: Number of winning combinations
- `winPercentage`: Win percentage (0-100)
- `runnerRunnerOuts`: Array of winning turn/river combinations (empty for current winner)
- `runnerRunnerDescription`: Human-readable description of runner-runner outs (shows "Current winner - no runner-runner outs needed" for winner)

### `analyzePreFlop(players, iterations)`

Monte Carlo simulation for pre-flop win probabilities. Runs random board simulations to estimate win rates when no community cards are visible.

**Parameters:**

- `players` (Array): Array of player objects with their hole cards
- `iterations` (Number, optional): Number of Monte Carlo simulations (default: 10000)

**Returns:**

- `Object`: Analysis results containing:
  - `boardStage`: "preflop"
  - `monteCarloIterations`: Number of iterations run
  - `totalSimulations`: Total simulations completed
  - `tieCount`: Number of simulations that resulted in ties
  - `playerResults`: Array of results for each player

**Player Result Object:**

- `playerId`: Player identifier
- `winCount`: Number of winning simulations
- `winPercentage`: Win percentage (0-100)

### `createCard(rank, suit)`

Creates a card object in the required format.

**Parameters:**

- `rank` (String): Card rank ('2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A')
- `suit` (String): Card suit ('spade', 'heart', 'diamond', 'club')

**Returns:**

- `Object`: Card object with `rank` and `suit` properties

## Examples

### Example 1: Basic Analysis

```javascript
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
// Results show flush draw has ~97% win probability
// Description: "601 combinations(Straight), Every 2 ♥(Flush), J♠+A♠(Royal Flush)"
```

### Example 2: Multiple Players

```javascript
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
// Results show straight draw wins ~68%, pair wins ~32%, high card wins ~0.1%
// Descriptions show what cards each player needs to win
```

### Example 3: Pre-Flop Monte Carlo Analysis

```javascript
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

const results = analyzePreFlop(players, 10000);
// Results show AA wins ~70%, KQs wins ~18%, 72o wins ~12%
// Accurate pre-flop equity estimation using Monte Carlo simulation
```

## Hand Rankings

The library supports all standard poker hand rankings:

1. **Royal Flush**: A, K, Q, J, 10 of the same suit
2. **Straight Flush**: Five consecutive cards of the same suit
3. **Four of a Kind**: Four cards of the same rank
4. **Full House**: Three of a kind + a pair
5. **Flush**: Five cards of the same suit
6. **Straight**: Five consecutive cards
7. **Three of a Kind**: Three cards of the same rank
8. **Two Pair**: Two different pairs
9. **One Pair**: Two cards of the same rank
10. **High Card**: Highest card when no other hand is made

## Descriptive Text Format

The library provides human-readable descriptions of runner-runner outs, grouped by hand ranking:

- **Royal Flush**: `J♠+A♠(Royal Flush)`
- **Straight Flush**: `3♠+6♠(Straight Flush)`
- **Four of a Kind**: `2♥+Any Card(Four of a Kind)` or `Every 2+2(Four of a Kind)`
- **Full House**: `Every 7+7(Full House)` or `Every 5+6(Full House)`
- **Flush**: `Every 2X♣(Flush)` (any 2 clubs)
- **Straight**: `Every 3+5(Straight)` (any 3 and 5)
- **Three of a Kind**: `3+Any Card(Three of a Kind)` or `Every 3+3(Three of a Kind)`
- **Two Pair**: `Every 3+5(Two Pair)` or `Every 4+4(Two Pair)`
- **Pair**: `5+Any Card(Pair)`

## Performance

- **Typical Analysis**: ~1,000 combinations in <250ms
- **Pre-Flop Monte Carlo**: 10,000 iterations in <2s
- **Memory Efficient**: Optimized algorithms for large-scale analysis
- **Scalable**: Handles multiple players efficiently

## Testing

Run the test suite to verify functionality:

```bash
node test-runner-runner.js
```

Run examples to see the library in action:

```bash
node example-usage.js
```

## Use Cases

- **Poker Strategy**: Analyze drawing hands and runner-runner possibilities
- **Game Development**: Build poker analysis tools and simulators
- **Educational**: Learn about poker probabilities and hand evaluation
- **Research**: Study poker mathematics and probability theory

## Technical Details

### Algorithm

**Flop/Turn Analysis:**
1. Generate all possible turn/river combinations from remaining deck
2. For each combination, evaluate each player's best 5-card hand
3. Determine winner(s) based on hand rankings
4. **Tie Handling**: If players have identical hand strength, count as tie (not a win)
5. Aggregate results and calculate win percentages

**Pre-Flop Analysis:**
1. Use Monte Carlo simulation with configurable iterations (default: 10,000)
2. For each iteration, randomly shuffle and draw 5 community cards
3. Evaluate each player's best 5-card hand
4. Determine winner(s) and handle ties properly
5. Calculate win probabilities based on simulation results

### Hand Evaluation

- Uses efficient combination generation for 5-card hand selection
- Implements standard poker hand ranking with proper tie-breaking
- Supports all edge cases including A-2-3-4-5 straights

### Memory Management

- Generates combinations on-demand to minimize memory usage
- Efficient card representation and comparison
- Optimized for large-scale analysis

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit issues, feature requests, or pull requests.

## Support

For questions or support, please open an issue in the repository.
