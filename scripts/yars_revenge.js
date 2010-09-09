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
      speed: 16,
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
      var e = enemy.barrier;
      ctx.fillStyle = this.shot.color;
      if (!this.shot.fired) {
        this.shot.fired = true;
        this.shot.x = this.x + this.width;
        this.shot.y = this.y + this.height / 2 - 2;
      }
      else if (this.shot.x <= canvas.width - 4) {
        this.shot.fired = true;
        this.shot.x += this.shot.speed;
      }
      else {
        this.shot.fired = false;
      }
      if (this.shot.fired) {
        ctx.fillRect(this.shot.x, this.shot.y, this.shot.width, this.shot.height);
      }
      if (this.shot.y >= e.y && this.shot.y + this.shot.height <= e.y + e.height) {
        if (this.shot.x + this.shot.width >= e.x) {
          var x = this.shot.x + this.shot.width - e.x,
              y = this.shot.y - e.y;
          x = Math.floor((x + (x % e.box_size)) / e.box_size);
          y = Math.floor((y + (y % e.box_size)) / e.box_size);
          if (y < e.matrix.length && x < e.matrix[y].length) {
            if (e.matrix[y][x] === 1) {
              e.matrix[y][x] = 0;
              this.shot.fired = false;
              if (x < e.matrix[y].length - 1 && y < e.matrix.length - 1) { e.matrix[y + 1][x + 1] = 0; }
              if (y - 1 >= 0 && x < e.matrix[y - 1].length - 1) { e.matrix[y - 1][x + 1] = 0; }
              if (x < e.matrix[y].length - 1) { e.matrix[y][x + 1] = 0; }
              if (x < e.matrix[y].length - 2) { e.matrix[y][x + 2] = 0; }
            }
          }
        }
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
      height: 256,
      box_size: 16,
      color: "#7b2910",
      dir: "d",
      matrix: [],
      initMatrix: function() {
        for (var i = 0; i < 16; i++) {
          this.matrix[i] = [];
          for (var q = 0; q < 8; q++) {
            this.matrix[i][q] = 0;
          }
        }
        for (var i = 4; i < 8; i++) { this.matrix[0][i] = 1; }
        for (var i = 3; i < 8; i++) { this.matrix[1][i] = 1; }
        for (var i = 2; i < 8; i++) { this.matrix[2][i] = 1; }
        for (var i = 1; i < 7; i++) { this.matrix[3][i] = 1; }
        for (var i = 0; i < 6; i++) { this.matrix[4][i] = 1; }
        for (var i = 0; i < 5; i++) { this.matrix[5][i] = 1; }
        for (var i = 0; i < 4; i++) {
          for (var q = 0; q < 4; q++) {
            this.matrix[i + 6][q] = 1;
          }
        }
        for (var i = 0; i < 5; i++) { this.matrix[10][i] = 1; }
        for (var i = 0; i < 6; i++) { this.matrix[11][i] = 1; }
        for (var i = 1; i < 7; i++) { this.matrix[12][i] = 1; }
        for (var i = 2; i < 8; i++) { this.matrix[13][i] = 1; }
        for (var i = 3; i < 8; i++) { this.matrix[14][i] = 1; }
        for (var i = 4; i < 8; i++) { this.matrix[15][i] = 1; }
      }
    },
    drawQotile: function() { drawImage(this.qotile.sprite, this.qotile.x, this.qotile.y); },
    drawBarrier: function() {
      var b = this.barrier.box_size;
      ctx.fillStyle = this.barrier.color;
      for (var y = 0, len1 = this.barrier.matrix.length; y < len1; y++) {
        for (var x = 0, len2 = this.barrier.matrix[y].length; x < len2; x++) {
          if (this.barrier.matrix[y][x]) {
            ctx.fillRect(this.barrier.x + x * b, this.barrier.y + y * b, b, b);
          }
        }
      }
    },
    moveBase: function() {
      if (this.barrier.dir === "d") {
        if (this.barrier.y < canvas.height / 2 - 64) {
          this.barrier.y += 2;
          this.qotile.y += 2;
        }
        else {
          this.barrier.y -= 2;
          this.qotile.y -= 2;
          this.barrier.dir = "u";
        }
      }
      else {
        if (this.barrier.y > canvas.height / 2 - 192) {
          this.barrier.y -= 2;
          this.qotile.y -= 2;
        }
        else {
          this.barrier.y += 2;
          this.qotile.y += 2;
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
  enemy.barrier.initMatrix();

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