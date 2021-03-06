var fields = ["Title", "Composition Date", "Composer", "Composer Dates", "General Period", "Specific Period"];
var publicSpreadsheetUrl = "https://docs.google.com/spreadsheets/d/1smIE_qAu-6MrhU5eCD05ASQ28A3sU5juYBpjCgs2TEw/edit?usp=sharing";

var promptTemplate = document.getElementById("promptTemplate");
var cardTemplate = document.getElementById("cardTemplate");
var cardParent = document.getElementById("cards");
var playButtonTemplate = document.getElementById("playButtonTemplate");
var sheetName = "Test Sheet";
var arng;
var nrendered;
var player;
var number;
var period;
var instrumentation;
var selected = new Array();
var group = "";
var counter = 0
var urlParams = new URLSearchParams(window.location.search);
var randomSeed;

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
            randomSeed = urlParams.get("seed");
    if (randomSeed == null || randomSeed ==''){
        randomSeed = Math.floor(Math.random()*100000);
        insertParam("seed", randomSeed)
        
    }
         arng = new alea(randomSeed);
        number = urlParams.get("n");
        period = urlParams.get("p");
        group = urlParams.get("g");
        sheeturl = urlParams.get("sheet");
        
        if (sheeturl != null){
            publicSpreadsheetUrl =  "https://docs.google.com/spreadsheets/d/" + sheeturl + "/edit";
            if (urlParams.get("name")!= null){
                sheetName = urlParams.get("name");
            }
        }
        
        console.log("opening " + publicSpreadsheetUrl + "... page name " + sheetName);


        Tabletop.init({
            key: publicSpreadsheetUrl,
            callback: showInfo
        })
    }
}

function showInfo(data, tabletop) {
    var cards = tabletop.sheets(sheetName).all();
    var ncards = cards.length;


    shuffle(cards);
    shuffle(cards);

    instrumentation = urlParams.get("i");
    if (number != undefined) {

    }
    counter = 0;
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

    parent.children[1].appendChild(prompt);


}

async function playYoutube(url) {
    arng = new alea(randomSeed+url.length)
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
        var possibleStart = duration - 60;
        var startTime = arng()* possibleStart;

        player.loadVideoById({
            'videoId': YouTubeGetID(url),
            'startSeconds': startTime,
            'endSeconds': startTime + 60
        });
    }
}


function generateCard(element) {

    if (!((number > 0) && (nrendered >= number))) {
        if ((group == undefined) || (element["Test Group hidden"].includes(group))){            
        
        if (element.Youtube != undefined && element.Youtube != "") {
            if ((period == undefined) || (period == "all") || (element["General Period"] == period)) {

                var thisInstrument = element["General Instrumentation"].toString().toLowerCase() 
                if((instrumentation == undefined) || (thisInstrument.includes(instrumentation))){


                var thisCard = cardTemplate.cloneNode(true);
                cardParent.appendChild(thisCard)
                //thisCard = thisCard.children[0];

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
                                thisCard.children[1].appendChild(playButton);
                            }
                        }                        

                    } catch {}
                    
                }
                nrendered++; 
                counter += 1;
                thisCard.children[0].innerHTML = counter;
                selected= selected.concat(element);
                }


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
    counter = 0;
    newselected.forEach(generateCard);
    
   
   
}

function YouTubeGetID(url) {
    var ID = '';
    url.split(",")
    if (url.isArray) {
        url = url[Math.floor(arng() * url.length)]
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
        randomIndex = Math.floor(arng() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;

};
    
function insertParam(key, value) {
    key = encodeURIComponent(key);
    value = encodeURIComponent(value);

    // kvp looks like ['key1=value1', 'key2=value2', ...]
    var kvp = document.location.search.substr(1).split('&');
    let i=0;

    for(; i<kvp.length; i++){
        if (kvp[i].startsWith(key + '=')) {
            let pair = kvp[i].split('=');
            pair[1] = value;
            kvp[i] = pair.join('=');
            break;
        }
    }

    if(i >= kvp.length){
        kvp[kvp.length] = [key,value].join('=');
    }

    // can return this or...
    let params = kvp.join('&');

    // reload page with new params
    document.location.search = params;
}
function newTest(){
    var newUrl = updateURLParameter(window.location.href,"seed",Math.floor(Math.random()*50000)); 
    window.location.href = newUrl;

    
}
    
    function updateURLParameter(url, param, paramVal){
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";
    if (additionalURL) {
        tempArray = additionalURL.split("&");
        for (var i=0; i<tempArray.length; i++){
            if(tempArray[i].split('=')[0] != param){
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }
    }

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}
    
window.addEventListener('DOMContentLoaded', init);
