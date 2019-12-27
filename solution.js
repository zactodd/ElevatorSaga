{
    init: function(elevators, floors) {
        var upWaiting = [];
        var downWaiting = [];

        for (var f = 0; f < floors.length; f++) {
            upWaiting.push(0);
            downWaiting.push(0);
        }

        var waiting = [downWaiting, upWaiting];
        
        
        function generalElevator(elevator, hub){
            elevator.on("idle", function() {
                console.log("Ele idle", hub);
                // let's go to all the floors (or did we forget one?)
                maxWaiting = 0;
                floorNum = 0;
                for (var f = 0; f < floors.length; f++){
                    waitingCount = upWaiting[f] + downWaiting[f];
                    if (waitingCount < elevator.maxPassengerCount() * 0.8){
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

            elevator.on("floor_button_pressed", function(floorNum) {
                // Maybe tell the elevator to go to that floor?
                elevator.goToFloor(floorNum);
            });

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
        
        function generalFloor(floor){
            var num = floor.floorNum();
            floor.on("up_button_pressed", function() {
                // Maybe tell an elevator to go to this floor?
                upWaiting[num] += 1;
            });
            
            floor.on("down_button_pressed", function() {
                // Maybe tell an elevator to go to this floor?
                downWaiting[num] += 1;
            });
        }
        
        for (var f = 0; f < floors.length; f++){
            generalFloor(floors[f]);
        }
        
        for (var e = 0; e < elevators.length; e++){
            generalElevator(elevators[e], e);
        }
       
    },
        
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
