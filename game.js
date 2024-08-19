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
function has_winner(n_board,p_turn){
    let player = p_turn ? -1 : +1;
    
    // horizontaL
    for(let j = 0; j < 3; j++){
        let counter = 0;
        for(let i = 0; i < 3; i++){
            let idx = i + j * 3;
            if (n_board[idx] == player) counter++;
        }
        if (counter == 3) return 1;
    }
    // vertical
    for(let i = 0; i < 3; i++){
        let counter = 0;
        for(let j = 0; j < 3; j++){
            let idx = i + j * 3;
            if (n_board[idx] == player) counter++;
        }
        if (counter == 3) return 1;
    }
    if (((
        // diagonal 1
            n_board[0] == player &&
            n_board[4] == player &&
            n_board[8] == player) ||
        (
        // diagonal 2
            n_board[2] == player &&
            n_board[4] == player &&
            n_board[6] == player
        ))){
        return 1;
    }
    for (let i = 0; i < 9; i++) {
        if (n_board[i] == 0 ) return -1;   
    }
    return 0;

}

function on_block_click(ev){
    if (ev.target.classList.contains("locked") || game_ended || is_ai) {
        error_sound.play();
        return;
    }

    let sign = turn ? "circle" : "cross";
    let msg = "Its<span>";
    msg += !turn ? "O" : "X";
    msg += "</span>'s turn";
    
    let idx = +ev.target.dataset.idx;
    ev.target.classList.add(sign);
    ev.target.classList.add("locked");
    turn ? board[idx]= -1 : board[idx] = +1;

    let state = has_winner(board,turn);
    
    if (state == 1 || state == 0){
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
            console.log(idx);
            board_div.appendChild(create_block(idx));
        }
    }
    console.log(board_div);
}
function reset_board(){
    turn = true;
    board = [
        0,0,0,
        0,0,0,
        0,0,0
    ];
    game_ended = false;
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