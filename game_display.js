
let start_year = (new Date()).getFullYear();


function updateAllPurchases() {
    var listItems = document.querySelectorAll('li');
    listItems.forEach(function (li) {
        var cost = parseFloat(li.dataset.cost);
        if (li.dataset.is_market) {
            cost += LICENSING_FEE;
        }

        if (GOOD_POINTS >= cost) {
            li.style.opacity = 1;
        } else {
            li.style.opacity = 0.2;
        }
    });
}

function updateTime() {
    var year = start_year + Math.floor(seconds_elapsed / 4);
    var season = seconds_elapsed % 4;
    document.getElementById("date").innerHTML = `Year: ${year} ${"|".repeat(season)}${".".repeat(4 - season)}`;
}

function updatePoints() {
    document.getElementById("s_points").innerHTML = formatNumber(GOOD_POINTS);
    document.getElementById("s_income").innerHTML = formatNumber(GOOD_POINTS_PER_SEC);
    document.getElementById("c_points").innerHTML = formatNumber(BAD_POINTS);
    document.getElementById("differencial").innerHTML = formatNumber(BAD_POINTS - GOOD_POINTS);

    document.getElementById("licensing_fee").innerHTML = formatNumber(LICENSING_FEE);
}

function updatePopulation() {
    document.getElementById("population").innerHTML = `${population}`;
    var disaster_chars = 20;
    var decimals = MOCK_disaster - Math.floor(MOCK_disaster);
    var interval = 1 / disaster_chars;
    var progress = Math.round(decimals / interval);
    document.getElementById("disaster").innerHTML = "|".repeat(progress) + ".".repeat(disaster_chars - progress);
}

function updateHtmlValues() {
    updateTime();
    updatePoints();
    updatePopulation();
    updateAllPurchases();
}
updateHtmlValues();
setInterval(updateHtmlValues, 500);

function pause() {
    GAME_PAUSED = !GAME_PAUSED;
    document.getElementById("pause").innerHTML = GAME_PAUSED ? ">>" : "||";
}