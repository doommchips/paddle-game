var ballX = 75;
var ballY = 75;
var ballSpeedX = 10;
var ballSpeedY = 5;

const BRICK_W = 80;
const BRICK_H = 20;
const BRICK_GAP = 2;
const BRICK_COLS = 10;
const BRICK_ROWS = 14;
var brickGrid = new Array(BRICK_COLS * BRICK_ROWS);
var bricksRemaining = 0;

const PADDLE_WIDTH = 100;
const PADDLE_THICKNESS = 10;
const PADDLE_DIST_FROM_EDGE = 60;
var paddleX = 400;

var canvas, canvasContext;

var mouseX = 0;
var mouseY = 0;

function updateMousePos(evt) {
    var rect = canvas.getBoundingClientRect();
    var root = document.documentElement;

    mouseX = evt.clientX - rect.left - root.scrollLeft;
    mouseY = evt.clientY - rect.top  - root.scrollTop;

    paddleX = mouseX - (PADDLE_WIDTH/2);

    // cheats
    // ballX = mouseX;
    // ballY = mouseY;
    // ballSpeedX = 4;
    // ballSpeedY = -4;
}

function brickReset() {
    bricksRemaining = 0;
    var i;
    for(i = 0; i < 3 * BRICK_COLS; i++) {
        brickGrid[i] = false;
    }
    for(; i < BRICK_COLS * BRICK_ROWS; i++) {
        brickGrid[i] = true;
        bricksRemaining++;
    }       // end of for each brick
}           // end of brickReset func

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    canvasContext = canvas.getContext('2d');

    var framesPerSecond = 30;
    setInterval(updateAll, 1000/framesPerSecond);

    canvas.addEventListener('mousemove', updateMousePos);

    brickReset();
    ballReset();
}

function updateAll() {
    moveAll();
    drawAll();
}

function ballReset() {
    ballX = canvas.width/2;
    ballY = canvas.height/2;
}

function ballMove() {
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    if(ballX < 0 && ballSpeedX < 0.0) {     // left
        ballSpeedX *= -1;
    }
    if(ballX > canvas.width && ballSpeedX > 0.0) {  // right
        ballSpeedX *= -1;
    }
    if(ballY < 0 && ballSpeedY < 0.0) {     // top
        ballSpeedY *= -1;
    }
    if(ballY > canvas.height) {             // bottom
        ballReset();
        brickReset();
    }
}

function isBrickAtColRow(col, row) {
    if (col >= 0 && col < BRICK_COLS &&
        row >= 0 && row < BRICK_ROWS) {
        var brickIndexUnderCoord = rowColToArrayIndex(col, row);
        return brickGrid[brickIndexUnderCoord];
    } else {
        return false;
    }
}

function ballBrickHandling() {
    var ballBrickCol = Math.floor(ballX / BRICK_W);
    var ballBrickRow = Math.floor(ballY / BRICK_H);
    var brickIndexUnderBall = rowColToArrayIndex(ballBrickCol, ballBrickRow);

    if (ballBrickCol >= 0 && ballBrickCol < BRICK_COLS &&
        ballBrickRow >= 0 && ballBrickRow < BRICK_ROWS) {
        if (isBrickAtColRow(ballBrickCol, ballBrickRow)) {
            brickGrid[brickIndexUnderBall] = false;
            bricksRemaining--;
            console.log(bricksRemaining);

            var prevBallX = ballX - ballSpeedX;
            var prevBallY = ballY - ballSpeedY;
            var prevBrickCol = Math.floor(prevBallX / BRICK_W);
            var prevBrickRow = Math.floor(prevBallY / BRICK_H);
            var bothTestsFailed = true;

            if (prevBrickCol != ballBrickCol) {
                if(isBrickAtColRow(prevBrickCol, ballBrickRow) == false) {
                    ballSpeedX *= -1;
                    bothTestsFailed = false;
                }
            }
            if (prevBrickRow != ballBrickRow) {
                if (isBrickAtColRow(ballBrickRow, prevBrickRow) == false) {
                    ballSpeedY *= -1;
                    bothTestsFailed = false;
                }
            }

            if(bothTestsFailed) {   // armpit case
                ballSpeedX *= -1;
                ballSpeedY *= -1;
            }
        }   // end of brick found
    }       // end of valid col and row check
}           // end of func

function ballPaddleHandling() {
    var paddleTopEdgeY = canvas.height - PADDLE_DIST_FROM_EDGE;
    var paddleBottomEdgeY = paddleTopEdgeY + PADDLE_THICKNESS;
    var paddleLeftEdgeX = paddleX;
    var paddleRightEdgeX = paddleLeftEdgeX + PADDLE_WIDTH;

    if( ballY > paddleTopEdgeY &&       // below top of paddle
        ballY < paddleBottomEdgeY &&    // above bottom of paddle
        ballX > paddleLeftEdgeX &&      // right of left side of paddle
        ballX < paddleRightEdgeX) {     // left of right side of paddle
        ballSpeedY *= -1;
        console.log("hit");

        var centerOfPaddleX = paddleX + PADDLE_WIDTH/2;
        var ballDistFromPaddleCenterX = ballX - centerOfPaddleX;
        ballSpeedX = ballDistFromPaddleCenterX * 0.35;

        if(bricksRemaining == 0) {
            brickReset();
        }   // reset when out of bricks
    }       // ball center inside paddle
}           // ball paddle handling

function moveAll() {
    ballMove();
    ballBrickHandling();
    ballPaddleHandling();
}

function rowColToArrayIndex(col, row) {
    return col + BRICK_COLS * row;
}

function drawBricks() {
    for (var eachRow=0; eachRow<BRICK_ROWS; eachRow++) {
        for (var eachCol=0; eachCol<BRICK_COLS; eachCol++) {

            var arrayIndex = rowColToArrayIndex(eachCol, eachRow);

            if (brickGrid[arrayIndex]) {
                colourRect(BRICK_W*eachCol,BRICK_H*eachRow, BRICK_W-2,BRICK_H-2, 'blue');
            }   // end of is this brick here
        }       // end of for each brick col
    }           // end of for each brick row
}               // end of draw bricks func

function drawAll() {
    colourRect(0,0, canvas.width,canvas.height, 'black');   // clear screen
    colourCircle(ballX,ballY, 10, 'white');                 // draw ball
    // drawing the canvas and ball on every frame is needed
    // else old ball would not be removed and look as though had tail

    colourRect(paddleX,canvas.height - PADDLE_DIST_FROM_EDGE,
                        PADDLE_WIDTH,PADDLE_THICKNESS, 'white');

    drawBricks();
}

function colourRect(topLeftX,topLeftY, boxWidth,boxHeight, fillColour) {
    canvasContext.fillStyle = fillColour;
    canvasContext.fillRect(topLeftX,topLeftY, boxWidth,boxHeight);
}

function colourCircle(centerX,centerY, radius, fillColour) {
    canvasContext.fillStyle = fillColour;
    canvasContext.beginPath();
    canvasContext.arc(centerX,centerY, radius, 0,Math.PI*2, true)
    canvasContext.fill();
}

function colourText(showWords, textX,textY, fillColour) {
    canvasContext.fillStyle = fillColour;
    canvasContext.fillText(showWords, textX,textY);
}
