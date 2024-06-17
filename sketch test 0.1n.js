let centerX, centerY, radius;
let numDots = 120;
let angleStep;
let grayDots = [];
let trialPhase = -1; // Start with the welcome phase
let frameCount = 0;
let keyPressOccurred = false;
let rotationContinuedFrames = 60;
let redDotPositionIndex = 0;
let soundFile, keypressSoundFile;
let soundLoadedFlag = false;
let playSoundFrame = -1;
let selectedDotIndex = -1;
let participantID = generateUniqueID(); // Generate a unique ID for each participant
let subjectNumber, age, condition, trialNumber = 1, realDotIndex, timeBeforeAction;
let dotDistance, timeEstimationError;
let experimentStarted = false; // To track if the experiment has started
let computerActionFrame = -1; // Frame at which the computer triggers the sound in Passive condition
let conditionsOrder = []; // Order of conditions for the participant
let canvasCreated = false; // Track if the canvas is created
let totalTrialsPerCondition = 4; // Number of trials for each condition
let currentConditionIndex = 0;
let showPlaySymbol = false;
let experimentEnded = false; // Flag to indicate the experiment has ended
let washOutDuration; // New washOutDuration variable

// New variables for Passive_Attention condition
let fixationColors = ['red', 'blue', 'green'];
let selectedColors = []; // Colors selected for each trial
let currentColorIndex = 0; // Track the current color index for the color-changing loop

function preload() {
    console.log('Preloading sounds...');
    soundFile = loadSound('Pool2_44100.wav', soundLoaded, loadError);
    keypressSoundFile = loadSound('keypress_44100.wav', soundLoaded, loadError);
}

