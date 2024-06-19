// mostly working
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
let colorCycle = []; // Simplified color index cycle with white separating the colors
let colorCycleIndex = 0; // Track the current index in the color cycle
let colorFrames = 0; // Track the number of frames for the current color
let totalTrialFrameCount = 0; // To keep track of the total frame count for each trial

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

        // Generate the random color cycle
        selectedColors = randomTwoColors(fixationColors);
        colorCycle = generateRandomColorCycle(selectedColors, 4); // 4 cycles of color and white
        colorCycleIndex = 0;
        colorFrames = 0;
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
        if (keyPressOccurred && experimentStarted) {
            userStartAudio();
            keyPressOccurred = false;
            document.getElementById('messageContainer').style.display = 'none';

            if (!canvasCreated) {
                let canvas = createCanvas(1920, 1080);
                centerCanvas();
                textAlign(CENTER, CENTER);
                textSize(32);
                canvasCreated = true;

                centerX = width / 2;
                centerY = height / 2;
                radius = min(width, height) / 3;
                angleStep = TWO_PI / numDots;

                for (let i = 0; i < numDots; i++) {
                    let angle = i * angleStep;
                    let x = centerX + cos(angle) * radius;
                    let y = centerY + sin(angle) * radius;
                    grayDots.push(createVector(x, y));
                }

                redDotPositionIndex = int(random(numDots));
                let participantIDField = document.getElementById('participantID');
                if (participantIDField) {
                    participantIDField.value = participantID;
                } else {
                    console.error('Participant ID field not found');
                }
            }

            if (condition === "Passive_Attention") {
                colorCycle = generateRandomColorCycle(selectedColors, 4); // 4 cycles of color and white
                colorCycleIndex = 0;
                colorFrames = 0;
            }

            trialPhase = 0;
            if (condition === "Passive_Attention") {
                computerActionFrame = int(random([75, 105, 135, 165]));
                washOutDuration = int(random([30, 60, 90, 120]));
            }
        }
    } else if (trialPhase === 0) {
        document.body.style.cursor = 'none';
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 1) {
        document.body.style.cursor = 'none';
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 2) {
        document.body.style.cursor = 'none';
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        frameCount++;
        totalTrialFrameCount++;

        if (colorFrames < 30) {
            colorFrames++;
        } else {
            colorCycleIndex = (colorCycleIndex + 1) % colorCycle.length;
            colorFrames = 1;
        }

        if (frameCount === computerActionFrame) {
            keypressSoundFile.play();
            playSoundFrame = frameCount + 15;
            timeBeforeAction = frameCount;
            trialPhase++;
            frameCount = 0;
        }

        if (condition === "Passive_Attention") {
            applyColor(colorCycle[colorCycleIndex]);
            ellipse(centerX, centerY, 16, 16);
        } else {
            fill(255);
            ellipse(centerX, centerY, 16, 16);
        }
    } else if (trialPhase === 3) {
        document.body.style.cursor = 'none';
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        frameCount++;
        totalTrialFrameCount++;

        if (frameCount === 15) {
            soundFile.play();
            realDotIndex = redDotPositionIndex;
            frameCount = 0;
            trialPhase++;
        }

        if (condition === "Passive_Attention") {
            if (colorFrames < 30) {
                colorFrames++;
            } else {
                colorCycleIndex = (colorCycleIndex + 1) % colorCycle.length;
                colorFrames = 1;
            }
            applyColor(colorCycle[colorCycleIndex]);
            ellipse(centerX, centerY, 16, 16);
        } else {
            fill(255);
            ellipse(centerX, centerY, 16, 16);
        }
    } else if (trialPhase === 4) {
        document.body.style.cursor = 'none';
        drawClockface();
        drawRedDot();
        frameCount++;
        totalTrialFrameCount++;

        if (frameCount === 1) {
            colorCycleIndex = (colorCycleIndex + 1) % colorCycle.length; // Ensure the color changes at the start of the washout period
            colorFrames = 1;
        } else if (colorFrames < 30) {
            colorFrames++;
        } else {
            colorCycleIndex = (colorCycleIndex + 1) % colorCycle.length;
            colorFrames = 1;
        }

        if (frameCount < washOutDuration) {
            redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        } else {
            frameCount = 0;
            trialPhase++;
        }

        if (condition === "Passive_Attention") {
            applyColor(colorCycle[colorCycleIndex]);
            ellipse(centerX, centerY, 16, 16);
        } else {
            fill(255);
            ellipse(centerX, centerY, 16, 16);
        }
    } else if (trialPhase === 5) {
        document.body.style.cursor = 'none';
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 6) {
        document.body.style.cursor = 'none';
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 7) {
        document.body.style.cursor = 'default';
        drawClockfaceWithHover();
        fill(255);
        ellipse(centerX, centerY, 16, 16);
        if (mouseIsPressed) {
            if (selectedDotIndex !== -1) {
                dotDistance = calculateDotDistance(realDotIndex, selectedDotIndex);
                timeEstimationError = dotDistance * 16.666;

                let selectedDotIndexField = document.getElementById('selectedDotIndex');
                let conditionField = document.getElementById('condition');
                let timeBeforeActionField = document.getElementById('timeBeforeAction');
                let trialNumberField = document.getElementById('trialNumber');
                let realDotIndexField = document.getElementById('realDotIndex');
                let dotDistanceField = document.getElementById('dotDistance');
                let timeEstimationErrorField = document.getElementById('timeEstimationError');
                let washOutDurationField = document.getElementById('washOutDuration');

                if (selectedDotIndexField && conditionField && timeBeforeActionField && trialNumberField && realDotIndexField && dotDistanceField && timeEstimationErrorField && washOutDurationField) {
                    selectedDotIndexField.value = selectedDotIndex;
                    conditionField.value = condition;
                    timeBeforeActionField.value = timeBeforeAction;
                    trialNumberField.value = trialNumber;
                    realDotIndexField.value = realDotIndex;
                    dotDistanceField.value = dotDistance;
                    timeEstimationErrorField.value = timeEstimationError;
                    washOutDurationField.value = washOutDuration;

                    document.getElementById('responseForm').submit();
                } else {
                    console.error('Form fields not found');
                }

                trialPhase++;
                showPlaySymbol = true;
                totalTrialFrameCount = 0;
            }
        }
    } else if (trialPhase === 8) {
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

function drawClockface() {
    fill(128);
    noStroke();
    for (let dot of grayDots) {
        ellipse(dot.x, dot.y, 16, 16);
    }

    if (trialPhase < 5 || trialPhase === 7) {
        fill(255);
        ellipse(centerX, centerY, 16, 16);
    }
}

function drawClockfaceWithHover() {
    noStroke();
    selectedDotIndex = -1;

    for (let i = 0; i < grayDots.length; i++) {
        let dot = grayDots[i];
        let d = dist(mouseX, mouseY, dot.x, dot.y);
        if (d < 8) {
            fill(255, 0, 0);
            selectedDotIndex = i;
        } else {
            fill(128);
        }
        ellipse(dot.x, dot.y, 16, 16);
    }

    if (trialPhase === 7) {
        fill(255);
        ellipse(centerX, centerY, 16, 16);
    }
}

function drawRedDot() {
    if (redDotPositionIndex < grayDots.length) {
        fill(255, 0, 0);
        ellipse(grayDots[redDotPositionIndex].x, grayDots[redDotPositionIndex].y, 16, 16);
    }
}

function drawPlaySymbol() {
    const triangleSize = 30;
    let isHovering = dist(mouseX, mouseY, centerX, centerY) < triangleSize;

    fill(isHovering ? 'green' : 'grey');
    noStroke();
    triangle(centerX - triangleSize / 2, centerY - triangleSize / 2, centerX - triangleSize / 2, centerY + triangleSize / 2, centerX + triangleSize / 2, centerY);

    if (mouseIsPressed && isHovering) {
        showPlaySymbol = false;
        document.body.style.cursor = 'none';
        if (trialNumber < totalTrialsPerCondition * conditionsOrder.length) {
            if (condition === "Passive_Attention") {
                selectedColors = randomTwoColors(fixationColors);
                colorCycle = generateRandomColorCycle(selectedColors, 4); // 4 cycles of color and white
                colorCycleIndex = 0;
                colorFrames = 0;
            }

            trialPhase = 0;
            trialNumber++;
            if (condition === "Passive_Attention") {
                computerActionFrame = int(random([75, 105, 135, 165]));
                washOutDuration = int(random([30, 60, 90, 120]));
            }
            if ((trialNumber - 1) % totalTrialsPerCondition === 0 && currentConditionIndex < conditionsOrder.length - 1) {
                currentConditionIndex++;
                condition = conditionsOrder[currentConditionIndex];
                document.getElementById('messageContainer').innerText = `This is ${condition} condition, press the space key to start`;
                document.getElementById('messageContainer').style.display = 'block';
                trialPhase = -2;
            }
        } else {
            experimentEnded = true;
        }
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

function generateRandomColorCycle(colors, length) {
    let cycle = [];
    for (let i = 0; i < length; i++) {
        cycle.push(colors[Math.floor(Math.random() * colors.length)]);
        cycle.push(0); // White color represented by 0
    }
    return cycle;
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
