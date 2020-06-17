var fields = ["Title", "Composition Date", "Composer", "Composer Dates", "General Period", "Specific Period"];
var publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1smIE_qAu-6MrhU5eCD05ASQ28A3sU5juYBpjCgs2TEw/edit?usp=sharing";

var promptTemplate = document.getElementById("promptTemplate");
var cardTemplate = document.getElementById("cardTemplate");
var cardParent = document.getElementById("cards");
var playButtonTemplate = document.getElementById("playButtonTemplate");

var nrendered;
var player;
var number;
var period;
var instrumentation;
var selected = new Array();

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube', {
        width: 600,
        height: 400,
        videoId: '',
        playerVars: {
            color: 'white',
        },
        events: {
            onReady: youtubeLoaded
        }
    });
}

function youtubeLoaded() {
    console.log("youtubeLoaded");

}

function init() {
    if (document.getElementById("isRendered").innerHTML != "1") {


        Tabletop.init({
            key: publicSpreadsheetUrl,
            callback: showInfo
        })
    }
}

function showInfo(data, tabletop) {
    var cards = tabletop.sheets("Test Sheet").all();
    var ncards = cards.length;


    shuffle(cards);
    var urlParams = new URLSearchParams(window.location.search);
    number = urlParams.get("n");
    period = urlParams.get("p");
    instrumentation = urlParams.get("i");
    if (number != undefined) {

    }
    nrendered = 0;
    cards.forEach(generateCard);


}

function reveal(elmt) {
    var parentDiv = elmt.parentElement;
    var answer = parentDiv.lastElementChild;
    var currentStyle = answer.style.display;
    if (currentStyle != "block") {
        answer.style.display = "block";
        elmt.innerHTML = "visibility_off"
    } else {
        answer.style.display = "none"
        elmt.innerHTML = "visibility"
    }


}

function makeEntry(parent, question, answer) {

    var prompt = promptTemplate.cloneNode(true);
    prompt.id = "";
    var children = prompt.children
    children[0].innerHTML = question;
    children[3].innerHTML = answer;

    parent.children[0].appendChild(prompt);


}

async function playYoutube(url) {
    if (player.getPlayerState() == 1) {
        player.pauseVideo();
    } else {
        player.loadVideoById(YouTubeGetID(url));
        var state = -1;
        while (state != 1) {
            await new Promise(r => setTimeout(r, 10));
            state = player.getPlayerState();
        }
        player.pauseVideo();
        var duration = player.getDuration();
        var possibleStart = duration - 30;
        var startTime = Math.random() * possibleStart;

        player.loadVideoById({
            'videoId': YouTubeGetID(url),
            'startSeconds': startTime,
            'endSeconds': startTime + 30
        });
    }
}


function generateCard(element) {

    if (!((number > 0) && (nrendered >= number))) {
        if (element.Youtube != undefined && element.Youtube != "") {
            if ((period == undefined) || (period == "all") || (element["General Period"] == period)) {

                var thisInstrument = element["General Instrumentation"].toString().toLowerCase() 
                if((instrumentation == undefined) || (thisInstrument.includes(instrumentation))){


                var thisCard = cardTemplate.cloneNode(true);
                cardParent.appendChild(thisCard)

                for (var property in element) {
                    try {
                        if (!property.includes("hidden")) {

                            var question = property
                            var answer = element[property];
                            if (property != "Youtube") {
                                makeEntry(thisCard, question, answer);
                            } else {
                                var playButton = playButtonTemplate.cloneNode(true);
                                playButton.id = ""
                                playButton.children[0].setAttribute("onclick", "playYoutube('" + answer + "')");
                                playButton.children[1].setAttribute("onclick", "openYoutube('" + answer + "')");
                                thisCard.children[0].appendChild(playButton);
                            }
                        }

                    } catch {}
                }
                nrendered++;  
                selected= selected.concat(element);
                }


            }
        }


    }

}
    
function openYoutube(link){
    window.open(link)
}
    
function shuffleCards(){
    var newselected = shuffle(selected);
    console.log(newselected);
    var cards = cardParent.innerHTML = "";
    nrendered = 0;
    selected = [];
    newselected.forEach(generateCard);
   
   
}

function YouTubeGetID(url) {
    var ID = '';
    url.split(",")
    if (url.isArray) {
        url = url[Math.floor(Math.random() * url.length)]
    }
    console.log(url);
    url = url.replace(/(>|<)/gi, '').split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (url[2] !== undefined) {
        ID = url[2].split(/[^0-9a-z_\-]/i);
        ID = ID[0];
    } else {
        ID = url;
    }
    return ID;
}
var shuffle = function (array) {

    var currentIndex = array.length;
    var temporaryValue, randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;

};

window.addEventListener('DOMContentLoaded', init);
