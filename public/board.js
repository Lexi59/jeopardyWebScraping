var currentRound = 1;
let questions;
let currentAns;
let currentVal;
let visited = 0;
let myMoney = 0;
let dailyDoubleBet = 0;
let FJbet = 0;
getData();
getCategories();

async function getData(){
    const response = await fetch('/questions');
    var data = await response.json();
    if(currentRound == 1){
        document.getElementById('round_title').innerHTML = "Jeopardy Round!";
        data = data.slice(0,30);
    }
    else if (currentRound == 2){
        document.getElementById('round_title').innerHTML = "Double Jeopardy!";
        data = data.slice(30,60);
    }
    else{
        document.getElementById('round_title').innerHTML = "Final Jeopardy!";
        document.getElementById('question_text').innerHTML = data[60].clue;
        currentAns = data[60].ans;
        data = [];
    }
    const questionElements = $('.question');
    for(var i = 0; i < data.length; i++){
        if(data[i].value == "" && data[i].clue != ""){
            data[i].daily_double = true;
            if(i < 6){data[i].value = "$" + (100*currentRound);}
            else if (i < 12){data[i].value = "$" + (200*currentRound);}
            else if (i < 18){data[i].value = "$" + (300*currentRound);}
            else if (i < 24){data[i].value = "$" + (400*currentRound);}
            else{data[i].value = "$" + (500*currentRound);}
        }
        if(data[i].clue == ""){
            $(questionElements[i]).attr('class','question visited');
            visited++;
        }
        questionElements[i].innerHTML = data[i].value;
        $(questionElements[i]).attr('id',i);
    }
    questionElements.click(function(){loadQuestion();});
    questions = data;
}

async function getCategories(){
    const response = await fetch('/categories');
    var data = await response.json();
    if(currentRound == 1){data = data.slice(0,6);}
    else if (currentRound == 2){data = data.slice(6,12);}
    else{document.getElementById('question_text').innerHTML = data.slice(-1); data = [];}
    const categoryElements = $('.category_name');
    for(var i = 0; i < data.length; i++){
        categoryElements[i].innerHTML = data[i];
    }
}

function loadQuestion(){
    if($(event.target).attr('class').indexOf('visited') < 0 ){
        var id = parseInt($(event.target).attr('id'));
        $(event.target).attr('class','question visited')
        
        if(questions[id].daily_double){
            $('#question_text').css('color','red');
            document.getElementById("question_text").innerHTML = "DAILY DOUBLE: " + questions[id].clue;
            dailyDoubleBet = parseInt(prompt("DAILY DOUBLE! How much would you like to bet?"));
            while(isNaN(dailyDoubleBet) || dailyDoubleBet > Math.max(1000*currentRound, myMoney) || dailyDoubleBet <= 0){
                dailyDoubleBet = parseInt(prompt("Invalid input. How much would you like to bet?"));
            }
        }
        else{
            document.getElementById("question_text").innerHTML = questions[id].clue;
        }
        currentAns = questions[id].ans;
        currentVal = questions[id].value;
        questionScreen();
        visited++;
    }
}

function questionScreen(){
    $('#board').css('display','none');
    $('#back').css('display','block');
    $('#question_text').css('display','block');
    $('#answer').css('display','block');
}
function boardScreen(){
    $('#back').css('display','none');
    $('#question_text').css('display','none');
    $('#answer').css('display','none');
    $('#board').css('display','block');
    $('#answer').find('p')[0].innerHTML = "Show Answer"
    $('#answer').css('background-color','darkblue');
    $('#answer').css('color', 'white');
    $('#question_text').css('color','black');
    $('#scoring').css('display','none');
    if(visited == 30){
        currentRound++;
        getCategories();
        getData();
        resetVisited();
    }
    if(visited == 60){
        currentRound++;
        finalJeopardy();
    }
}

function showAnswer(){
    const ans = $('#answer')
    ans.css('background-color','white');
    ans.css('color', 'red');
    $('#answer').find('p')[0].innerHTML = currentAns;
    $('#scoring').css('display','block');
}

function loadBoard(val = false){
    if(dailyDoubleBet != 0){
        if(val){myMoney += dailyDoubleBet;}
        else{myMoney -= dailyDoubleBet;}
        dailyDoubleBet = 0;
        val = false;
    }
    if(FJbet != 0){
        if(val){myMoney += FJbet;}
        else{myMoney -= FJbet;}
        FJbet = 0;
        val = false;
        alert("END OF GAME! You Won $" + myMoney);
    }
    if(val){
        myMoney += parseInt(currentVal.substring(1));
    }
    document.getElementById('my_money').innerHTML = ("$" + myMoney.toString());
    boardScreen();
}

function resetVisited(){
    var questionElements = $('.question');
    for(var i = 0; i < questionElements.length; i++){
        $(questionElements[i]).attr('class','question');   
    }
}
async function finalJeopardy(){
    await getCategories();
    questionScreen();
    var topic = document.getElementById('question_text').innerHTML
    FJbet = parseInt(prompt("Final Jeopardy! The topic is \" " + topic + "\" You have $" + myMoney + " How much would you like to bet?"));
    while(isNaN(FJbet) || FJbet > myMoney || FJbet < 0){
        FJbet = parseInt(prompt("Invalid input! The topic is \" " + topic + "\" You have $" + myMoney + " How much would you like to bet?"));
    }
    getData();
    visited = 0;
}