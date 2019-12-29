/**
 * Taken from https://github.com/magwo/elevatorsaga/wiki/swiss-chris%27-solution
 */
{
    init: function(elevators, floors) {
        var topFloor = floors.length-1;

        // kept global for easier debugging
        var upFloors = {};
        var downFloors = {};
        for(var floorNum in floors){
            upFloors[floorNum] = 0;
            downFloors[floorNum] = 0;
        }

        /////////// register events ///////////////

        for(var elevatorNum in elevators){
            var elevator = elevators[elevatorNum];
            registerEventsForElevators(elevator);

            // additional fields needed on elevator objects
            elevator.gdtUp = true; // general direction of travel. true: up, false: down
            elevator.elevatorNum = elevatorNum;
        }

        for(var floorNum in floors){
            registerUpButtonPressed(floors[floorNum]);
            registerDownButtonPressed(floors[floorNum]);
        }

        function registerEventsForElevators(elevator){
            elevator.on("idle", function() {

                // 1.
                clearOrAddCurrentFloorWaiting(elevator);
                // 2. and 3.
                setNextDestinationInGDT(elevator, nextFloorInGDT(elevator));
                //
                if(elevator.destinationQueue.length === 0){
                    reverseGdt(elevator);
                    // 4. and 5.
                    setNextDestinationInGDT(elevator, elevator.currentFloor());
                }
                // 6. if nothing to do, return to floor 0
                if(elevator.destinationQueue.length === 0){
                    goToFloor(elevator, 0);
                    elevator.gdtUp = false; // we don't really need this, do we?
                }

                // purely for good form, set indicator lights (in case we changed direction last minute)
                var nextStop = elevator.destinationQueue[0];
                var currentFloor = elevator.currentFloor();
                if(nextStop > currentFloor){
                    setOneDirectionIndicator(elevator, true);
                } else if (nextStop < currentFloor){
                    setOneDirectionIndicator(elevator, false);
                }
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                setDirectionIndicatorWhenStoppedAtFloor(elevator);
            });
        }

        function registerUpButtonPressed(floor){
            floor.on("up_button_pressed", function() {
                addEntryFloor(upFloors, floor.floorNum());
            });
        }

        function registerDownButtonPressed(floor){
            floor.on("down_button_pressed", function() {
                addEntryFloor(downFloors, floor.floorNum());
            });
        }

        ////////////// called functions ///////////////

        function addEntryFloor(floorMap, floorNum){
            floorMap[floorNum]++;
        }

        function goToFloor(elevator, floorNum){
            elevator.goToFloor(floorNum);
        }

        function clearUpFloor(floorNum){
            upFloors[floorNum] = 0;
        }

        function clearDownFloor(floorNum){
            downFloors[floorNum] = 0;
        }

        function setOneDirectionIndicator(elevator, gdtUp){
            setGoingUpIndicator(elevator, gdtUp);
            setGoingDownIndicator(elevator, !gdtUp);
        }

        function setGoingUpIndicator(elevator, goingUp){
            elevator.goingUpIndicator(goingUp);
        }

        function setGoingDownIndicator(elevator, goingDown){
            elevator.goingDownIndicator(goingDown);
        }

        function isFloorSelected(floorMap, floorNum){
            return floorMap[floorNum] !== 0;
        }

        function isElevatorFull(elevator){
            var loadFactor = elevator.loadFactor();
            var maxPassengerCount = elevator.maxPassengerCount();
            var neededAvgPassengerSpace = 1.5;
            // e.g. loadFactor = 0.91 and max 10 passengers and neededAvgPassengerSpace = 1:
            // (1-0.91) = 0.09 < (1/10) = 0.1 so elevatorFull;
            var elevatorFull = (1-loadFactor) < (neededAvgPassengerSpace/maxPassengerCount)
            return elevatorFull;
        }

        function setDirectionIndicatorWhenStoppedAtFloor(elevator){
            var currentFloor = elevator.currentFloor();

            if(currentFloor === 0){
                elevator.gdtUp = true;
            } else if(currentFloor === topFloor){
                elevator.gdtUp = false;
            } else {
               // else keep gdtUp
            }

            setOneDirectionIndicator(elevator, elevator.gdtUp);
        }

        function clearOrAddCurrentFloorWaiting(elevator){
            var floorNum = elevator.currentFloor();

            if(isElevatorFull(elevator)){
                // keep entry waiting flag set for this floor in this direction
                if(elevator.gdtUp){
                    addEntryFloor(upFloors, floorNum);
                } else {
                    addEntryFloor(downFloors, floorNum);
                }
            } else {
                clearEntryWaiting(elevator.gdtUp, [floorNum]);
            }
        }

        function clearEntryWaiting(gdtUp, floorNums){
            for(var i in floorNums){
                var floorNum = floorNums[i];

                if(floorNum === 0){
                    clearUpFloor(floorNum);
                } else if (floorNum === topFloor){
                    clearDownFloor(floorNum);
                } else if(gdtUp){
                    clearUpFloor(floorNum);
                } else{
                    clearDownFloor(floorNum);
                }
            }
        }

        function setNextDestinationInGDT(elevator, searchFrom){
            if(elevator.gdtUp){
                setNextDestinationAbove(elevator, searchFrom);
            } else {
                setNextDestinationBelow(elevator, searchFrom);
            }
        }

        function setNextDestinationAbove(elevator, searchFrom){
            var nextDestination = -1;
            var entryFloorOppositeDirection = -1;
            var pressedFloors = elevator.getPressedFloors();

            for (var floorNum = searchFrom; floorNum < floors.length; floorNum++) {
                if(pressedFloors.indexOf(floorNum) !== -1){
                    clearEntryWaiting(true, [floorNum]);
                    nextDestination = floorNum;
                    break;
                }
                if(!isElevatorFull(elevator)){
                    if(isFloorSelected(upFloors, floorNum)){
                        clearEntryWaiting(true, [floorNum]);
                        nextDestination = floorNum;
                        break;
                    }
                    if(isFloorSelected(downFloors, floorNum)){
                        entryFloorOppositeDirection = floorNum;
                    }
                }
            };

            if(nextDestination === -1){
                if(entryFloorOppositeDirection !== -1){
                    clearEntryWaiting(false, [entryFloorOppositeDirection]);
                    reverseGdt(elevator);
                    nextDestination = entryFloorOppositeDirection;
                }
            }

            if(nextDestination !== -1){
                goToFloor(elevator, nextDestination);
            }
        }

        function setNextDestinationBelow(elevator, searchFrom){
            var nextDestination = -1;
            var entryFloorOppositeDirection = -1;
            var pressedFloors = elevator.getPressedFloors();

            for (var floorNum = searchFrom; floorNum >= 0; floorNum--) {
                if(pressedFloors.indexOf(floorNum) !== -1){
                    clearEntryWaiting(false, [floorNum]);
                    nextDestination = floorNum;
                    break;
                }
                if(!isElevatorFull(elevator)){
                    if(isFloorSelected(downFloors, floorNum)){
                        clearEntryWaiting(false, [floorNum]);
                        nextDestination = floorNum;
                        break;
                    }
                    if(isFloorSelected(upFloors, floorNum)){
                        entryFloorOppositeDirection = floorNum;
                    }
                }
            };

            if(nextDestination === -1){
                if(entryFloorOppositeDirection !== -1){
                    clearEntryWaiting(true, [entryFloorOppositeDirection]);
                    reverseGdt(elevator);
                    nextDestination = entryFloorOppositeDirection;
                }
            }

            if(nextDestination !== -1){
                goToFloor(elevator, nextDestination);
            }
        }

        function nextFloorInGDT(elevator){
            if(elevator.gdtUp){
                return elevator.currentFloor()+1;
            } else {
                return elevator.currentFloor()-1;
            }
        }

        function reverseGdt(elevator){
            elevator.gdtUp = !elevator.gdtUp;
        }
    },

    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}