//GUI 
let font;
let font2;
let sliders = [];
let hsliders = [];
let buttons;
let buttonContainer;

//FFT
let fft1, fft512, fft1024;

//Audio
let audioStarting = false;
let audioInitialised = false;
let dB = -Infinity;
let levelMeter;
let player1;
let player2;
let currentPlayer;
let pitchShift;
let reverb;
let distortion;
let gainNode;

//Graphics 
let transparency = 50;
let colors = ['#46FF330', '#788A76', '#C8D7C7', '#373D36'];
const gridSize = 40;


//Load fonts
function preload() {
    font = loadFont('assets/Nippo-Variable.ttf');
    font2 = loadFont('assets/RX100-Regular.otf');
}

function setup() {
    textFont(font);
    createCanvas(windowWidth, windowHeight - 4);

    currentPlayer = null;

    //Sliders
    for (let i = 0; i < 3; i++) {
        sliders.push(new VSlider(60 + i * 80, height/2, 30, 200));
    }

    //Horizontal sliders
    for (let i = 0; i < 2; i++) {
        hsliders.push(new HSlider(60, height/2 - 70*(i+1), 190, 30))
    }

    //Set sliders default values
    sliders[0].value = 0.5;
    sliders[0].onSlide = slider_0_Moved;

    sliders[1].value = 0;
    sliders[1].onSlide = slider_1_Moved;

    sliders[2].value = 0.5;
    sliders[2].onSlide = slider_2_Moved;

    hsliders[0].value = 0;
    hsliders[0].onSlide = hslider_0_Moved;

    hsliders[1].value = 1;
    hsliders[1].onSlide = hslider_1_Moved;

    buttons = [
        document.getElementById("sample1Button"),
        document.getElementById("sample2Button")
      ];

    buttonContainer = document.getElementById("button-container");

    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", () => selectPlayer(i));
    }

}



async function startAudio() {
    audioStarting = true;
    console.log('Audio starting');

    await Tone.start()
    console.log('Audio has started.');

    //Load media
    player1 = new Tone.Player('assets/Nettspend - Nothing like you.mp3').toDestination();; 
    player2 = new Tone.Player('assets/EARTHBOUND.mp3').toDestination();;

    await Tone.loaded();
    console.log('All samples loaded');

    //Meter
    levelMeter = new Tone.Meter().toDestination();
    currentPlayer.connect(levelMeter);

    //Pitch effect
    pitchShift = new Tone.PitchShift().toDestination();
    currentPlayer.connect(pitchShift);

    //Reverb effect
    reverb = new Tone.Reverb().toDestination();
    currentPlayer.connect(reverb);

    //Distortion effect
    distortion = new Tone.Distortion(0).toDestination();
    currentPlayer.connect(distortion);

    gainNode = new Tone.Gain(0.5).toDestination();
    currentPlayer.connect(gainNode);

    //FFTs
    fft1 = new Tone.FFT ({
        size: 32
    });
    fft512 = new Tone.FFT(512, 0.5);
    fft1024 = new Tone.FFT(1024, 0.8);
    currentPlayer.connect(fft1024);
    currentPlayer.connect(fft512);
    currentPlayer.connect(fft1);
    console.log('FFTs connected');


    console.log('All audio sources created.');
}


function draw() {
    
    background(0);

    //Footer
    push();
    textAlign(CENTER);
    textSize(10);
    fill(100);
    noStroke();
    text('©2024 Nicolás Arellano Guzman. All rights reserved.', width/2, height/2 +380);
    pop();

    //Load start screen & main screen
        if (!currentPlayer) {
            startScreen(); 
        } else {
            displayVisuals();
        }
        return;
    
    
}

//Start screen
function startScreen() {
    if (!audioInitialised) {
        if (!audioStarting) {
            textAlign(CENTER);
            noStroke();
            fill(255);
            textSize(40);
            text('AUDIO VISUAL GENERATIVE ENVIRONMENT', width/2, height/2 - 50); //Title
            if (frameCount % 60 < 30) {
                push();
                textSize(32);
                text('select a track', width/2, height/2); //Blinking start message
                pop();
            }
        } else {
            textAlign(CENTER);
            noStroke();
            fill(255);
            textSize(40);
            text('AUDIO VISUAL GENERATIVE ENVIRONMENT', width/2, height/2 - 50); //Title
            if (frameCount % 60 < 30) {
                push();
                textSize(32);
                fill(0, 255, 0);
                text('confirm to start', width/2, height/2); //Blinking start message
                pop();
            }
        }
        }
    
}

