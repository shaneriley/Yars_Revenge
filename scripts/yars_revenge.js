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
    speed: 12,
    x: 40,
    y: (canvas.height - 32) / 2,
    current_sprite: 6,
    shot: {
      width: 4,
      height: 4,
      color: "#ffffff",
      speed: 16,
      fired: false,
      draw: function() {
        if (player.dead) { return; }
        var e = enemy.barrier,
            p = player,
            s = this;
            dir = player.current_sprite;
        if (p.cannon.armed && !p.cannon.fired) {
          p.cannon.fired = true;
        }
        else {
          ctx.fillStyle = s.color;
          if (!s.fired) {
            s.fired = true;
            if (dir < 2) {
              s.x = p.x - s.width;
              s.y = p.y + p.height / 2 - 2;
              s.dir = "l";
            }
            else if (dir === 2 || dir === 3) {
              s.x = p.x + (p.width - s.width) / 2;
              s.y = p.y - s.height;
              s.dir = "u";
            }
            else if (dir === 4 || dir === 5) {
              s.x = p.x + p.width;
              s.y = p.y + p.height / 2 - 2;
              s.dir = "r";
            }
            else {
              s.x = p.x + (p.width - s.width) / 2;
              s.y = p.y + p.height;
              s.dir = "d";
            }
          }
          if (s.fired) {
            if (s.dir === "l") {
              (s.x >= s.width) ? s.x -= s.speed : s.fired = false;
            }
            else if (s.dir === "u") {
              (s.y >= s.height) ? s.y -= s.speed : s.fired = false;
            }
            else if (s.dir === "r") {
              (s.x <= canvas.width - s.width) ? s.x += s.speed : s.fired = false;
            }
            else {
              (s.y <= canvas.height - s.height) ? s.y += s.speed : s.fired = false;
            }
            if (s.fired) { ctx.fillRect(s.x, s.y, s.width, s.height); }
          }
          if (s.y >= e.y && s.y + s.height <= e.y + e.height) {
            if (s.x + s.width >= e.x) {
              var x = s.x + s.width - e.x,
                  y = s.y - e.y;
              x = (x * 2 - 1 < e.box_size * 2) ? 0 : Math.floor((x + (x % e.box_size) + 1) / e.box_size);
              y = Math.floor((y + (y % e.box_size)) / e.box_size);
              if (y < e.matrix.length && x < e.matrix[y].length) {
                if (e.matrix[y][x - 1]) { x--; }
                if (e.matrix[y][x]) {
                  e.matrix[y][x] = 0;
                  tally.score += e.points;
                  s.fired = false;
                  if (x < e.matrix[y].length - 1 && y < e.matrix.length - 1) {
                    e.matrix[y + 1][x + 1] = 0;
                    tally.score += e.points;
                  }
                  if (y - 1 >= 0 && x < e.matrix[y - 1].length - 1) {
                    e.matrix[y - 1][x + 1] = 0;
                    tally.score += e.points;
                  }
                  if (x < e.matrix[y].length - 1) {
                    e.matrix[y][x + 1] = 0;
                    tally.score += e.points;
                  }
                  if (x < e.matrix[y].length - 2) {
                    e.matrix[y][x + 2] = 0;
                    tally.score += e.points;
                  }
                }
              }
            }
          }
        }
      }
    },
    cannon: {
      width: 32,
      height: 16,
      cycle: 4,
      speed: 16,
      colors: ["#52319c", "#31319c", "#8c5a21", "#390063"],
      armed: false,
      fired: false,
      draw: function() {
        var c = this,
            r = function(x, y, w, h) { ctx.fillRect(x, y, w, h); };
        if (c.fired) {
          c.x += 16;
          if (c.x >= canvas.width) {
            c.fired = c.armed = false;
          }
        }
        else {
          c.x = 5;
          c.y = (player.height - c.height) / 2 + player.y;
        }
        ctx.save();
        for (var i in c.colors) {
          ctx.fillStyle = c.colors[i];
          r(c.x, c.y + i * 4, c.width, 4);
          c.colors[i] = generateColor(.1, Math.floor(Math.random() * 60));
        }
        ctx.restore();
        c.cycle--;
        if (!c.cycle) {
          c.cycle = 4;
          c.width = (c.width === 32) ? 16 : 32;
        }
        if (c.fired) { c.checkCollision(); }
      },
      checkCollision: function() {
        var c = this;
        c.checkQotileCollision();
        c.checkBarrierCollision();
        c.checkPlayerCollision();
      },
      checkQotileCollision: function() {
        var c = this,
            q = enemy.qotile;
        if ((c.y >= q.y && c.y <= q.y + q.height) || (c.y + c.height >= q.y && c.y + c.height <= q.y + q.height)) {
          if (c.x + c.width >= q.x && c.x <= q.x + q.width) {
            if (!q.swirl.swirling) {
              tally.score += q.points;
            }
            else {
              if (q.swirl.attacking) {
                tally.score += q.swirl.airborne_points;
                tally.lives++;
              }
              else { q.swirl.points; }
            }
            player.shot.fired = q.swirl.swirling = q.swirl.attacking = c.armed = c.fired = false;
            player.x = 40;
            player.y = (canvas.height - 32) / 2;
            player.current_sprite = 6;
            enemy.barrier.initMatrix();
            enemy.shot.x = canvas.width - 90;
            enemy.shot.y = canvas.height / 2;
            q.swirl.next_attack = q.countdown = 80 + Math.floor(Math.random() * 150);
            q.x = canvas.width - q.width - 5;
            q.y = enemy.barrier.y + (enemy.barrier.height / 2 - q.height / 2);
            score();
          }
        }
      },
      checkBarrierCollision: function() {
        var c = this,
            b = enemy.barrier;
        if (c.y >= b.y && c.y + c.height <= b.y + b.height) {
          if (c.x + c.width >= b.x) {
            var x = c.x + c.width - b.x,
                y = c.y - b.y;
            x = (x * 2 - 1 < b.box_size * 2) ? 0 : Math.floor((x + (x % b.box_size) + 1) / b.box_size);
            y = Math.floor((y + (y % b.box_size)) / b.box_size);
            if (y < b.matrix.length && x < b.matrix[y].length) {
              if (b.matrix[y][x - 1]) { x--; }
              if (b.matrix[y][x]) {
                b.matrix[y][x] = 0;
                if (b.matrix.length >= y + 1) { b.matrix[y + 1][x] = 0; }
                tally.score += b.points * 2;
                c.fired = c.armed = false;
              }
            }
          }
        }
      },
      checkPlayerCollision: function() {
        var c = this,
            p = player;
        if ((c.y >= p.y && c.y <= p.y + p.height) || (c.y + c.height >= p.y && c.y + c.height <= p.y + p.height)) {
          if (c.x + c.width >= p.x && c.x <= p.x + p.width && !p.dead) {
            p.kill();
          }
        }
      }
    },
    draw: function() {
      var p = this,
          max_x = canvas.width - p.width,
          max_y = canvas.height - p.height;
      if (!p.dead) {
        if (key[37]) {
          p.current_sprite = p.current_sprite % 2 ? 0 : 1;
        }
        if (key[38]) {
          p.current_sprite = p.current_sprite % 2 ? 2 : 3;
        }
        if (key[39]) {
          p.current_sprite = p.current_sprite % 2 ? 4 : 5;
        }
        if (key[40]) {
          p.current_sprite = p.current_sprite % 2 ? 6 : 7;
        }
        p.x -= key[37] && p.x > 0 ? p.speed : 0;
        p.x += key[39] && p.x < max_x ? p.speed : 0;
        p.y -= key[38] && p.y >= 0 ? p.speed : 0;
        p.y += key[40] && p.y <= max_y ? p.speed : 0;
        p.x > max_x ? p.x = max_x : 1;
        p.x < 0 ? p.x = 0 : 1;
        p.y > max_y ? p.y = 0 : 1;
        p.y < 0 ? p.y = max_y : 1;
      }
      p.checkCollision();
      enemy.barrier.checkCollision();
      drawImage(p.sprites[player.current_sprite], p.x, p.y);
    },
    kill: function() {
      var p = this,
          i = 8;
      p.dead = true;
      tally.lives--;
      p.shot.fired = p.cannon.armed = p.cannon.fired = false;
      var flash = function() {
        p.current_sprite >= 6 ? p.current_sprite -= 6 : p.current_sprite += 2;
        if (i > 0) {
          i--;
          var q = setTimeout(function() { flash.apply(player); }, 68);
        }
        else {
          p.dead = false;
          p.current_sprite = 6;
          p.x = 40;
          p.y = (canvas.height - 32) / 2;
          enemy.shot.x = canvas.width - 90;
          enemy.shot.y = canvas.height / 2;
          enemy.qotile.x = canvas.width - enemy.qotile.width - 5;
          enemy.qotile.y = enemy.barrier.y + (enemy.barrier.height / 2 - enemy.qotile.height / 2);
          enemy.qotile.swirl.swirling = enemy.qotile.swirl.attacking = false;
          enemy.qotile.swirl.next_attack = enemy.qotile.countdown = 100 + Math.floor(Math.random() * 200);
          score();
        }
      };
      flash.apply(p);
    },
    checkCollision: function() {
      var p = this,
          q = enemy.qotile;
      if (!q.swirl.swirling && !p.cannon.armed) {
        if ((p.x >= q.x && p.x < q.x + q.width) || (p.x + p.width >= q.x && p.x + p.width < q.x + q.width)) {
          if ((p.y >= q.y && p.y < q.y + q.height) || (p.y + p.height >= q.y && p.y + p.height < q.y + q.height)) {
            p.cannon.armed = true;
          }
        }
      }
    }
  };

  var tally = {
    lives: 3,
    score: 0,
    numbers: {
      width: 28,
      height: 14,
      sprite: newImage("numbers.gif")
    }
  };

  var enemy = {
    qotile: {
      width: 32,
      height: 36,
      color: "#fff456",
      frequency: .1,
      len: 0,
      points: 1000,
      swirl: {
        sprite: newImage("swirl.gif"),
        points: 2000,
        airborne_points: 6000,
        width: 32,
        height: 32,
        swirling: false,
        attacking: false,
        next_attack: 80 + Math.floor(Math.random() * 150),
        draw: function() {
          var s = this;
          ctx.drawImage(s.sprite, 0, (enemy.qotile.countdown % 4 > 1 ? 0 : 32), 32, 32, enemy.qotile.x, enemy.qotile.y + 2, 32, 32);
          if (!s.attacking) {
            enemy.qotile.countdown--;
          }
          else if (enemy.qotile.x > 0) {
            enemy.qotile.x -= 16;
            enemy.qotile.y -= s.y_change;
          }
          else {
            s.attacking = false;
            s.swirling = false;
            s.next_attack = 100 + Math.floor(Math.random() * 200);
            enemy.qotile.countdown = s.next_attack;
            enemy.qotile.x = canvas.width - enemy.qotile.width - 5;
            enemy.qotile.y = enemy.barrier.y + (enemy.barrier.height / 2 - enemy.qotile.height / 2);
          }
          if (enemy.qotile.countdown === 0 && !s.attacking) {
            s.attacking = true;
            s.y_change = Math.sqrt(Math.pow(+(enemy.qotile.y - player.y), 2) + Math.pow(enemy.qotile.x - player.x + player.width, 2)) / (canvas.height / 2);
            if (enemy.qotile.y - player.y < 0) { s.y_change = -s.y_change; }
          }
        },
        checkCollision: function() {
          var p = player,
              q = enemy.qotile;
          if (p.dead) { return; }
          if (q.x < p.x + p.width &&
            q.x + q.width > p.x && q.y < p.y + p.height &&
            q.y + q.height > p.y) {
              p.kill();
          }
        }
      },
      draw: function() {
        var q = this,
            r = function(x, y, w, h) { ctx.fillRect(x, y, w, h); };
        ctx.fillStyle = q.color;
        r(q.x + 16, q.y, 16, 4);
        r(q.x + 12, q.y + 4, 8, 4);
        r(q.x + 8, q.y + 8, 8, 4);
        r(q.x, q.y + 12, 12, 12);
        r(q.x + 12, q.y + 16, 12, 4);
        r(q.x + 8, q.y + 24, 8, 4);
        r(q.x + 12, q.y + 28, 8, 4);
        r(q.x + 16, q.y + 32, 16, 4);
        r(q.x + 24, q.y, 8, 36);
        q.color = generateColor(q.frequency, q.len);
        (q.len > 49) ? q.len = 0 : q.len++;
        q.countdown--;
        if (q.countdown === 0) {
          q.swirl.swirling = true;
          q.swirl.next_attack = 10 + Math.floor(Math.random() * 80);
          q.countdown = q.swirl.next_attack;
        }
      },
    },
    barrier: {
      x: canvas.width - 128,
      y: canvas.height / 2 - 128,
      height: 256,
      box_size: 16,
      color: "#7b2910",
      dir: "d",
      matrix: [],
      points: 69,
      chomp_points: 169,
      initMatrix: function() {
        var b = this;
        for (var i = 0; i < 16; i++) {
          b.matrix[i] = [];
          for (var q = 0; q < 8; q++) {
            b.matrix[i][q] = 0;
          }
        }
        for (var i = 4; i < 8; i++) { b.matrix[0][i] = 1; }
        for (var i = 3; i < 8; i++) { b.matrix[1][i] = 1; }
        for (var i = 2; i < 8; i++) { b.matrix[2][i] = 1; }
        for (var i = 1; i < 7; i++) { b.matrix[3][i] = 1; }
        for (var i = 0; i < 6; i++) { b.matrix[4][i] = 1; }
        for (var i = 0; i < 5; i++) { b.matrix[5][i] = 1; }
        for (var i = 0; i < 4; i++) {
          for (var q = 0; q < 4; q++) {
            b.matrix[i + 6][q] = 1;
          }
        }
        for (var i = 0; i < 5; i++) { b.matrix[10][i] = 1; }
        for (var i = 0; i < 6; i++) { b.matrix[11][i] = 1; }
        for (var i = 1; i < 7; i++) { b.matrix[12][i] = 1; }
        for (var i = 2; i < 8; i++) { b.matrix[13][i] = 1; }
        for (var i = 3; i < 8; i++) { b.matrix[14][i] = 1; }
        for (var i = 4; i < 8; i++) { b.matrix[15][i] = 1; }
      },
      checkCollision: function() {
        var p = player;
        var adjustX = function() {
          if (p.current_sprite < 2) {
            p.x = b_x + this.box_size;
            p.y += this.dir === "d" ? 2 : -2;
          }
          else if (p.current_sprite > 3 && p.current_sprite < 6) {
            p.x = b_x - p.width;
            p.y += this.dir === "d" ? 2 : -2;
          }
        };
        for (var y = 0, y_len = this.matrix.length; y < y_len; y++) {
          for (var x = 0, x_len = this.matrix[y].length; x < x_len; x++) {
            if (this.matrix[y][x]) {
              var b_x = this.x + x * this.box_size,
                  b_y = this.y + y * this.box_size,
                  dir = p.current_sprite;
              if (p.x + p.width > b_x && p.x < b_x + this.box_size) {
                if ((b_y <= p.y && b_y + this.box_size > p.y) || (b_y < p.y + p.height && b_y + this.box_size >= p.y + p.height)) {
                  if (dir === 4 || dir === 5) {
                    p.x = b_x - p.width;
                  }
                  else if (dir < 2) {
                    p.x = b_x + this.box_size;
                  }
                  else if (dir === 2 || dir === 3) {
                    p.y = b_y + this.box_size;
                  }
                  else {
                    p.y = b_y - p.height;
                  }
                  if (10 + Math.floor(Math.random() * 10) === 14) {
                    this.matrix[y][x] = 0;
                    tally.score += this.chomp_points;
                    p.cannon.armed = true;
                  }
                }
              }
            }
          }
        }
      },
      draw: function() {
        var b = this.box_size;
        ctx.fillStyle = this.color;
        for (var y = 0, len1 = this.matrix.length; y < len1; y++) {
          for (var x = 0, len2 = this.matrix[y].length; x < len2; x++) {
            if (this.matrix[y][x]) {
              ctx.fillRect(this.x + x * b, this.y + y * b, b, b);
            }
          }
        }
      }
    },
    shot: {
      width: 16,
      height: 4,
      x: canvas.width - 90,
      y: canvas.height / 2,
      speed: 1,
      draw: function() {
        var s = this;
        ctx.fillStyle = enemy.qotile.color;
        ctx.globalCompositeOperation = "lighter";
        ctx.fillRect(s.x, s.y, s.width, s.height);
        s.x -= (player.x < s.x) ? s.speed : -s.speed;
        s.y -= (player.y + player.height / 2 < s.y) ? s.speed : -s.speed;
        ctx.globalCompositeOperation = "source-over";
        s.checkCollision();
      },
      checkCollision: function() {
        var p = player,
            f = forcefield,
            s = this;
        if (!p.dead) {
          if (!((p.x > f.x && p.x < f.x + f.width) || (p.x + p.width > f.x && p.x + p.width < f.x + f.width))) {
            if (s.x < p.x + p.width &&
              s.x + s.width > p.x && s.y < p.y + p.height &&
              s.y + s.height > p.y) {
                p.kill();
            }
          }
        }
      }
    },
    moveBase: function() {
      var b = this.barrier,
          q = this.qotile;
      if (b.dir === "d") {
        if (b.y < canvas.height / 2 - 92) {
          b.y += 2;
          if (!q.swirl.attacking) { q.y += 2; }
        }
        else {
          b.y -= 2;
          if (!q.swirl.attacking) { q.y -= 2; }
          b.dir = "u";
        }
      }
      else {
        if (b.y > canvas.height / 2 - 164) {
          b.y -= 2;
          if (!q.swirl.attacking) { q.y -= 2; }
        }
        else {
          b.y += 2;
          if (!q.swirl.attacking) { q.y += 2; }
          b.dir = "d";
        }
      }
    },
    draw: function() {
      var e = this;
      if (e.qotile.swirl.swirling) {
        e.qotile.swirl.draw();
        e.qotile.swirl.checkCollision();
      }
      else { e.qotile.draw(); }
      e.barrier.draw();
      e.moveBase();
      e.shot.draw();
    }
  };
  enemy.qotile.x = canvas.width - enemy.qotile.width - 5;
  enemy.qotile.y = (canvas.height - enemy.qotile.height) / 2;
  enemy.barrier.initMatrix();
  enemy.qotile.countdown = enemy.qotile.swirl.next_attack;

  var forcefield = {
    sprite: newImage("safe_field.png"),
    width: 112,
    height: 2671,
    x: 185,
    draw: function() {
      drawImage(this.sprite, this.x, -Math.round(Math.random() * (this.height - canvas.height) / 2));
    }
  };
  var key = [], game;
  titleScreen();
  $(document).bind("keydown keyup", function(e) {
    var cancel_default = (e.keyCode === 32 || (e.keyCode > 36 && e.keyCode < 41)),
        p = player,
        f = forcefield;
    key[e.which] = e.type === "keydown";
    if (e.type === "keydown" && e.keyCode === 32 && !p.shot.fired && !this.game_paused && this.game_started && !p.dead) {
      if (!((p.x > f.x && p.x < f.x + f.width) || (p.x + p.width > f.x && p.x + p.width < f.x + f.width))) {
        p.shot.draw();
      }
    }
    if (e.type === "keydown" && e.keyCode === 80 && this.game_started) {
      if (!this.game_paused) {
        this.game_paused = true;
        clearInterval(game);
        ctx.fillStyle = "#0066cc";
        ctx.globalAlpha = .7;
        ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 - 27, 160, 40);
        ctx.globalAlpha = 1;
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
    if (cancel_default) { e.preventDefault(); }
  });

  function gameOver() {
    clearInterval(game);
    setTimeout(function() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = "bold 26px monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 25);
      ctx.font = "bold 18px monospace";
      ctx.fillText("Score: " + tally.score, canvas.width / 2, canvas.height / 2 + 10);
    }, 40);
  }

  function score() {
    clearInterval(game);
    document.game_started = false;
    var score = "" + tally.score,
        lives = "" + tally.lives,
        y = 96,
        ch,
        w = tally.numbers.width,
        h = tally.numbers.height;
    var drawNumbers = function(str) {
      var ch, x = 380;
      for (var i = str.length - 1; i >= 0; i--) {
        ch = parseInt(str.charAt(i), 10);
        ctx.drawImage(tally.numbers.sprite, 0, h * ch, w, h, x, y, w, h);
        x -= w + 4;
      }
    };
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawNumbers(score);
    y += 52;
    drawNumbers(lives);
    $(document).bind("keyup.next_round", function(e) {
      if (tally.lives === 0) {
        resetGame();
      }
      this.game_started = true;
      $(this).unbind("keyup.next_round");
      game = setInterval(function() { run(); }, 34);
    });
  }

  function resetGame() {
    tally.lives = 3;
    tally.score = 0;
    player.x = 40;
    player.y = (canvas.height - 32) / 2;
    player.current_sprite = 6;
    player.shot.fired = false;
    player.dead = false;
    enemy.barrier.initMatrix();
    enemy.shot.x = canvas.width - 90;
    enemy.shot.y = canvas.height / 2;
  }

  function titleScreen() {
    var copyright = newImage("copyright.gif");
    copyright.onload = function() {
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(this, canvas.width / 2 - 80, 92);
    };
    document.game_started = false;
    $(document).bind("keyup.start_game", function(e) {
      if (e.keyCode === 32) {
        this.game_started = true;
        $(this).unbind("keyup.start_game");
        game = setInterval(function() { run(); }, 34);
      }
    });
  }

  function run() {
    clearCanvas();
    player.draw();
    enemy.draw();
    forcefield.draw();
    if (player.shot.fired) { player.shot.draw(); }
    if (player.cannon.armed) { player.cannon.draw(); }
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

  function generateColor(freq, len) {
    var c = {}, hex = "#";
    c.r = Math.round(Math.sin(freq * len) * 127 + 128);
    c.g = Math.round(Math.sin(freq * len + 2) * 127 + 128);
    c.b = Math.round(Math.sin(freq * len + 4) * 127 + 128);
    for (var i in c) {
      c[i] = c[i].toString(16);
      c[i].length < 2 ? c[i] = "0" + c[i] : 0;
      hex += c[i];
    }
    return hex;
  }
});