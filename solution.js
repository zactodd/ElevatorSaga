{
    init: function(elevators, floors) {
        
        // Initialises the arrays represting the number of passengers waiting at each floor and the direction they are traveling.
        var upWaiting = [];
        var downWaiting = [];

        for (var f = 0; f < floors.length; f++) {
            upWaiting.push(0);
            downWaiting.push(0);
        }
        var waiting = [downWaiting, upWaiting];
        
        /**
        * Assigns the listerns to the a general elevator.
        * @param {elevator} elevator The elevator to add the listeners too.
        * @param {number} hub The unquie id for the elevator.
        */
        function generalElevator(elevator, hub){
            // When the elevator is idle goto a floor with passengers waiting.
            elevator.on("idle", function() {
                maxWaiting = 0;
                floorNum = 0;
                for (var f = 0; f < floors.length; f++){
                    waitingCount = upWaiting[f] + downWaiting[f];
                    if (waitingCount < elevator.maxPassengerCount()){
                        floorNum = f;
                        break;
                    }
                    if (waitingCount > maxWaiting){
                        maxWaiting = waitingCount;
                        floorNum = f;
                    }
                }
                elevator.goToFloor(floorNum, true);
                elevator.goToFloor(hub);
                elevator.goToFloor(floors.length - 1 - elevators.length + hub);
            });

            // Goes to floor a pressed floor if nothing in pressed floor queue.
            elevator.on("floor_button_pressed", function(floorNum) {
                elevator.goToFloor(floorNum);
            });

            // Reorders the elevator queue based on the direction the elevator is traveling. 
            elevator.on("passing_floor", function(floorNum, direction) {
                var boolDir = direction === "up" ? 1 : 0;
                var factDir = direction === "up" ? 1 : -1;
                var load = direction === "up" ? 1 : 0.4;
                
                if (elevator.getPressedFloors().includes(floorNum) || (elevator.loadFactor() < (load - floorNum * 0.01) && waiting[boolDir][floorNum])){
                    
                    upWaiting[floorNum] = 0;
                    downWaiting[floorNum] = 0;
                    
                    elevator.destinationQueue = elevator.getPressedFloors();
                    
                    for (var f = elevator.currentFloor; f < floors.length && f >= 0; f += factDir){
                        if (waiting[boolDir][f] && !elevator.destinationQueue.includes(f)){
                            elevator.destinationQueue.push(f)
                        }
                    }
                    
                    elevator.destinationQueue.sort((a, b) => factDir * ((elevator.currentFloor - a) % floors.length));
                    elevator.destinationQueue.push(boolDir ? floors.length - 1 : 0);

                    elevator.checkDestinationQueue();
                    elevator.goToFloor(floorNum, true);
                } 
            });
        }
        
        /**
        * An array of the next destinations for the other elevators. 
        * @param {number} hub The unquie id for the elevator.
        * @param {number} dsts The number of next destinations from the other elevators.
        * @return {Array.<number>}} An array ofthe next "dsts" destinations of each other elevator.
        */
        function otherElevatorNextDst(hub, dsts){
            others_next = [];
            for (var e = 0; e < elevators.length; e++){
                if (e != hub){
                    for (var d = 0; d < dsts; d ++ ){
                        others_next.push(elevators[e].destinationQueue[d]);
                    }
                }
            }
            return others_next;
        }
        
        /**
        * Assigns the listeners to the a general floor.
        * @param {floor} floor The floor to add the listners too.
        */
        function generalFloor(floor){
            // Updates the waiting arrays information.
            var num = floor.floorNum();
            floor.on("up_button_pressed", function() {
                upWaiting[num] += 1;
            });
            
            floor.on("down_button_pressed", function() {
                downWaiting[num] += 1;
            });
        }
       
        // Initialise each floor with the generalFloor listeners.
        for (var f = 0; f < floors.length; f++){
            generalFloor(floors[f]);
        }
        
        // Initialise each floor with the generalFloor listeners.
        for (var e = 0; e < elevators.length; e++){
            generalElevator(elevators[e], e);
        }
       
    }
}
