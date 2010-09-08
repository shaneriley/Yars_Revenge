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
    },
    draw: function() {
      var max_x = canvas.width - this.width,
          max_y = canvas.height - this.height;
      if (key[37]) {
        this.current_sprite = this.current_sprite % 2 ? 0 : 1;
      }
      if (key[38]) {
        this.current_sprite = this.current_sprite % 2 ? 2 : 3;
      }
      if (key[39]) {
        this.current_sprite = this.current_sprite % 2 ? 4 : 5;
      }
      if (key[40]) {
        this.current_sprite = this.current_sprite % 2 ? 6 : 7;
      }
      this.x -= key[37] && this.x > 0 ? this.speed : 0;
      this.x += key[39] && this.x < max_x ? this.speed : 0;
      this.y -= key[38] && this.y > 0 ? this.speed : 0;
      this.y += key[40] && this.y < max_y ? this.speed : 0;
      this.x > max_x ? this.x = max_x : 1;
      this.x < 0 ? this.x = 0 : 1;
      this.y > max_y ? this.y = max_y : 1;
      this.y < 0 ? this.y = 0 : 1;
      drawImage(this.sprites[player.current_sprite], this.x, this.y);
    },
    drawShot: function() {
      ctx.fillStyle = this.shot.color;
      if (!this.shot.fired) {
        this.shot.fired = true;
        this.shot.x = this.x + this.width;
        this.shot.y = this.y + this.height / 2 - 2;
      }
      else if (this.shot.x <= canvas.width - 4) {
        this.shot.fired = true;
        this.shot.x += 8;
      }
      else {
        this.shot.fired = false;
      }
      if (this.shot.fired) {
        ctx.fillRect(this.shot.x, this.shot.y, this.shot.width, this.shot.height);
      }
    }
  };
  player.current_sprite = 6;

  var enemy = {
    qotile: {
      sprite: newImage("qotile.gif"),
      width: 32,
      height: 36
    },
    barrier: {
      x: canvas.width - 128,
      y: canvas.height / 2 - 128,
      box_w: 64,
      box_h: 48,
      box_offset: 16,
      color: "#b21d17",
      dir: "d"
    },
    drawQotile: function() { drawImage(this.qotile.sprite, this.qotile.x, this.qotile.y); },
    drawBarrier: function() {
      var start_x = canvas.width - this.barrier.box_w,
          start_y = this.barrier.y;
      ctx.fillStyle = this.barrier.color;
      for (var i = 0; i < 5; i++) {
        if (i) {
          start_x -= this.barrier.box_offset;
          start_y += this.barrier.box_offset;
        }
        ctx.fillRect(start_x, start_y, this.barrier.box_w, this.barrier.box_h);
      }
      start_y += this.barrier.box_h;
      ctx.fillRect(start_x, start_y, this.barrier.box_w, this.barrier.box_offset * 2);
      start_y += this.barrier.box_offset * 2;
      for (var i = 0; i < 5; i++) {
        if (i) {
          start_x += this.barrier.box_offset;
          start_y += this.barrier.box_offset;
        }
        ctx.fillRect(start_x, start_y, this.barrier.box_w, this.barrier.box_h);
      }
    },
    moveBase: function() {
      if (this.barrier.dir === "d") {
        if (this.barrier.y < canvas.height / 2 - 64) {
          this.barrier.y++;
          this.qotile.y++;
        }
        else {
          this.barrier.y--;
          this.qotile.y--;
          this.barrier.dir = "u";
        }
      }
      else {
        if (this.barrier.y > canvas.height / 2 - 192) {
          this.barrier.y--;
          this.qotile.y--;
        }
        else {
          this.barrier.y++;
          this.qotile.y++
          this.barrier.dir = "d";
        }
      }
    },
    draw: function() {
      this.drawQotile();
      this.drawBarrier();
      this.moveBase();
    }
  };
  enemy.qotile.x = canvas.width - enemy.qotile.width - 5;
  enemy.qotile.y = (canvas.height - enemy.qotile.height) / 2;

  var forcefield = {
    sprite: newImage("safe_field.png"),
    width: 41,
    height: 2671,
    x: 185,
    draw: function() {
      drawImage(this.sprite, this.x, -Math.round(Math.random() * (this.height - canvas.height) / 2));
    }
  };
  var key = [];
  var game = setInterval(function() { run(); }, 34);
  this.onkeydown = this.onkeyup = function(e) {
    key[e.which] = (e.type == "keydown");
    if (e.type == "keydown" && e.keyCode == 32 && !player.shot.fired) {
      player.drawShot();
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
    player.draw();
    enemy.draw();
    forcefield.draw();
    if (player.shot.fired) {
      player.drawShot();
    }
  }

  function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawImage(img, x, y) {
    var doIt = function() {
      ctx.drawImage(img, x, y);
    };
    img.complete ? doIt() : img.onload = doIt;
  }

  function newImage(src) {
    var img = new Image();
    img.src = "images/" + src;
    return img;
  }
});