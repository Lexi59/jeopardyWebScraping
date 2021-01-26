const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

// TO DO: pick random game
var URL;

async function findPossibleGames(){
    const listURL = "https://j-archive.com/listseasons.php";
    const {data} = await axios.get(listURL);
    var $ = cheerio.load(data);
    var listOfSeasons = [];
    var gameIDs = [];

    $('#content').find('a').each((index, element) =>{
        const $element = $(element);
        listOfSeasons.push($element.attr('href'));
    });
    for(var i =0; i < listOfSeasons.length; i++){
        const {data} = await axios.get(("https://www.j-archive.com/" + listOfSeasons[i]));
        $ = cheerio.load(data);
        $('#content').find('a').each((index, element) =>{
            const $element = $(element);
            const href = $element.attr('href').split('game_id=')[1];
            if(href){gameIDs.push(href);}
        });
    }
    var currentGameID = gameIDs[Math.floor(Math.random() * gameIDs.length)];
    URL = ("http://www.j-archive.com/showgame.php?game_id=" + currentGameID.toString())
    console.log("New Game ID: " + currentGameID);
}

async function getQuestions(){
    // TO DO : fix Final Jeopardy answer problem
    const {data} = await axios.get(URL);
    const $ = cheerio.load(data);
    const questions = [];
    $('.clue').each((index,element)=>{
        const $element = $(element);
        const value = $element.find('.clue_value').text();
        const clue = $element.find('.clue_text').text();
        var ans = $element.find('div').first().attr('onmouseover');
        if(ans){
            ans = ans.match(/<em class="correct_response">.+<\/em>/)[0].replace('<em class="correct_response">','').replace("</em>","").trim();
        }
        const question = {
            value,
            clue,
            ans,
        };
        questions.push(question);
    });
    var finalJeopardyAns = $('#final_jeopardy_round').find('div').first().attr('onmouseover');
    if(finalJeopardyAns){
        finalJeopardyAns = finalJeopardyAns.match(/<em class=\\"correct_response\\">.+<\/em>/)[0].replace('<em class=\\"correct_response\\">','').replace("</em>","").trim();
    }
    questions[questions.length-1]['ans'] = finalJeopardyAns;
    return questions;
}
async function getCategories(){
    const {data} = await axios.get(URL);
    const $ = cheerio.load(data);
    const categories = [];
    $('.category').each((index,element)=>{
        const $element = $(element);
        const title = $element.find('.category_name').text();
        categories.push(title);
    });
    return categories;
}

async function getInfo(){
    const {data} = await axios.get(URL);
    const $ = cheerio.load(data);
    var contestants = [];
    const title = $('#game_title').find('h1').first().text();
    const comments = $('#game_comments').text();
    $('.contestants').each((index,element)=>{
        const name = $(element).find('a').first().text();
        contestants.push(name);
    });
    contestants = contestants.join(', ');
    const info = {
        title,
        comments,
        contestants,
    }
    return info;
}
const app = express();
app.use(morgan('dev'));
app.use(cors());
app.use(express.static('public'));

app.get('/', (req, res)=>{
    res.json({"message": "Hello World!"});
});

app.get('/categories', async (req, res)=>{
    const categories = await getCategories();
    res.json(categories);
});

app.get('/questions', async (req, res)=>{
    const questions = await getQuestions();
    res.json(questions);
});
app.get('/info', async (req, res)=>{
    const info = await getInfo();
    res.json(info);
});

const port = process.env.PORT || 8080;
app.listen(port, ()=>{
    console.log(`Listening at http://localhost:${port}`);
});

findPossibleGames();
var now = new Date();
var millisTill10 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 0, 0, 0) - now;
if (millisTill10 < 0) {
     millisTill10 += 86400000; // it's after 10am, try 10am tomorrow.
}
setTimeout(findPossibleGames, millisTill10);