//Main screen
function displayVisuals() {
    if (!(fft1 == null)) {
        for (let i = 0; i < sliders.length; i++) { //Cycle through sliders and draw
            sliders[i].draw();
        }

        for (let i = 0; i < hsliders.length; i++) { //Cycle through sliders and draw
            hsliders[i].draw();
        }

        buttonContainer.style.display = "none"

        textAlign(CENTER);
        
        
        push();
        stroke(0, 255, 0);
        fill(200);
        textSize(22);
        textFont(font2);
        text('pitch', 75, height/2 + 225);
        text('reverb', 155, height/2 + 225);    //GUI text
        text('speed', 235, height/2 + 225);
        text('distortion', 155, height/2 - 15);
        text('volume', 155, height/2 - 85);
        pop();

        textSize(28);
        text('EQ', 155, height/2 + 365);
    
        push();
        stroke(0, 255, 0);
        fill(90);
        rect(59, height/2 + 317 - height/18, 194, height/14);   //EQ border
        pop();

        push();
        FFTSpectrumVis(fft1);   //Visuals
        Pattern3(fft512);
        pop();

        Pattern1(fft1024);
        Pattern2(fft1024);
        
    }
}


function FFTSpectrumVis(fft) {
    fftVal = fft.getValue();

    //Sensible dB range 
    let minFFT = -96;
    let maxFFT = -15;

    //Loop through the fft values and scale them accordingly to values between 0-1
    for (let i = 0; i < fftVal.length; i++) {
        let scaledValues = map(fftVal[i], minFFT, maxFFT, 0, 1, true);
        fftVal[i] = scaledValues;
    }

    // Define number of bars
    const numBars = fftVal.length;  // Half the size due to real/imaginary parts

    // Calculate bar width
    const barWidth = 385 / numBars;

    for (let i = 0; i < numBars; i++) {
        // Combine real and imaginary parts for magnitude
        const magnitude = Math.hypot(fftVal[i * 2], fftVal[i * 2 + 1]);
        const barHeight = map(magnitude, 0, 1, 0, height/20);

    // Draw bars with retro style
    fill((i+1 * 5) % 255, 260 * (i+1 * 30) % 255, 0);
    rect(i * barWidth + 60, height/2 + 330 - barHeight, barWidth, barHeight);
    }    
}


function Pattern1(fft) {
    //Spectrum data from FFT
  const spectrum = fft.getValue();

  //Number of points for the shape
  const numPoints = 360;

  //Calculate angle increment
  const angleStep = TWO_PI / numPoints;

  //Shape origin and radius
  const centerX = width / 2;
  const centerY = height / 2;

  let radius = 0;
  for (let i = 0; i < spectrum.length; i++) {
    radius += spectrum[i];  //Combine low frequencies for overall radius
  }

  //Sensible dB range 
  let minFFT = -128;
  let maxFFT = -12;

  //Loop through the fft values and scale them accordingly to values between 0-1
  for (let i = 0; i < fftVal.length; i++) {
      let scaledValues = map(fftVal[i], minFFT, maxFFT, 0, 50, true);
      fftVal[i] = scaledValues;
  }

  for (let i = 0; i < fftVal.length; i++) {
    radius = map(radius, 0, 255 * fftVal[i], 50, 100);  //Radius range
  }
  
  const noiseFactor = random(-1, 1) * radius * 1;  //Noise amplitude
  radius += noiseFactor;

  //Generate points for the shape
  let points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;
    const x = centerX + radius * cos(angle);
    const y = centerY + radius * sin(angle);
    points.push([x, y]);
  }

  //Draw lines instead of a closed shape
  const baseColor1 = color(100, 100, 0);  //Base color
  stroke(lerpColor(baseColor1, color(0, 255, 0), random(0, 2)));
  noFill();
  beginShape(LINES);
  for (let i = 0; i < points.length; i++) {
  const p1 = points[i];
  const p2 = points[(i + 1) % points.length];  //Connect points
  vertex(p1[0], p1[1]);
  vertex(p2[0], p2[1]);
}
endShape();

  //Draw the shape
  const baseColor2 = color(255, 0, 0);  //Base color
  fill(lerpColor(baseColor2, color(0, 255, 0), random(0, 2)));  //Random color shift
  
  beginShape();
  for (const point of points) {
    vertex(point[0], point[1]);
  }
  endShape(CLOSE);
}


