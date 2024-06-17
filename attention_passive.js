let centerX, centerY, radius;
let numDots = 120;
let angleStep;
let grayDots = [];
let trialPhase = -1;
let frameCount = 0;
let redDotPositionIndex = 0;
let soundFile, keypressSoundFile;
let soundLoadedFlag = false;
let playSoundFrame = -1;
let selectedDotIndex = -1;
let participantID = generateUniqueID();
let subjectNumber, age, trialNumber = 1, realDotIndex, timeBeforeAction;
let dotDistance, timeEstimationError;
let experimentStarted = false;
let computerActionFrame = -1;
let totalTrials = 4;
let showPlaySymbol = false;
let experimentEnded = false;
let washOutDuration;
let fixationColors = ['red', 'green', 'blue', 'yellow', 'cyan'];
let presentedColors = [];
let colorProbabilities = [0.4, 0.3, 0.3];
let colorChangeFrame = 0;
let currentFixationColor;
let fixationColorSequence = [];
let fixationColorIndex = 0;
let colorSelectionPhase = false;
let mostFrequentColorPhase = false;
let participantColorSelections = [];
let mostFrequentColorSelection;
let accuracy;
let correctness;

function preload() {
    soundFile = loadSound('Pool2_44100.wav', soundLoaded, loadError);
    keypressSoundFile = loadSound('keypress_44100.wav', soundLoaded, loadError);
}

