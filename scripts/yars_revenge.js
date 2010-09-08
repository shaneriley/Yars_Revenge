$(function() {
  var canvas = $("canvas")[0];
  var ctx = canvas.getContext("2d");
  var player = {
    sprites: [
      newImage("player_l_1.gif"),
      newImage("player_l_2.gif"),
      newImage("player_u_1.gif"),
      newImage("player_u_2.gif"),
      newImage("player_r_1.gif"),
      newImage("player_r_2.gif"),
      newImage("player_d_1.gif"),
      newImage("player_d_2.gif")
    ],
    width: 32,
    height: 32,
    lives: 3,
    speed: 12,
    x: 40,
    y: (canvas.height - 32) / 2,
    shot: {
      width: 4,
      height: 4,
      color: "#ffffff",
      fired: false
    }
  };
  player.current_sprite = 6;
  var qotile = {
    sprite: newImage("qotile.gif"),
    width: 32,
    height: 36
  };
  qotile.x = canvas.width - qotile.width - 5;
  qotile.y = (canvas.height - qotile.height) / 2;
  var barrier = {
    x: canvas.width - 128,
    y: canvas.height / 2 - 128,
    box_w: 64,
    box_h: 48,
    box_offset: 16,
    color: "#b21d17",
    dir: "d"
  };
  var forcefield = {
    sprite: newImage("safe_field.png"),
    width: 41,
    height: 2671,
    x: 185
  };
  var key = [];
  var game = setInterval(function() { run(); }, 34);
  this.onkeydown = this.onkeyup = function(e) {
    key[e.which] = (e.type == "keydown");
    if (e.type == "keydown" && e.keyCode == 32 && !player.shot.fired) {
      shot();
    }
    if (e.type == "keydown" && e.keyCode == 80) {
      if (!this.game_paused) {
        this.game_paused = true;
        clearInterval(game);
        ctx.font = "bold 26px monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = "white";
        ctx.fillText("PAUSED", canvas.width / 2, canvas.height / 2);
      }
      else {
        this.game_paused = false;
        game = setInterval(function() { run(); }, 34);
      }
    }
  };

  function run() {
    clearCanvas();
    drawPlayer();
    drawBase();
    drawForcefield();
    if (player.shot.fired) {
      shot();
    }
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function shot() {
    ctx.fillStyle = player.shot.color;
    if (!player.shot.fired) {
      player.shot.fired = true;
      player.shot.x = player.x + player.width;
      player.shot.y = player.y + player.height / 2 - 2;
    }
    else if (player.shot.x <= canvas.width - 4) {
      player.shot.fired = true;
      player.shot.x += 8;
    }
    else {
      player.shot.fired = false;
    }
    if (player.shot.fired) {
      ctx.fillRect(player.shot.x, player.shot.y, player.shot.width, player.shot.height);
    }
  }

  function drawPlayer() {
    var max_x = canvas.width - player.width,
        max_y = canvas.height - player.height;
    if (key[37]) {
      player.current_sprite = player.current_sprite % 2 ? 0 : 1;
    }
    if (key[38]) {
      player.current_sprite = player.current_sprite % 2 ? 2 : 3;
    }
    if (key[39]) {
      player.current_sprite = player.current_sprite % 2 ? 4 : 5;
    }
    if (key[40]) {
      player.current_sprite = player.current_sprite % 2 ? 6 : 7;
    }
    player.x -= key[37] && player.x > 0 ? player.speed : 0;
    player.x += key[39] && player.x < max_x ? player.speed : 0;
    player.y -= key[38] && player.y > 0 ? player.speed : 0;
    player.y += key[40] && player.y < max_y ? player.speed : 0;
    player.x > max_x ? player.x = max_x : 1;
    player.x < 0 ? player.x = 0 : 1;
    player.y > max_y ? player.y = max_y : 1;
    player.y < 0 ? player.y = 0 : 1;
    drawImage(player.sprites[player.current_sprite], player.x, player.y);
  }

  function drawBase() {
    drawqotile();
    drawBarrier();
    moveBase();
  }

  function drawForcefield() {
    drawImage(forcefield.sprite, forcefield.x, -Math.round(Math.random() * (forcefield.height - canvas.height) / 2));
  }

  function drawImage(img, x, y) {
    var doIt = function() {
      ctx.drawImage(img, x, y);
    };
    img.complete ? doIt() : img.onload = doIt;
  }

  function drawqotile() {
    drawImage(qotile.sprite, qotile.x, qotile.y);
  }

  function drawBarrier() {
    var start_x = canvas.width - barrier.box_w,
        start_y = barrier.y;
    ctx.fillStyle = barrier.color;
    for (var i = 0; i < 5; i++) {
      if (i) {
        start_x -= barrier.box_offset;
        start_y += barrier.box_offset;
      }
      ctx.fillRect(start_x, start_y, barrier.box_w, barrier.box_h);
    }
    start_y += barrier.box_h;
    ctx.fillRect(start_x, start_y, barrier.box_w, barrier.box_offset * 2);
    start_y += barrier.box_offset * 2;
    for (var i = 0; i < 5; i++) {
      if (i) {
        start_x += barrier.box_offset;
        start_y += barrier.box_offset;
      }
      ctx.fillRect(start_x, start_y, barrier.box_w, barrier.box_h);
    }
  }

  function moveBase() {
    if (barrier.dir === "d") {
      if (barrier.y < canvas.height / 2 - 64) {
        barrier.y++;
        qotile.y++;
      }
      else {
        barrier.y--;
        qotile.y--;
        barrier.dir = "u";
      }
    }
    else {
      if (barrier.y > canvas.height / 2 - 192) {
        barrier.y--;
        qotile.y--;
      }
      else {
        barrier.y++;
        qotile.y++
        barrier.dir = "d";
      }
    }
  }

  function newImage(src) {
    var img = new Image();
    img.src = "images/" + src;
    return img;
  }
});