function Pattern2(fft) {
    const spectrum = fft.getValue();
    //Number of points for the shape
  const numPoints = 360;

  //Calculate angle increment
  const angleStep = TWO_PI / numPoints;

  //Shape origin and radius
  const centerX = width / 2;
  const centerY = height / 2;

  let radius = 0;
  for (let i = 0; i < spectrum.length; i++) {
    radius += spectrum[i];  //Combine low frequencies for overall radius
  }
  radius = map(radius, 0, 455 * spectrum.length * 100, 50, 400);  //Radius range
  const noiseFactor = random(-1, 1) * radius * 1;  //Noise amplitude
  radius += noiseFactor;

  //Generate points for the shape
  let points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = i * angleStep;
    const x = centerX + radius * cos(angle);
    const y = centerY + radius * sin(angle);
    points.push([x, y]);
  }

  //Draw lines instead of a closed shape
  const baseColor1 = color(100, 0, 100, transparency);  //Base color
  stroke(lerpColor(baseColor1, color(100, 25, 100), random(0, 2)));
  noFill();
  beginShape(LINES);
  for (let i = 0; i < points.length; i++) {
  const p1 = points[i];
  const p2 = points[(i + 1) % points.length];  //Connect points
  vertex(p1[0], p1[1]);
  vertex(p2[0], p2[1]);
}
endShape();

  //Draw the shape
  const baseColor2 = color(255, 0, 100, transparency);  //Base color
  
  beginShape();
  stroke(lerpColor(baseColor2, color(255, 10, 10), random(0, 2)));
  for (const point of points) {
    vertex(point[0], point[1]);
  }
  endShape(CLOSE);
}


function Pattern3(fft) {
    spectrum = fft.getValue();
    let fftVal = fft.getValue();

    //Sensible dB range 
    let minFFT = -96;
    let maxFFT = -15;

    //Loop through the fft values and scale them accordingly to values between 0-1
    for (let i = 0; i < fftVal.length; i++) {
        let scaledValues = map(fftVal[i], minFFT, maxFFT, 0, 1, true);
        fftVal[i] = scaledValues;
    }

    if (fftVal > 0.2) {
        noiseseed(frameCount*2);
    }
    
    const scaleX = width * 1.5;
    const scaleY = height * 1.5;
    let noiseStep = 20;
    
    //const c = color(26, 201, 155, 60);
    
    translate(width/2, height/2);
    rectMode(CENTER);
    

    const baseColor2 = color(0, 140, 0, 120);  //Base color

    stroke(lerpColor(baseColor2, color(0, 255, 0, 120), random(0, 2)));
    strokeWeight(2);
    noFill();
    beginShape();
    
    for (let i = 0; i < fftVal.length/10; i++) {
        const noiseX = noise(i*noiseStep, spectrum[i]*fftVal[i]) - 0.5;
        const noiseY = noise(i*noiseStep + 5000, spectrum[i]*fftVal[i]) - 0.5;
        vertex(noiseX * scaleX, noiseY * scaleY);
    }
    
    endShape();
}


function slider_0_Moved() {
    let pitch = sliders[0].value * 5; 
    pitchShift.pitch = pitch;
}


function slider_1_Moved() {
    let reverbAmount = sliders[1].value;
    reverb.wet.value = reverbAmount;
}

function slider_2_Moved() {
    let speed = (sliders[2].value+0.5)*1.2;
    currentPlayer.playbackRate = speed;
}

function hslider_0_Moved() {
    let dist = hsliders[0].value *2;
    distortion.distortion = dist;
}

function hslider_1_Moved() {
    let vol = hsliders[1].value*2;
    gainNode.gain.value = vol;
}


function selectPlayer(index) {
    if (currentPlayer) {
        currentPlayer.stop();
    }

    //Update current player
    startAudio();
    console.log('audio starting')
    currentPlayer = index === 0 ? player1 : player2;
    currentPlayer.start();
    return;
}

function mouseDragged() {
    //Work out if a slider has been moved.
    for (let i = 0; i < sliders.length; i++) {
        if (sliders[i].isInside(mouseX, mouseY)) {
            sliders[i].slide(mouseY);
            break;
        }
    }

    for (let i = 0; i < hsliders.length; i++) {
        if (hsliders[i].isInside(mouseX, mouseY)) {
            hsliders[i].slide(mouseX);
            break;
        }
    }
}