function setup() {
    let canvas = createCanvas(1920, 1080);
    centerCanvas();
    textAlign(CENTER, CENTER);
    textSize(32);
    userStartAudio(); // Resume the AudioContext

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
    currentFixationColor = 'white';

    // Set the participant ID in the hidden form field
    let participantIDField = document.getElementById('participantID');
    if (participantIDField) {
        participantIDField.value = participantID;
    } else {
        console.error('Participant ID field not found');
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
    } else if (trialPhase === -1) {
        text("Press the space key to start the experiment.", width / 2, height / 2);
        if (keyIsPressed && key === ' ') {
            trialPhase = 0;
        }
    } else if (trialPhase === 0) {
        // Blank screen for 30 frames
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 1) {
        // Clockface shows for 30 frames
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
            setupColorChanges();
        }
    } else if (trialPhase === 2) {
        // Red dot appears and starts rotating
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        frameCount++;
        updateFixationColor();

        if (frameCount === computerActionFrame) {
            keypressSoundFile.play(); // Play the keypress sound
            playSoundFrame = frameCount + 15; // Set the frame to play the pool sound
            timeBeforeAction = frameCount;
            trialPhase++;
            frameCount = 0;
        }
    } else if (trialPhase === 3) {
        // Continue rotating for 15 frames after keypress in Passive condition
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        updateFixationColor();

        if (frameCount === 15) {
            soundFile.play(); // Play the pool sound
            realDotIndex = redDotPositionIndex;
            washOutDuration = int(random([30, 60, 90, 120])); // Set washOutDuration
            frameCount = 0;
            trialPhase++;
        } else {
            frameCount++;
        }
    } else if (trialPhase === 4) {
        // Red dot keeps rotating for washOutDuration frames after pool sound
        drawClockface();
        drawRedDot();
        updateFixationColor();

        if (frameCount < washOutDuration) {
            frameCount++;
            redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 5) {
        // Clockface remains for 30 frames
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 6) {
        // Blank screen for 30 frames
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 7) {
        // Response phase for subjective timing
        document.body.style.cursor = 'default'; // Show cursor
        drawClockfaceWithHover();
        if (mouseIsPressed) {
            if (selectedDotIndex !== -1) {
                // Log and submit response
                dotDistance = calculateDotDistance(realDotIndex, selectedDotIndex);
                timeEstimationError = dotDistance * 16.666;

                let selectedDotIndexField = document.getElementById('selectedDotIndex');
                let timeBeforeActionField = document.getElementById('timeBeforeAction');
                let trialNumberField = document.getElementById('trialNumber');
                let realDotIndexField = document.getElementById('realDotIndex');
                let dotDistanceField = document.getElementById('dotDistance');
                let timeEstimationErrorField = document.getElementById('timeEstimationError');
                let washOutDurationField = document.getElementById('washOutDuration'); // New field

                if (selectedDotIndexField && timeBeforeActionField && trialNumberField && realDotIndexField && dotDistanceField && timeEstimationErrorField && washOutDurationField) {
                    selectedDotIndexField.value = selectedDotIndex;
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

    if (colorSelectionPhase) {
        drawColorSelection();
    }

    if (mostFrequentColorPhase) {
        drawMostFrequentColorSelection();
    }
}

function setupColorChanges() {
    presentedColors = shuffle(fixationColors).slice(0, 3);
    fixationColorSequence = [];
    let totalFrames = timeBeforeAction + 15 + washOutDuration;
    let numColorChanges = floor(totalFrames / 30);
    for (let i = 0; i < numColorChanges; i++) {
        let rand = random();
        if (rand < colorProbabilities[0]) {
            fixationColorSequence.push(presentedColors[0]);
        } else if (rand < colorProbabilities[0] + colorProbabilities[1]) {
            fixationColorSequence.push(presentedColors[1]);
        } else {
            fixationColorSequence.push(presentedColors[2]);
        }
    }
    fixationColorSequence.push('white'); // Revert to original color if extra frames
    colorChangeFrame = 0;
    fixationColorIndex = 0;
}

function updateFixationColor() {
    if (colorChangeFrame < 30) {
        colorChangeFrame++;
    } else {
        colorChangeFrame = 0;
        fixationColorIndex++;
        if (fixationColorIndex < fixationColorSequence.length) {
            currentFixationColor = fixationColorSequence[fixationColorIndex];
        } else {
            currentFixationColor = 'white';
        }
    }
}

function drawClockface() {
    fill(128); // Set fill color to gray
    noStroke();
    for (let dot of grayDots) {
        ellipse(dot.x, dot.y, 16, 16);
    }

    fill(currentFixationColor || 'white');
    ellipse(centerX, centerY, 5, 5); // Smaller dot with a diameter of 5
}

function drawClockfaceWithHover() {
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
        ellipse(dot.x, dot.y, 16, 16);
    }

    fill(currentFixationColor || 'white');
    ellipse(centerX, centerY, 5, 5);
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
        if (colorSelectionPhase) {
            colorSelectionPhase = false;
            mostFrequentColorPhase = true;
        } else if (mostFrequentColorPhase) {
            mostFrequentColorPhase = false;
            accuracy = participantColorSelections.reduce((acc, color) => acc + (presentedColors.includes(color) ? 1 : 0), 0);
            correctness = mostFrequentColorSelection === presentedColors[0] ? 1 : 0;
            let persentedColorField = document.getElementById('persentedColor');
            let firstColorField = document.getElementById('firstColor');
            let secondColorField = document.getElementById('secondColor');
            let thirdColorField = document.getElementById('thirdColor');
            let accField = document.getElementById('acc');
            let correctField = document.getElementById('correct');

            if (persentedColorField && firstColorField && secondColorField && thirdColorField && accField && correctField) {
                persentedColorField.value = JSON.stringify(presentedColors);
                firstColorField.value = fixationColorSequence.filter(color => color === presentedColors[0]).length;
                secondColorField.value = fixationColorSequence.filter(color => color === presentedColors[1]).length;
                thirdColorField.value = fixationColorSequence.filter(color => color === presentedColors[2]).length;
                accField.value = accuracy;
                correctField.value = correctness;

                document.getElementById('responseForm').submit();
            } else {
                console.error('Form fields not found');
            }

            if (trialNumber < totalTrials) {
                trialPhase = 0;
                trialNumber++;
                computerActionFrame = int(random([60, 90, 120, 150]));
            } else {
                experimentEnded = true;
            }
        } else {
            trialPhase = 0;
            if (trialNumber <= totalTrials) {
                trialPhase = 0;
                trialNumber++;
                computerActionFrame = int(random([60, 90, 120, 150]));
            } else {
                experimentEnded = true;
            }
        }
    }
}

function drawColorSelection() {
    textSize(24);
    textAlign(CENTER, CENTER);
    fill(255);
    text("What colors did you see?", width / 2, height / 4);

    let discY = height / 2;
    let discXSpacing = width / 6;
    let startX = width / 2 - discXSpacing * 2;

    for (let i = 0; i < fixationColors.length; i++) {
        let x = startX + i * discXSpacing;
        let y = discY;
        fill(fixationColors[i]);
        ellipse(x, y, 50, 50);

        if (participantColorSelections.includes(fixationColors[i])) {
            stroke(255);
            strokeWeight(3);
            ellipse(x, y, 60, 60);
            noStroke();
        }
    }

    if (participantColorSelections.length === 3) {
        drawPlaySymbol();
    }
}

function drawMostFrequentColorSelection() {
    textSize(24);
    textAlign(CENTER, CENTER);
    fill(255);
    text("Which color appeared most frequently?", width / 2, height / 4);

    let discY = height / 2;
    let discXSpacing = width / 6;
    let startX = width / 2 - discXSpacing;

    for (let i = 0; i < participantColorSelections.length; i++) {
        let x = startX + i * discXSpacing;
        let y = discY;
        fill(participantColorSelections[i]);
        ellipse(x, y, 50, 50);

        if (mostFrequentColorSelection === participantColorSelections[i]) {
            stroke(255);
            strokeWeight(3);
            ellipse(x, y, 60, 60);
            noStroke();
        }
    }

    if (mostFrequentColorSelection) {
        drawPlaySymbol();
    }
}

function mousePressed() {
    if (colorSelectionPhase && participantColorSelections.length < 3) {
        let discY = height / 2;
        let discXSpacing = width / 6;
        let startX = width / 2 - discXSpacing * 2;

        for (let i = 0; i < fixationColors.length; i++) {
            let x = startX + i * discXSpacing;
            let y = discY;
            if (dist(mouseX, mouseY, x, y) < 25) {
                let color = fixationColors[i];
                if (!participantColorSelections.includes(color)) {
                    participantColorSelections.push(color);
                }
            }
        }
    } else if (mostFrequentColorPhase) {
        let discY = height / 2;
        let discXSpacing = width / 6;
        let startX = width / 2 - discXSpacing;

        for (let i = 0; i < participantColorSelections.length; i++) {
            let x = startX + i * discXSpacing;
            let y = discY;
            if (dist(mouseX, mouseY, x, y) < 25) {
                mostFrequentColorSelection = participantColorSelections[i];
            }
        }
    }
}

function soundLoaded() {
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

function calculateDotDistance(realDotIndex, selectedDotIndex) {
    let distance = selectedDotIndex - realDotIndex;
    if (distance > 60) {
        distance -= 120;
    } else if (distance < -60) {
        distance += 120;
    }
    return distance;
}
