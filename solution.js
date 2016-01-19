{
  init: function(elevators, floors) {
    var maxFloor = floors.length - 1;
    var num = 0;
    var q = [];

    function sortQueue(elevator) {
      elevator.destinationQueue.sort(function(a, b){return a-b});
      if (elevator.currentFloor() > elevator.destinationQueue[0]) {
        elevator.destinationQueue.sort(function(a, b){return b-a});
      }
    }

    function assignFloor(elevator, floorNum, force) {
      if (elevator.destinationQueue.indexOf(floorNum) < 0) {
        if (force) {
          elevator.destinationQueue.unshift(floorNum);
        } else {
          elevator.destinationQueue.push(floorNum);
          sortQueue(elevator);
        }
      }
      elevator.checkDestinationQueue();
    }

    function buttonPressed(floorNum, direction) {
      if (!q.some(function(f) {return f === floorNum})) {
        q.push(floorNum);
      }
    }

    _.each(floors, function(floor) {
      floor.on("up_button_pressed down_button_pressed", function(event) {
        var direction = event.indexOf('up') == 0 ? 'up' : 'down';
        buttonPressed(floor.level, direction);
      });
    });

    _.each(elevators, function(elevator) {
      elevator.num = num++;

      elevator.on("floor_button_pressed", function(floorNum) {
        assignFloor(elevator, floorNum);
      });

      elevator.on("passing_floor", function(floorNum, direction) {
        console.log('passing_floor ' + floorNum + ' by ' + elevator.num + ' going ' + direction);
        if (elevator.loadFactor() <= 0.6) {
          if ((floors[floorNum].buttonStates.down && direction == "down") || (floors[floorNum].buttonStates.up && direction == "up")) {
            assignFloor(elevator, floorNum, true);
          }
        }
      });

      elevator.on("stopped_at_floor", function(floorNum) {
        var s = q.indexOf(floorNum);
        if (s >= 0) {
          q.splice(s, 1);
        }
      });

      elevator.on("idle", function() {
        if (q.length) {
          assignFloor(elevator, q.shift());
        } else {
          assignFloor(elevator, 0);
        }
      });

    });
  },
  update: function(dt, elevators, floors) {
  }
}
