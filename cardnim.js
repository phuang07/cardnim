class Player {
    constructor(name, cards, play_time=120) {
        this.name = name;
        console.log("create player: " + name);
        this.cards = cards;
        this.time_remain = play_time;
        this.status = '';
        this.card_style= 'card1';
    }

    removeCard(card_index) {
        $('.game-board--previous-move').html(this.name + " removed " +this.cards[card_index] + " stones. ");
        this.cards.splice(card_index,1);
        console.log(this.cards);
    }
}



var game=function($){
    return {
        num_players: 0,
        player_list: new Array(),
        current_player_index: 0,
        stone_style: 'stone0',
        com_delay: 5000,

        init: function(){
            // console.log("game init")

            this.onClickSetNumPlayers()
            this.onClickStart()
            this.onClickReset()
            this.checkSpecialDate()
            
        },
        checkSpecialDate: function() {
            if (this.isThanksgivingDate()) {
                this.stone_style = 'turkey';
            }
        },
        onClickSetNumPlayers: function(){
            $('#num_players').on('change', function(e){
                if ($(this).val() == 'na'){
                    alert("Please select number of players")
                } else {
                    $('.game-player-name-list').empty()
                    for(var i = 1; i <= $(this).val(); i++) {
                        $('.game-player-name-list').append('<input type="text" class="form-control player-name-field" required id="player_'+i+'" value="player_'+i+'" placeholder="Enter name for player '+i+'" aria-label="Player name">');
                    }
                }
            })
        },
        onClickStart: function(){
            $('#start').on('click', function(e){
                e.preventDefault();
                game.num_players = $('.game-player-name-list').length
                game.num_stones = $('#num_stones').val()
                game.num_cards = $('#num_cards').val()
                game.disableConfigForm();
                game.hideSplashImg();
                if (game.status == 'In Progress') {
                    if (confirm("Game in Progress. Start a new game?") == true) {
                        game.resetGame();
                      }                 
                } else if(game.status == 'End') {
                    if (confirm("The game has ended. Start a new game?") == true) {
                        game.resetGame();
                      }       
                } else {
                    game.setupGamePlayers();
                    game.status = 'In Progress';
                    // game.setNextPlayer();
                    game.renderGameBoard();
                }
            })
        },
        onClickReset: function() {
            $('#reset').on('click', function(){
                if (confirm("Start a new game?") == true) {
                    game.resetGame();
                  }   
            });
        },
        resetGame: function() {
            window.location.reload();
        },
        disableConfigForm: function() {
            $(".game-config-form input, .game-config-form select").prop('disabled', true);
        },
        hideSplashImg: function() {
            $('.splash').hide();
        },
        setupGamePlayers: function() {
            cards = game.generateCards($('#num_stones').val(), $('#num_cards').val(), $('#useRandom').is(":checked"));
            players = new Array();
            for(var i = 0; i < $('.player-name-field').length; i++) {
                cards = game.generateCards($('#num_stones').val(), $('#num_cards').val(), $('#useRandom').is(":checked"));
                player = new Player($('.player-name-field')[i].value, Object.create(cards), $('#play_time').val())
                player.card_style = 'card'+i;
                players.push(player);
            }

            // do a shuffle
            shuffle = (array) => array.sort(() => Math.random() - 0.5);
            shuffle(players);

            game.player_list= players;
            game.renderGameBoard()

        },
        renderGameBoard() {
            game.updateGamePlayers()
            game.updateGameBoard()
            game.updateCurrentPlayer()
            game.updateGameStatus()
        },
        generateCards: function(num_stones, num_cards, useRandom) {
            var cards;
            if (useRandom) {
                var sum = 0;
                do {
                    cards = new Array();
                    for (var i = 0; i < num_cards; i++) {
                        cards.push(Math.floor(Math.random() * Math.floor(num_stones/2)) + 1);
                    }
                    sum = cards.reduce((partialSum, a) => partialSum + a, 0);
                } while(sum <= num_stones);
                
                cards = cards.sort(function(a, b){return a - b});

            } else {
                cards = new Array();
                for( var i = 1; i<= $('#num_cards').val(); i++) {
                    cards.push(i);
                }
            }

            return cards;
        },
        updateGameStatus: function() {
            let renderStr = "";
            renderStr = " Stones remain: " + game.num_stones;

            $('.game-board--stone-remain').html(renderStr);
        },
        updateGamePlayers: function() {
            $('.game-players').empty();
            for ( var i = 0; i < game.player_list.length; i++) {
                game.renderPlayer(game.player_list[i]);
            }
        },
        renderPlayer: function(player) {
            
            let renderStr = "";
            renderStr = "<fieldset class='player border'><legend class='float-none w-auto p-2'>"+player.name+"</legend>";
            if (player.status == "lose") {
                renderStr += "<span class='lost'></span>"
            }
            renderStr += "<ul>";
            
            for(var i = 0; i < player.cards.length; i++) {
                renderStr += "<li class='game-card "+player.card_style+" 'data-value='"+player.cards[i]+"'>"+player.cards[i]+"</li>";
            }

            renderStr += "</ul></div></fieldset>";
            
            $('.game-players').append(renderStr);
        },
        updateGameBoard: function() {
            let renderStr = "";
            renderStr = "<ul class='game-board--stone-list'>";
            for(var i = 0; i < game.num_stones; i++) {
                renderStr += "<li class='stone "+game.stone_style+"'>&nbsp;</li>";
            }

            renderStr += "</ul>";
                        
            $('.game-board .game-board--main').empty();
            $('.game-board .game-board--main').append(renderStr);

        },
        updateCurrentPlayer: function() {

            clearInterval(game.timer);
            
            var player = game.player_list[game.current_player_index]
            let renderStr = "";
            renderStr = "<fieldset class='current_player border'>";
            renderStr += "<legend class='float-none w-auto p-2'>"+player.name+"'s turn";
            renderStr+= " (Time remain: <span id='time_remain'>"+player.time_remain+"</span>s)</legend>";
            renderStr += "<ul>";
            
            for(var i = 0; i < player.cards.length; i++) {
                renderStr += "<li class='game-card "+player.card_style+" 'data-index='"+i+"' data-value='"+player.cards[i]+"'>"+player.cards[i]+"</li>";
            }

            renderStr += "</ul>";
            
            if (player.name == 'COM') {
                renderStr += "<div class='com_player_overlay'>xyz</div>";
            }

            renderStr += "</fieldset>";

            $('.game-current-player').empty();
            $('.game-current-player').append(renderStr);

            // Register listener
            $('.game-current-player .game-card').on('click', function(e){

                if (game.status == "End") {
                    if (confirm("The game has ended. Start a new game?") == true) {
                        game.resetGame();
                      }                 
                } else {
                    // remove player card
                    player.removeCard($(this).data('index'));
                    game.removeStones($(this).data('value'));
                    if(game.isEnd()) {
                        game.renderGameBoard();                        
                        game.announceResult();
                    } else {
                        game.setNextPlayer();
                        game.renderGameBoard();                        
                    }
                }
            });
            // timer
            clearInterval(game.timer);
            game.timer = setInterval(function(){
                player.time_remain = player.time_remain - 1;
                $('#time_remain').text(player.time_remain);

                if (player.time_remain <= 0) {
                    player.status = 'lose';
                    if(game.isEnd()) {
                        game.renderGameBoard();                        
                        game.announceResult();
                    } else {
                        game.setNextPlayer();
                        game.renderGameBoard();                        
                    }                     
                }

            }, 1000);            
            
            console.log("player name:", player.name);
            if (player.name == 'COM') {
                game.comPlaying(player);
            }

        },
        setNextPlayer: function() {
            var index = game.current_player_index + 1;

            if (index == game.player_list.length) {
                index = 0;
            }
            var player = game.player_list[index]
            
            var counter = 0;
            while(player.status == 'lose') {
                index += 1;
                if (index == game.player_list.length) {
                    index = 0;
                }
                player = game.player_list[index];
                counter++;
                if (counter > 100) { 
                    console.log("Can't find next player.");
                    $('.game-board--status').html("No game winner");
                    game.endGame();
                    break ; 
                }
            }

            game.current_player_index = index;
            
        },
        comPlaying: function(player) {
            console.log('computer player');
            let card_val = 999999;
            let index = 0;
            let counter = 0;
            setTimeout(() => { console.log("Sleep");
            while (card_val > game.num_stones) {
                index = Math.floor(Math.random() * (player.cards.length));
                card_val = player.cards[index];
                counter++;
                if (counter > 100) {
                    index = 0;
                    break;
                }
            }
            
            console.log("choose " + card_val);
            player.removeCard(index);
            game.removeStones(card_val);
            if(game.isEnd()) {
                game.setNextPlayer();
                game.announceResult();
            } else {
                game.setNextPlayer();
                game.renderGameBoard();                        
            }       
        }, game.com_delay);


        },
        removeStones: function(num_stones) {
            if (game.num_stones < num_stones) {
                game.setPlayerStatus(game.player_list[game.current_player_index], 'lose');

                // if (game.player_list.length == 2) {
                //     game.announceResult();
                // }


            } else if(game.num_stones == num_stones) {
                game.setPlayerStatus(game.player_list[game.current_player_index], 'win');
                game.num_stones = game.num_stones - num_stones;
            } else {
                game.num_stones = game.num_stones - num_stones;
            }
        },

        setPlayerStatus: function(player, status) {
            player.status = status;
        },
        setGameStatus: function(status) {
            game.status = status;
        },
        getActivePlayers: function() {
            var active_players = new Array();
            game.player_list.forEach((player, i) => {
                if(player.status !== "lose") {
                    active_players.push(player);
                }
            });
            return active_players;
        },
        getWinner: function() {
            var winner;
            game.player_list.forEach((player, i) => {
                if(player.status == "win") {
                    winner = player;
                }
            });
            return winner;
        },        
        isEnd: function() {
            if (game.num_stones == 0) {
                game.setGameStatus('End');
                return true;
            }
            active_players = game.getActivePlayers();
            if (active_players.length == 1) {
                game.setGameStatus('End');
                active_players[0].status = 'win';
                return true;
            } else {
                return false;
            }
        },        
        announceResult: function() {
            var winner = game.getWinner();
            $('.game-board--status').html("Winner: " + winner.name);
            game.endGame();
        },
        endGame: function() {
            // todo: handle post game clean up
            clearInterval(game.timer);

        },
        // Get the date of thanksgiving.
        // https://coffeescript-cookbook.github.io/chapters/dates_and_times/date-of-thanksgiving
        isThanksgivingDate: function() {
            var theyear = new Date().getFullYear();
            var nov1stDay = new Date(theyear, 10, 1, 0, 0, 0, 0);
            var dayOfWeek = nov1stDay.getDay();
            var tgDayOfMonth = nov1stDay.getDate() - (dayOfWeek - 4) + 21;
            tgDayOfMonth =  22 + (11 - dayOfWeek) % 7 +'.' + (parseInt(nov1stDay.getMonth(), 10)+1);
            
            // if(tgDayOfMonth == 21){
            //    tgDayOfMonth = 28;
            // }
            // else{
            //     tgDayOfMonth = nov1stDay.getDate() - (dayOfWeek - 4) + 21;
            // }

            const date = new Date();
            today =  date.getDate() + "." + parseInt(date.getMonth() + 1, 10);
            
            return today == tgDayOfMonth;
        }
    }
}(jQuery);




(function($){

$(document).ready(function(){
    game.init()
})


})(jQuery)