function startExperiment() {
    subjectNumber = document.getElementById('subjectNumber').value;
    age = document.getElementById('age').value;

    if (subjectNumber && age) {
        document.getElementById('subjectNumberField').value = subjectNumber;
        document.getElementById('ageField').value = age;
        document.getElementById('inputContainer').style.display = 'none';

        // Skip Agency and Passive trials, directly go to Passive_Attention for debugging
        conditionsOrder = ["Passive_Attention"];

        experimentStarted = true; // Indicate the experiment has started
        condition = conditionsOrder[currentConditionIndex];
        document.getElementById('messageContainer').innerText = `This is ${condition} condition, press the space key to start`;
        document.getElementById('messageContainer').style.display = 'block';
        trialPhase = -2; // Indicate that we are showing the initial condition message
    } else {
        alert("Please enter both Subject Number and Age.");
    }
}

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
                currentColorIndex = 0;
            }

            trialPhase = 0; // Move to the next phase
            if (condition === "Passive_Attention") {
                computerActionFrame = int(random([60, 90, 120, 150])); // Set the computer action frame for Passive_Attention condition
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

        if (frameCount === computerActionFrame) {
            keypressSoundFile.play(); // Play the keypress sound
            playSoundFrame = frameCount + 15; // Set the frame to play the pool sound
            timeBeforeAction = frameCount;
            trialPhase++;
            frameCount = 0; // Reset the frame count for the next phase
        }

        if (condition === "Passive_Attention") {
            // Change the fixation color every 30 frames
            if (frameCount % 30 === 0) {
                currentColorIndex = (currentColorIndex + 1) % 4; // 0, 1, 2, 3 cycle
            }
            if (currentColorIndex % 2 === 0) {
                fill(selectedColors[Math.floor(currentColorIndex / 2)]);
            } else {
                fill(255); // White
            }
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

        if (frameCount === 15) {
            soundFile.play(); // Play the pool sound
            realDotIndex = redDotPositionIndex;
            washOutDuration = int(random([30, 60, 90, 120])); // Set washOutDuration
            frameCount = 0;
            trialPhase++;
        } else {
            frameCount++;
        }

        if (condition === "Passive_Attention") {
            // Change the fixation color every 30 frames
            if (frameCount % 30 === 0) {
                currentColorIndex = (currentColorIndex + 1) % 4; // 0, 1, 2, 3 cycle
            }
            if (currentColorIndex % 2 === 0) {
                fill(selectedColors[Math.floor(currentColorIndex / 2)]);
            } else {
                fill(255); // White
            }
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
        if (frameCount < washOutDuration) {
            frameCount++;
            redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        } else {
            frameCount = 0;
            trialPhase++;
        }

        if (condition === "Passive_Attention") {
            // Change the fixation color every 30 frames
            if (frameCount % 30 === 0) {
                currentColorIndex = (currentColorIndex + 1) % 4; // 0, 1, 2, 3 cycle
            }
            if (currentColorIndex % 2 === 0) {
                fill(selectedColors[Math.floor(currentColorIndex / 2)]);
            } else {
                fill(255); // White
            }
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

function drawPlaySymbol() {
    const triangleSize = 30;
    let isHovering = dist(mouseX, mouseY, centerX, centerY) < triangleSize;

    fill(isHovering ? 'green' : 'grey');
    noStroke();
    triangle(centerX - triangleSize / 2, centerY - triangleSize / 2, centerX - triangleSize / 2, centerY + triangleSize / 2, centerX + triangleSize / 2, centerY);

    if (mouseIsPressed && isHovering) {
        showPlaySymbol = false; // Hide play symbol
        document.body.style.cursor = 'none'; // Hide cursor for the next trial
        if (trialNumber < totalTrialsPerCondition * conditionsOrder.length) {
            // Select new colors for each trial
            if (condition === "Passive_Attention") {
                selectedColors = randomTwoColors(fixationColors);
                currentColorIndex = 0;
            }

            trialPhase = 0; // Start the next trial phase
            trialNumber++;
            if (condition === "Passive_Attention") {
                computerActionFrame = int(random([60, 90, 120, 150])); // Set the computer action frame for Passive_Attention condition
            }
            if ((trialNumber - 1) % totalTrialsPerCondition === 0 && currentConditionIndex < conditionsOrder.length - 1) {
                currentConditionIndex++;
                condition = conditionsOrder[currentConditionIndex];
                document.getElementById('messageContainer').innerText = `This is ${condition} condition, press the space key to start`;
                document.getElementById('messageContainer').style.display = 'block';
                trialPhase = -2; // Show the condition message for the new block
            }
        } else {
            experimentEnded = true; // Indicate the experiment has ended
        }
    }
}

function drawClockface() {
    // Draw the gray dots
    fill(128); // Set fill color to gray
    noStroke();
    for (let dot of grayDots) {
        ellipse(dot.x, dot.y, 16, 16); // Increased size to 16
    }

    // Draw the fixation point at the center
    if (trialPhase < 5 || trialPhase === 7) {
        fill(255);
        ellipse(centerX, centerY, 16, 16); // Same size as red dot
    }
}

function drawClockfaceWithHover() {
    // Draw the gray dots with hover effect
    noStroke();
    selectedDotIndex = -1; // Reset selected dot index

    for (let i = 0; i < grayDots.length; i++) {
        let dot = grayDots[i];
        let d = dist(mouseX, mouseY, dot.x, dot.y);
        if (d < 8) {
            fill(255, 0, 0); // Turn red if hovered
            selectedDotIndex = i;
        } else {
            fill(128); // Set fill color to gray
        }
        ellipse(dot.x, dot.y, 16, 16); // Increased size to 16
    }

    // Draw the fixation point at the center
    if (trialPhase === 7) {
        fill(255);
        ellipse(centerX, centerY, 16, 16); // Same size as red dot
    }
}

function drawRedDot() {
    if (redDotPositionIndex < grayDots.length) {
        // Draw the red dot at the current gray dot position
        fill(255, 0, 0);
        ellipse(grayDots[redDotPositionIndex].x, grayDots[redDotPositionIndex].y, 16, 16); // Increased size to 16
    }
}

function keyPressed() {
    if (key === ' ' && experimentStarted) {
        keyPressOccurred = true;
    }
}

function soundLoaded() {
    console.log('Sound loaded successfully.');
    soundLoadedFlag = true;
}

function loadError(err) {
    console.error('Error loading sound:', err);
}

function generateUniqueID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function centerCanvas() {
    let canvas = select('canvas');
    canvas.style('display', 'block');
    canvas.style('margin-left', 'auto');
    canvas.style('margin-right', 'auto');
    canvas.style('position', 'absolute');
    canvas.style('top', '50%');
    canvas.style('left', '50%');
    canvas.style('transform', 'translate(-50%, -50%)');
}

function windowResized() {
    centerCanvas();
}

function randomTwoColors(colors) {
    let shuffled = shuffleArray(colors);
    return shuffled.slice(0, 2);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function calculateDotDistance(realDotIndex, selectedDotIndex) {
    let distance = selectedDotIndex - realDotIndex;
    if (distance > 60) {
        distance -= 120;
    } else if (distance < -60) {
        distance += 120;
    }
    return distance;
}
