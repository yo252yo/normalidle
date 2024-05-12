
let SPEED = 1;

let GAME_PAUSED = false;
let seconds_elapsed = 0;

// ==================================================================
// Basic points
let GOOD_POINTS = 10;
let GOOD_POINTS_PER_SEC = 2;

let BAD_POINTS = 0;

const BP_milestones = {
    "1": 1,
    "10": 55,
    "30": 210,
    "60": 520,
    "90": 800,
    "120": 1100,
    "150": 11000,
    "180": 55000,
    "210": 110000,
    "240": 1100000,
    "270": 11000000,
    "300": 11000000000,
}

function getBPMilestone(x) {
    let previousKey, nextKey = null;
    for (let key in BP_milestones) {
        if (key <= x) {
            previousKey = key;
        } else {
            nextKey = key;
            break;
        }
    }
    return { previousKey, nextKey };
}

function getBP(seconds) {
    var bp = 0;
    if (seconds in BP_milestones) {
        bp = BP_milestones[seconds];
    } else if (seconds > 300) {
        bp = Math.floor(1.4 * Math.pow(seconds, 4));
    } else {
        const milestones = getBPMilestone(seconds);
        const before = milestones.previousKey;
        const after = milestones.nextKey;
        const rate = (BP_milestones[after] - BP_milestones[before]) / (after - before);
        const interpol = BP_milestones[before] + rate * (seconds - before);
        bp = Math.floor(interpol);
    }

    return bp;
}

// This is the main game loop
function updatePoints() {
    // Plan the next tick
    setTimeout(updatePoints, 1000 / SPEED);

    if (GAME_PAUSED) {
        return;
    }
    seconds_elapsed++;
    GOOD_POINTS += GOOD_POINTS_PER_SEC;
    console.log(`At: ${seconds_elapsed}, ${GOOD_POINTS}$, ${GOOD_POINTS_PER_SEC}$/s`);
    BAD_POINTS = getBP(seconds_elapsed);
    PENDING_DISASTER_POINTS += Math.max(0, BAD_POINTS - GOOD_POINTS);

    // I know what i said before but i think we can let them celebrate small victories since they'll be crushed in the end
    // if (GOOD_POINTS > BAD_POINTS) { // For safety, this should never happen
    //     BAD_POINTS = GOOD_POINTS + 1;
    // }
    handleDisaster();
    updateHtmlValues();
}
setTimeout(updatePoints, 1000);


// ==================================================================
// Disaster / population
let TOTAL_DISASTER_POINTS = 0;
let PENDING_DISASTER_POINTS = 0;

let pop_rate_initial = 1000000000 / ((new Date("2024/01/01")).getTime() - (new Date("2013/01/01")).getTime());
let START_POPULATION = Math.floor(8106672020 + ((new Date()).getTime() - (new Date("2024/05/02")).getTime()) * pop_rate_initial);


var pop_disaster_ratio = 100;
var death_alert_threshold = 1;
var disasters_before_new_compassion_lvl = -1; // the first time we need one extra popup

function current_population() {
    return Math.max(0, Math.ceil(START_POPULATION - TOTAL_DISASTER_POINTS / pop_disaster_ratio));
}

function disaster_progress() { // in [0,1]
    return Math.min(1, PENDING_DISASTER_POINTS / (death_alert_threshold * pop_disaster_ratio));
}

function dismissDisaster() {
    TOTAL_DISASTER_POINTS += PENDING_DISASTER_POINTS;
    PENDING_DISASTER_POINTS = 0;

    disasters_before_new_compassion_lvl++;
    if (disasters_before_new_compassion_lvl == 2) {
        document.getElementById("compassion_slider").max = 1 + parseInt(document.getElementById("compassion_slider").max);
        document.getElementById("compassion_slider").disabled = false;
        document.getElementById("compassion_slider_disclaimer").style.display = "block";
    }

    displayPopulation();
    pause("ON");
}

var death_alert_thresholds = [1, 2, 5, 10, 20, 50, 100, 1000, 10000, 100000, 1000000, 10000000, 1000000000];
function changeCompassionSlider() {
    var index = document.getElementById("compassion_slider").value;
    if (index >= death_alert_thresholds.length) {
        index = death_alert_thresholds.length - 1;
    }
    death_alert_threshold = death_alert_thresholds[index];
    document.getElementById("compassion_fade").innerText = formatNumber(death_alert_threshold);
    disasters_before_new_compassion_lvl = 0;
}

function handleDisaster() {
    if (PENDING_DISASTER_POINTS > pop_disaster_ratio * death_alert_threshold) {
        pause("OFF");
        displayPopulation();
        displayPopup();
    }

    if (current_population() <= 0) {
        pause();
        alert("LOST");
        location.href = "difficulty.html";
    }
}

// ==================================================================
// Difficulty
var params = new URLSearchParams(window.location.href);
var difficulty = params.get('difficulty') || 0;


