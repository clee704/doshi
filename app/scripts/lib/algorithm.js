/* global shuffle */
/* exported hillClimbing */
'use strict';


function hillClimbing(problem) {
  var minFitness = problem.evaluate();
  var bestMove;
  while (true) {
    bestMove = undefined;
    var moves = problem.moves();
    shuffle(moves);
    for (var i = 0; i < moves.length; i++) {
      var move = moves[i];
      problem.move(move);
      var fitness = problem.evaluate();
      if (problem.compareFitness(fitness, minFitness) < 0) {
        minFitness = fitness;
        bestMove = move;
      }
      problem.undo();
    }
    if (bestMove === undefined) break;
    problem.move(bestMove);
  }
  return minFitness;
}
