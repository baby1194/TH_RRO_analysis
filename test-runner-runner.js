/**
 * Test suite for Texas Hold'em Runner-Runner Analysis
 */

const { analyzeRunnerRunnerOuts, createCard, Card, HandEvaluator } = require('./texas-holdem-runner-runner.js');

// Test helper functions
function runTest(testName, testFunction) {
    console.log(`\n=== ${testName} ===`);
    try {
        const result = testFunction();
        console.log('✅ PASSED');
        return result;
    } catch (error) {
        console.log('❌ FAILED:', error.message);
        return null;
    }
}

// Test 1: Basic hand evaluation
function testHandEvaluation() {
    const card1 = new Card('A', 'spade');
    const card2 = new Card('A', 'heart');
    const card3 = new Card('A', 'diamond');
    const card4 = new Card('A', 'club');
    const card5 = new Card('K', 'spade');
    
    const hand = HandEvaluator.evaluateHand([card1, card2], [card3, card4, card5]);
    console.log('Four of a kind hand:', hand);
    
    if (hand.rank.ranking !== 8) { // FOUR_OF_A_KIND
        throw new Error('Expected four of a kind, got ranking: ' + hand.rank.ranking);
    }
    
    return hand;
}

// Test 2: Simple runner-runner analysis
function testSimpleRunnerRunner() {
    const boardState = [
        createCard('9', 'club'),
        createCard('4', 'spade'),
        createCard('4', 'heart')
    ];
    
    const players = [
        {
            id: 'player1',
            cards: [
                createCard('6', 'club'),
                createCard('8', 'club')
            ]
        },
        {
            id: 'player2',
            cards: [
                createCard('Q', 'club'),
                createCard('4', 'heart')
            ]
        }
    ];
    
    const results = analyzeRunnerRunnerOuts(boardState, players);
    
    console.log('Total combinations:', results.totalCombinations);
    console.log('Player 1 wins:', results.playerResults[0].winCount);
    console.log('Player 2 wins:', results.playerResults[1].winCount);
    
    // Player 2 should win most of the time (has two pair)
    if (results.playerResults[1].winCount < results.playerResults[0].winCount) {
        throw new Error('Player 2 should win more often than Player 1');
    }
    
    return results;
}

// Test 3: Flush draw analysis
function testFlushDraw() {
    const boardState = [
        createCard('A', 'heart'),
        createCard('K', 'heart'),
        createCard('Q', 'spade')
    ];
    
    const players = [
        {
            id: 'flush_draw',
            cards: [
                createCard('J', 'heart'),
                createCard('10', 'heart')
            ]
        },
        {
            id: 'pair',
            cards: [
                createCard('A', 'spade'),
                createCard('2', 'club')
            ]
        }
    ];
    
    const results = analyzeRunnerRunnerOuts(boardState, players);
    
    console.log('Flush draw player wins:', results.playerResults[0].winCount);
    console.log('Pair player wins:', results.playerResults[1].winCount);
    
    // Flush draw should have good runner-runner chances
    const flushDrawPercentage = results.playerResults[0].winPercentage;
    console.log('Flush draw win percentage:', flushDrawPercentage.toFixed(2) + '%');
    
    if (flushDrawPercentage < 10) {
        throw new Error('Flush draw should have reasonable win percentage');
    }
    
    return results;
}

// Test 4: Straight draw analysis
function testStraightDraw() {
    const boardState = [
        createCard('9', 'spade'),
        createCard('8', 'heart'),
        createCard('7', 'club')
    ];
    
    const players = [
        {
            id: 'straight_draw',
            cards: [
                createCard('6', 'spade'),
                createCard('5', 'heart')
            ]
        },
        {
            id: 'high_card',
            cards: [
                createCard('A', 'spade'),
                createCard('K', 'club')
            ]
        }
    ];
    
    const results = analyzeRunnerRunnerOuts(boardState, players);
    
    console.log('Straight draw player wins:', results.playerResults[0].winCount);
    console.log('High card player wins:', results.playerResults[1].winCount);
    
    const straightDrawPercentage = results.playerResults[0].winPercentage;
    console.log('Straight draw win percentage:', straightDrawPercentage.toFixed(2) + '%');
    
    return results;
}

// Test 5: Edge case - Royal flush possibility
function testRoyalFlushPossibility() {
    const boardState = [
        createCard('A', 'spade'),
        createCard('K', 'spade'),
        createCard('Q', 'spade')
    ];
    
    const players = [
        {
            id: 'royal_flush_draw',
            cards: [
                createCard('J', 'spade'),
                createCard('10', 'spade')
            ]
        },
        {
            id: 'other',
            cards: [
                createCard('A', 'heart'),
                createCard('A', 'club')
            ]
        }
    ];
    
    const results = analyzeRunnerRunnerOuts(boardState, players);
    
    console.log('Royal flush draw player wins:', results.playerResults[0].winCount);
    console.log('Other player wins:', results.playerResults[1].winCount);
    
    // Check if any winning combinations are royal flush
    const royalFlushWins = results.playerResults[0].runnerRunnerOuts.filter(out => 
        out.hand.rank.ranking === 10 // ROYAL_FLUSH
    );
    
    console.log('Royal flush wins:', royalFlushWins.length);
    
    return results;
}

// Test 6: Performance test
function testPerformance() {
    const boardState = [
        createCard('A', 'spade'),
        createCard('K', 'heart'),
        createCard('Q', 'club')
    ];
    
    const players = [
        {
            id: 'player1',
            cards: [
                createCard('J', 'spade'),
                createCard('10', 'heart')
            ]
        },
        {
            id: 'player2',
            cards: [
                createCard('9', 'spade'),
                createCard('8', 'heart')
            ]
        }
    ];
    
    const startTime = Date.now();
    const results = analyzeRunnerRunnerOuts(boardState, players);
    const endTime = Date.now();
    
    console.log('Analysis completed in:', (endTime - startTime) + 'ms');
    console.log('Total combinations processed:', results.totalCombinations);
    
    return results;
}

// Run all tests
function runAllTests() {
    console.log('🧪 Running Texas Hold\'em Runner-Runner Analysis Tests\n');
    
    testHandEvaluation();
    testSimpleRunnerRunner();
    testFlushDraw();
    testStraightDraw();
    testRoyalFlushPossibility();
    testPerformance();
    
    console.log('\n🎉 All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runAllTests();
}

module.exports = {
    runAllTests,
    testHandEvaluation,
    testSimpleRunnerRunner,
    testFlushDraw,
    testStraightDraw,
    testRoyalFlushPossibility,
    testPerformance
};
