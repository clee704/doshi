/* global shuffle */
/* exported hill_climbing */
'use strict';


function hill_climbing(problem) {
  var min_fitness = problem.evaluate();
  var best_move;
  while (true) {
    best_move = undefined;
    var moves = problem.moves();
    shuffle(moves);
    for (var i = 0; i < moves.length; i++) {
      var move = moves[i];
      problem.move(move);
      var fitness = problem.evaluate();
      if (problem.compare_fitness(fitness, min_fitness) < 0) {
        min_fitness = fitness;
        best_move = move;
      }
      problem.undo();
    }
    if (best_move === undefined) break;
    problem.move(best_move);
  }
  return min_fitness;
}
