let centerX, centerY, radius;
let numDots = 120;
let angleStep;
let grayDots = [];
let trialPhase = -1; // Start with the welcome phase
let frameCount = 0;
let keyPressOccurred = false;
let rotationContinuedFrames = 60;
let redDotPositionIndex = 0;
let soundFile;
let soundLoadedFlag = false;
let playSoundFrame = -1;
let selectedDotIndex = -1;
let participantID = generateUniqueID(); // Generate a unique ID for each participant

function preload() {
    console.log('Preloading sound...');
    soundFile = loadSound('Pool2_44100.wav', soundLoaded, loadError);
}

function setup() {
    let canvas = createCanvas(1920, 1080);
    canvas.position((windowWidth - width) / 2, (windowHeight - height) / 2);
    textAlign(CENTER, CENTER);
    textSize(32);
    getAudioContext().suspend(); // Suspend the AudioContext initially

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
    document.getElementById('participantID').value = participantID;
}

function draw() {
    background(0);
    fill(255);

    if (!soundLoadedFlag) {
        text('Loading sound...', width / 2, height / 2);
    } else if (trialPhase === -1) {
        text('Welcome! Press the spacebar to start.', width / 2, height / 2);
        if (keyPressOccurred) {
            userStartAudio(); // Resume the AudioContext
            keyPressOccurred = false; // Reset key press flag
            trialPhase = 0; // Move to the next phase
        }
    } else if (trialPhase === 0 || trialPhase === 7) {
        // Phase 0 and 7: Blank screen for 30 frames
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 1 || trialPhase === 6) {
        // Phase 1 and 6: Clockface shows for 30 frames
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 2) {
        // Phase 2: Red dot appears randomly at one of the gray dot positions and starts rotating
        drawClockface();
        drawRedDot();
        redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        frameCount++;
        if (keyPressOccurred) {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 3) {
        // Phase 3: Wait for participant keypress (spacebar)
        drawClockface();
        drawRedDot();
        if (keyPressOccurred) {
            keyPressOccurred = false; // Reset key press flag
            playSoundFrame = frameCount + 15; // Set the frame to play the sound
            trialPhase++;
        }
    } else if (trialPhase === 4) {
        // Phase 4: Red dot keeps rotating for 60 frames after keypress
        drawClockface();
        drawRedDot();
        if (frameCount === playSoundFrame) {
            soundFile.play(); // Play the sound 15 frames after keypress
        }
        if (frameCount < rotationContinuedFrames) {
            frameCount++;
            redDotPositionIndex = (redDotPositionIndex + 1) % numDots;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 5) {
        // Phase 5: Clockface remains for 30 frames
        drawClockface();
        if (frameCount < 30) {
            frameCount++;
        } else {
            frameCount = 0;
            trialPhase++;
        }
    } else if (trialPhase === 8) {
        // Phase 8: Response stage
        drawClockfaceWithHover();
        if (mouseIsPressed) {
            if (selectedDotIndex !== -1) {
                // Log and submit response
                const responseTime = millis();
                const responseData = {
                    selectedDotIndex: selectedDotIndex,
                    responseTime: responseTime
                };
                document.getElementById('selectedDotIndex').value = responseData.selectedDotIndex;
                document.getElementById('responseTime').value = responseData.responseTime;
                document.getElementById('responseForm').submit();
                trialPhase++;
            }
        }
    } else if (trialPhase === 9) {
        // Phase 9: Show "demo over"
        background(0);
        fill(255); // Set text color to white
        textSize(32);
        textAlign(CENTER, CENTER);
        text("Demo Over", width / 2, height / 2);
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
    fill(255);
    ellipse(centerX, centerY, 5, 5); // Smaller dot with a diameter of 5
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
    fill(255);
    ellipse(centerX, centerY, 5, 5); // Smaller dot with a diameter of 5
}

function drawRedDot() {
    if (redDotPositionIndex < grayDots.length) {
        // Draw the red dot at the current gray dot position
        fill(255, 0, 0);
        ellipse(grayDots[redDotPositionIndex].x, grayDots[redDotPositionIndex].y, 16, 16); // Increased size to 16
    }
}

function keyPressed() {
    if (key === ' ') {
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
