getData();
async function getData(){
    const response = await fetch('/info');
    const data = await response.json();
    document.getElementById('game_title').innerHTML = data.title;
    document.getElementById('game_comments').innerHTML = data.comments;
    document.getElementById('game_contestants').innerHTML = data.contestants;
}