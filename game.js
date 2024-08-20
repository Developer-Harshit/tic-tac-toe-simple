// game state
let turn = true;
let game_ended = false;
let is_ai = false;
let board = [
    0,0,0,
    0,0,0,
    0,0,0
];


const move_sound = new Howl({
    src: ["/sfx/scribble.mp3"],
    volume:2.0
});
const error_sound = new Howl({
    src: ["/sfx/error.mp3"],
    volume:1.0
});
const over_sound = new Howl({
    src: ["/sfx/over.mp3"],
    volume:1.0
});

function display_message(str){
    const msg_box = document.getElementById("msg-box");
    msg_box.innerHTML = str;
}


/*
 1 = player won
 0 = draw
-1 = nothing
 */
function has_winner(board,turn){
    let player = turn ? -1 : +1;
    
    // horizontaL
    for(let j = 0; j < 3; j++){
        let counter = 0;
        for(let i = 0; i < 3; i++){
            let idx = i + j * 3;
            if (board[idx] == player) counter++;
        }
        if (counter == 3) return player;
    }
    // vertical
    for(let i = 0; i < 3; i++){
        let counter = 0;
        for(let j = 0; j < 3; j++){
            let idx = i + j * 3;
            if (board[idx] == player) counter++;
        }
        if (counter == 3) return player;
    }
    if (((
        // diagonal 1
            board[0] == player &&
            board[4] == player &&
            board[8] == player) ||
        (
        // diagonal 2
            board[2] == player &&
            board[4] == player &&
            board[6] == player
        ))){
        return player;
    }
    for (let i = 0; i < 9; i++) {
        if (board[i] == 0 ) return 2;
    }
    return 0;

}


function minimax(board,turn,depth){
    let state = has_winner(board,turn);
    if (depth == 0 && state == 2) state = 0;
    if (state != 2 || depth == 0) return state;
    depth--;

    // minimizing player
    // let player = turn ? 1 : -1;
    if (turn){
        let value = 100;
        for (let i = 0; i < 9; i++) {
            if(board[i] != 0) continue;
            board[i] = 1;
            value = Math.min(value, minimax(board,false,depth));
            board[i] = 0;
        }
        return value;
    }
    // maxmizing player
    else{
        let value = -100;
        for (let i = 0; i < 9; i++) {
            if(board[i] != 0) continue;
            board[i] = -1;
            value = Math.max(value, minimax(board,true,depth));
            board[i] = 0;
        }
        return value;
    }
}

function play_best_move(){

    const player = turn ? -1 : 1;
    let best_score = 0;
    let best_idx = -1;
    for (let i = 0; i < 9; i++) {
        if(board[i] != 0) continue;
        board[i] = player;
        let score = minimax(board,turn,20);
        if (best_idx == -1){
            best_score = score;
            best_idx = i;
        }
        if((turn && score < best_score) || (!turn && score > best_score)){
            best_score = score;
            best_idx = i;
        }
        board[i] = 0;
    }
    let sign_div = document.querySelector(`[data-idx="${best_idx}"]`);
    if (!sign_div){
        error_sound.play();
        return;
    }
    play_move(sign_div);
}
function play_move(target){
    let sign = turn ? "circle" : "cross";
    let msg = "Its<span>";
    msg += !turn ? "O" : "X";
    msg += "</span>'s turn";

    let idx = +target.dataset.idx;
    target.classList.add(sign);
    target.classList.add("locked");
    turn ? board[idx] = -1 : board[idx] = +1;

    let state = has_winner(board,turn);
    
    if (state != 2){
        game_ended = true;
        msg = "Game ended , ";
        if (state == 0) msg += "Nobody won"
        else {
            msg += "Player<span>";
            msg += turn ? "O" : "X";
            msg += "</span>won";
        }

        over_sound.play();
    }
    display_message(msg);
    move_sound.play();
    turn = !turn;
}
function on_block_click(ev){
    if (ev.target.classList.contains("locked") || game_ended || is_ai) {
        error_sound.play();
        return;
    }
    play_move(ev.target);
}
function create_block(idx){
    const block_div = document.createElement("div");
    
    block_div.classList.add("block-div");
    
    const sign_div = document.createElement("div");
    sign_div.classList.add("sign-div");
    
    sign_div.addEventListener("click",on_block_click);
    sign_div.dataset.idx = idx;
    
    block_div.appendChild(sign_div);
    return block_div;
}
function generate_board(){
    const board_div = document.getElementById("board-div");
    for(let j = 0; j < 3; j++){
        for(let i = 0; i < 3; i++){
            let idx = i + j * 3;
            board_div.appendChild(create_block(idx));
        }
    }

    const ai_btn =  document.getElementById("ai-btn");
    ai_btn.addEventListener("click",()=>{
        if(game_ended || has_winner(board,turn) != 2) {
            error_sound.play();
            return;
        }
        is_ai = true;
        setTimeout(()=>{
            play_best_move();
            is_ai = false;
        },100);
    });
}
function reset_board(){
    turn = true;
    board = [
        0,0,0,
        0,0,0,
        0,0,0
    ];
    game_ended = false;
    is_ai = false;
    display_message("Game Started");
    const sign_div_list = document.querySelectorAll(".sign-div");
    sign_div_list.forEach(sign_div => {
        sign_div.classList.remove("circle");
        sign_div.classList.remove("cross");
        sign_div.classList.remove("locked");
    });

}


function start_game(){
    generate_board();
    const reset_btn = document.getElementById("reset-btn");
    reset_btn.addEventListener("click",reset_board);

}

addEventListener("DOMContentLoaded",start_game);