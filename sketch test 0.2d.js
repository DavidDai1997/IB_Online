function draw() {
    background(0);
    fill(255);

    if (!soundLoadedFlag) {
        text('Loading sounds...', width / 2, height / 2);
    } else if (experimentEnded) {
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Demo Over", width / 2, height / 2);
    } else if (trialPhase === -2) {
        // Display condition message and wait for key press to start
        if (keyPressOccurred && experimentStarted) {
            userStartAudio(); // Resume the AudioContext
            keyPressOccurred = false; // Reset key press flag
            document.getElementById('messageContainer').style.display = 'none';

            if (!canvasCreated) {
                let canvas = createCanvas(1920, 1080);
                centerCanvas();
                textAlign(CENTER, CENTER);
                textSize(32);
                canvasCreated = true;

                // Initialize the center and radius for the gray dots
                centerX = width / 2;
                centerY = height / 2;
                radius = min(width, height) / 3;
                angleStep = TWO_PI / numDots;

                // Calculate positions of the gray dots
                for (let i = 0; i < numDots; i++) {
                    let angle = i * angleStep;
                    let x = centerX + cos(angle) * radius;
                    let y = centerY + sin(angle) * radius;
                    grayDots.push(createVector(x, y));
                }

                // Start with the red dot at a random position
                redDotPositionIndex = int(random(numDots));

                // Set the participant ID in the hidden form field
                let participantIDField = document.getElementById('participantID');
                if (participantIDField) {
                    participantIDField.value = participantID;
                } else {
                    console.error('Participant ID field not found');
                }
            }

            // Select two random colors for the Passive_Attention condition
            if (condition === "Passive_Attention") {
                selectedColors = randomTwoColors(fixationColors);
                colorCycleIndex = 0;
                colorFrames = 0; // Reset color frames
            }

            trialPhase = 0; // Move to the next phase
            if (condition === "Passive_Attention") {
                computerActionFrame = int(random([75, 105, 135, 165])); // Set the computer action frame for Passive_Attention condition
                washOutDuration = int(random([30, 60, 90, 120])); // Ensure washout duration makes the total duration divisible by 30
            }
        }
    } else if (trialPhase === 0) {
        // Blank screen for 30 frames
        document.body.style.cursor = 'none'; // Hide cursor
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 1) {
        // Clockface shows for 30 frames
        document.body.style.cursor = 'none'; // Hide cursor
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 2) {
        // Red dot appears randomly at one of the gray dot positions and starts rotating
        document.body.style.cursor = 'none'; // Hide cursor
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        frameCount++;
        console.log(`Phase: 2, Color Index: ${colorCycle[colorCycleIndex]}, Frame Count: ${frameCount}`);

        if (frameCount === computerActionFrame) {
            keypressSoundFile.play(); // Play the keypress sound
            playSoundFrame = frameCount + 15; // Set the frame to play the pool sound
            timeBeforeAction = frameCount;
            trialPhase++;
            frameCount = 0; // Reset the frame count for the next phase
        }

        if (condition === "Passive_Attention") {
            // Change the fixation color every 30 frames
            if (colorFrames < 30) {
                colorFrames++;
            } else {
                colorCycleIndex = (colorCycleIndex + 1) % 4; // Cycle through 1 -> 0 -> 2 -> 0
                colorFrames = 1; // Reset color frames to 1
            }
            applyColor(colorCycle[colorCycleIndex]);
            ellipse(centerX, centerY, 16, 16); // Draw fixation point with changing color, same size as red dot
        } else {
            fill(255); // White fixation point for other conditions
            ellipse(centerX, centerY, 16, 16); // Draw fixation point, same size as red dot
        }
    } else if (trialPhase === 3) {
        // Continue rotating for 15 frames after keypress in Agency condition
        document.body.style.cursor = 'none'; // Hide cursor
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        frameCount++;
        console.log(`Phase: 3, Frame Count: ${frameCount}`);

        if (frameCount === 15) {
            soundFile.play(); // Play the pool sound
            realDotIndex = redDotPositionIndex;
            frameCount = 0;
            trialPhase++;
        }

        if (condition === "Passive_Attention") {
            // Continue the color change loop
            if (colorFrames < 30) {
                colorFrames++;
            } else {
                colorCycleIndex = (colorCycleIndex + 1) % 4; // Cycle through 1 -> 0 -> 2 -> 0
                colorFrames = 1; // Reset color frames to 1
            }
            applyColor(colorCycle[colorCycleIndex]);
            ellipse(centerX, centerY, 16, 16); // Draw fixation point with changing color, same size as red dot
        } else {
            fill(255); // White fixation point for other conditions
            ellipse(centerX, centerY, 16, 16); // Draw fixation point, same size as red dot
        }
    } else if (trialPhase === 4) {
        // Red dot keeps rotating for washOutDuration frames after pool sound
        document.body.style.cursor = 'none'; // Hide cursor
        drawClockface();
        drawRedDot();
        frameCount++;
        console.log(`Phase: 4, Color Index: ${colorCycle[colorCycleIndex]}, Frame Count: ${frameCount}`);

        if (frameCount < washOutDuration) {
            redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        } else {
            frameCount = 0;
            trialPhase++;
        }

        if (condition === "Passive_Attention") {
            // Continue the color change loop
            if (colorFrames < 30) {
                colorFrames++;
            } else {
                colorCycleIndex = (colorCycleIndex + 1) % 4; // Cycle through 1 -> 0 -> 2 -> 0
                colorFrames = 1; // Reset color frames to 1
            }
            applyColor(colorCycle[colorCycleIndex]);
            ellipse(centerX, centerY, 16, 16); // Draw fixation point with changing color, same size as red dot
        } else {
            fill(255); // White fixation point for other conditions
            ellipse(centerX, centerY, 16, 16); // Draw fixation point, same size as red dot
        }
    } else if (trialPhase === 5) {
        // Clockface remains for 30 frames
        document.body.style.cursor = 'none'; // Hide cursor
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 6) {
        // Blank screen for 30 frames
        document.body.style.cursor = 'none'; // Hide cursor
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 7) {
        // Response stage
        document.body.style.cursor = 'default'; // Show cursor
        drawClockfaceWithHover();
        fill(255); // Draw fixation point
        ellipse(centerX, centerY, 16, 16); // Draw fixation point, same size as red dot
        if (mouseIsPressed) {
            if (selectedDotIndex !== -1) {
                // Log and submit response
                dotDistance = calculateDotDistance(realDotIndex, selectedDotIndex);
                timeEstimationError = dotDistance * 16.666;

                let selectedDotIndexField = document.getElementById('selectedDotIndex');
                let conditionField = document.getElementById('condition');
                let timeBeforeActionField = document.getElementById('timeBeforeAction');
                let trialNumberField = document.getElementById('trialNumber');
                let realDotIndexField = document.getElementById('realDotIndex');
                let dotDistanceField = document.getElementById('dotDistance');
                let timeEstimationErrorField = document.getElementById('timeEstimationError');
                let washOutDurationField = document.getElementById('washOutDuration'); // New field

                if (selectedDotIndexField && conditionField && timeBeforeActionField && trialNumberField && realDotIndexField && dotDistanceField && timeEstimationErrorField && washOutDurationField) {
                    selectedDotIndexField.value = selectedDotIndex;
                    conditionField.value = condition;
                    timeBeforeActionField.value = timeBeforeAction;
                    trialNumberField.value = trialNumber;
                    realDotIndexField.value = realDotIndex;
                    dotDistanceField.value = dotDistance;
                    timeEstimationErrorField.value = timeEstimationError;
                    washOutDurationField.value = washOutDuration; // Log washOutDuration

                    // Submit form
                    document.getElementById('responseForm').submit();
                } else {
                    console.error('Form fields not found');
                }

                trialPhase++;
                showPlaySymbol = true; // Show play symbol after response
            }
        }
    } else if (trialPhase === 8) {
        // End of current trial
        if (showPlaySymbol) {
            drawPlaySymbol();
        }
    }

    if (showPlaySymbol) {
        drawPlaySymbol();
    }
}

function applyColor(index) {
    switch (index) {
        case 1:
            fill(selectedColors[0]);
            break;
        case 2:
            fill(selectedColors[1]);
            break;
        case 0:
        default:
            fill(255); // White
            break;
    }
}
