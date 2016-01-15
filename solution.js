{
  init: function(elevators, floors) {

    function sortQueueAndRoute(elevator) {
      if (elevator.destinationDirection() == "up") {
        elevator.destinationQueue.sort(function(a, b){return a-b});
      } else {
        elevator.destinationQueue.sort(function(a, b){return b-a});
      }
      elevator.checkDestinationQueue();
    }

    function assignFloor(elevator, floorNum) {
      elevator.goToFloor(floorNum, true);
      sortQueueAndRoute(elevator);
      //console.log('floor ' + floorNum + ' assigned to elevator ' + elevator.num);
    }

    function handleHallButtonPress(floorNum, direction) {
      var noluck = true;
      for (i = 0; i < elevators.length; i++) {
        var elevator = elevators[i];
        if (elevator.loadFactor() > 0.7) { continue; }
        if (elevator.currentFloor() - 1 < floorNum && elevator.currentFloor() + 1 > floorNum ) { assignFloor(elevator, floorNum); noluck = false; break; }
        if (elevator.destinationQueue.length >= 1) { continue; }
        if (elevator.loadFactor() === 0) { assignFloor(elevator, floorNum); noluck = false; break; }
      }
      // random assignment
      if (noluck) { assignFloor(elevators[(rotator++) % elevators.length], floorNum); }
    }

    var rotator = 0;
    _.each(floors, function(floor) {
      floor.on("up_button_pressed down_button_pressed", function(event) {
        var direction = event.indexOf('up') == 0 ? 'up' : 'down';
        handleHallButtonPress(floor.level, direction);
      });
    });

    var num = 0;
    _.each(elevators, function(elevator) {
      elevator.num = num++;
      elevator.on("floor_button_pressed", function(floorNum) {
        elevator.goToFloor(floorNum);
        sortQueueAndRoute(elevator);
        //console.log('elevator ' + elevator.num + ' going to floor ' + floorNum);
      });
      //elevator.on("idle", function() { elevator.goToFloor(0); });
    });

  },
  update: function(dt, elevators, floors) {
    // We normally don't need to do anything here
  }
}
