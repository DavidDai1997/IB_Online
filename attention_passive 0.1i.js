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
let trialNumber = 1, realDotIndex, timeBeforeAction;
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
    userStartAudio();

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
    currentFixationColor = 'white';
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
        if (!experimentStarted) {
            text("Press the space key to start the experiment.", width / 2, height / 2);
        } else {
            trialPhase = 0;
            document.getElementById('messageContainer').style.display = 'none';
        }
    } else if (trialPhase === 0) {
        // 500ms blank
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 1) {
        // Clock face 500ms
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
            setupColorChanges();
        }
    } else if (trialPhase === 2) {
        // Red dot rotation, fixation starts changing color
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        frameCount++;
        updateFixationColor();

        if (frameCount >= computerActionFrame) {
            keypressSoundFile.play();
            playSoundFrame = frameCount + 15;
            timeBeforeAction = frameCount;
            trialPhase++;
            frameCount = 0;
        }
    } else if (trialPhase === 3) {
        // 15 frames after keypress sound, play target pool sound
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        updateFixationColor();

        if (frameCount === 15) {
            soundFile.play();
            realDotIndex = redDotPositionIndex;
            washOutDuration = int(random([30, 60, 90, 120]));
            frameCount = 0;
            trialPhase++;
        } else {
            frameCount++;
        }
    } else if (trialPhase === 4) {
        // Wash-out period, color changing stops within or at the end
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
        // Clock face 500ms
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 6) {
        // Blank 500ms
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 7) {
        // Timing response stage
        document.body.style.cursor = 'default';
        drawClockfaceWithHover();
        if (mouseIsPressed) {
            if (selectedDotIndex !== -1) {
                dotDistance = calculateDotDistance(realDotIndex, selectedDotIndex);
                timeEstimationError = dotDistance * 16.666;

                trialPhase++;
                colorSelectionPhase = true; // Directly transition to color selection phase
            }
        }
    } else if (trialPhase === 8) {
        // Present color selection stage
        if (colorSelectionPhase) {
            drawColorSelection();
        }
    }

    if (mostFrequentColorPhase) {
        drawMostFrequentColorSelection();
    }
}

function setupColorChanges() {
    presentedColors = shuffle(fixationColors).slice(0, 3);
    fixationColorSequence = [];
    computerActionFrame = int(random(60, 180)); // Random period for red dot rotation
    let totalFrames = 60 + computerActionFrame + 15 + washOutDuration; // 60 frames for blank and clock display, action time, action-outcome interval, washout period
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
    fixationColorSequence.push('white');
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
    fill(128);
    noStroke();
    for (let dot of grayDots) {
        ellipse(dot.x, dot.y, 16, 16);
    }

    fill(currentFixationColor || 'white');
    ellipse(centerX, centerY, 16, 16); // Make the fixation same size as the rotating red disc
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

    fill(currentFixationColor || 'white');
    ellipse(centerX, centerY, 16, 16); // Make the fixation same size as the rotating red disc
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
        mostFrequentColorPhase = true; // Transition to most frequent color selection phase
        trialPhase++;
    }
}

function drawColorSelection() {
    textSize(24);
    textAlign(CENTER, CENTER);
    fill(255);
    text("What colors did you see?", width / 2, height / 8);

    let discY = height - 150;
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
    text("Which color appeared most frequently?", width / 2, height / 8);

    let discY = height - 150;
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
        let discY = height - 150;
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
        let discY = height - 150;
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

function startExperiment() {
    let subjectNumberField = document.getElementById('subjectNumber');
    let ageField = document.getElementById('age');

    if (subjectNumberField && ageField && subjectNumberField.value && ageField.value) {
        subjectNumber = subjectNumberField.value;
        age = ageField.value;

        document.getElementById('inputContainer').style.display = 'none';
        document.getElementById('messageContainer').style.display = 'block';
        experimentStarted = true;
        trialPhase = -1; // Start the trial
    } else {
        alert("Please enter both Subject Number and Age.");
    }
}
