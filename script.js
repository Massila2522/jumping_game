window.addEventListener('load', function(){
  const canvas = this.document.getElementById('canvas1');
  const ctx = canvas.getContext('2d');
  canvas.width = 730;
  canvas.height = 1000;

  const amarelo = this.document.getElementById("amarelo");
  const azul = this.document.getElementById("azul");
  const rosa = this.document.getElementById("rosa");
  const verde = this.document.getElementById("verde");
  const startBtn = this.document.getElementById("startBtn");
  const restartBtn = this.document.getElementById("restartBtn");
  let player = "rosa";
  let gameStarted = false;

  azul.onclick = function(){
    player = "azul";
    game.player.enterJump();
  }

  rosa.onclick = function(){
    player = "rosa";
    game.player.enterJump();
  }

  verde.onclick = function(){
    player = "verde";
    game.player.enterJump();
  }

  amarelo.onclick = function(){
    player = "amarelo";
    game.player.enterJump();
  }

  startBtn.onclick = function(){
    gameStarted = true;
  }

  restartBtn.onclick = function(){
    location.reload();
  }

  class InputHandler{
    constructor(game){
      this.game = game;
      window.addEventListener('keydown', e => {
        if( ((e.key === ' ') || (e.key === 'ArrowLeft') || (e.key === 'ArrowRight'))
        && this.game.keys.indexOf(e.key) === -1){
         this.game.keys.push(e.key);
        }
      });

      window.addEventListener('keyup', e => {
        if(this.game.keys.indexOf(e.key) > -1){
          this.game.keys.splice(this.game.keys.indexOf(e.key), 1);
        }
      });
    }
  }

  class Player{
    constructor(game){
      this.game = game;
      this.frame = 0;
      this.maxFrame = 20;
      this.spriteWidth = 154;
      this.spriteHeight = 217;
      this.width = this.spriteWidth * 0.9;
      this.height = this.spriteHeight * 0.9;
      this.x = 489;
      this.y = 689.7;
      this.fps = 20;
      this.frameTimer = 0;
      this.frameInterval = 1000/this.fps;
      this.vy = 0;
      this.weight = 1;
      this.speed = 0;
      this.maxSpeed = 17.6;
      this.image = document.getElementById("idle_" + player);
      this.isJumping = false;
    }
    update(deltaTime){
      this.y += this.game.move;

      this.x += this.speed;
      this.y += this.vy;

      if(this.x - 37 < 0){
        this.x = -37;
      } else if(this.x + this.width + 37 > this.game.width){
        this.x = this.game.width - this.width + 37;
      }

      if(this.isJumping){
        this.image = document.getElementById("jump_" + player);
        this.maxFrame = 17;
          if(this.frameTimer > this.frameInterval){
            if(this.frame < this.maxFrame){
              this.frame++;
            }
            else{
              this.isJumping = false;
              this.image = document.getElementById("idle_" + player);
              this.frame = 0;
              this.maxFrame = 20;
              this.frameTimer = 0;
            }
          } else{
            this.frameTimer += deltaTime;
          }
      } else{
        if(this.frame < this.maxFrame){
          this.frame++;
        } else{
          this.frame = 0;
        }
      }

      this.touchDown(this.game.layer.allLands);

      if(this.game.keys.includes(' ')){
        this.enterJump();
      }

      if(this.game.keys.includes('ArrowLeft')) {
        this.x -= 3;
      } else if(this.game.keys.includes('ArrowRight')){
        this.x += 3;
      }

      if(this.onLand(this.game.layer.allLands)){
        this.vy = 0;
        this.speed = 0;
        if((this.game.keys.includes(' '))){
          if(this.game.keys.includes('ArrowLeft')){
            this.enterJump();
            this.speed = -this.maxSpeed;
            this.vy = -22;
          } else if(this.game.keys.includes('ArrowRight')){
            this.enterJump();
            this.speed = this.maxSpeed;
            this.vy = -22;
          }
        }
      } else{
        this.vy += this.weight;
      }

      if(this.y > this.game.height){
        this.game.gameOver = true;
      }
    }
    draw(context){
      context.drawImage(this.image, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
    enterJump(){
      this.isJumping = true;
      this.frame = 0;
      this.maxFrame = 18;
    }
    onLand(lands) {
      return lands.some(land => {
        return (land.y === (this.y + this.height - 6)) && (land.x - 82 <= this.x) && (land.x + land.width - 58 >= this.x);
      });
    }
    touchDown(lands){
      for(let i=0; i<lands.length; i++){
        if( lands[i].y === (this.y + this.height - 6) ){
          this.y = lands[i].y - this.height + 6;
          this.speed = 0;
          this.vy = 0;
        }
      }
    } 
  }

  class Star{
    constructor(game){
      this.game = game;
      this.width = 66;
      this.height = 63;
      this.x = Math.random() * (this.game.width - this.width);
      this.y = 0;
      this.speedY = Math.random() * -1.5 - 0.5;
      this.image = document.getElementById("estrela");
      this.markedForDeletion = false;
    }
    update(){
      this.y -= this.speedY - this.game.move;
      if(this.y >= this.game.height + this.height){
        this.markedForDeletion = true;
      }
    }
    draw(context){
      context.drawImage(this.image, this.x, this.y);
    }
  }

  class Thorn{
    constructor(game){
      this.game = game;
      this.spriteWidth = 27;
      this.spriteHeight = 70;
      this.width = this.spriteWidth * 0.9;
      this.height = this.spriteHeight * 0.9;
      this.x = Math.random() * (this.game.width - this.width);
      this.y = 0;
      this.speedY = -5;
      this.image = document.getElementById("espinho");
      this.markedForDeletion = false;
    }
    update(){
      this.y -= this.speedY - this.game.move;
      if(this.y >= this.game.height + this.height){
        this.markedForDeletion = true;
      }
    }
    draw(context){
      context.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
  }

  class Land{
    constructor(game){
      this.game = game;
    }
    draw(context){
      context.drawImage(this.image, this.x, this.y);
    }
    setXY(x, y){
      this.x = x;
      this.y = y;
    }
  }

  class Land1 extends Land{
    constructor(game){
      super(game);
      this.width = 141;
      this.height = 79;
      this.image = document.getElementById('land1');
    }
  }

  class Land2 extends Land{
    constructor(game){
      super(game);
      this.width = 141;
      this.height = 79;
      this.image = document.getElementById('land2');
    }
  }

  class Land3 extends Land{
    constructor(game){
      super(game);
      this.width = 197;
      this.height = 118;
      this.image = document.getElementById('land3');
    }
  }

  class Land4 extends Land{
    constructor(game){
      super(game);
      this.width = 191;
      this.height = 115;
      this.image = document.getElementById('land4');
    }
  }

  class Land5 extends Land{
    constructor(game){
      super(game);
      this.width = 197;
      this.height = 118;
      this.image = document.getElementById('land5');
    }
  }

  class Land6 extends Land{
    constructor(game){
      super(game);
      this.width = 191;
      this.height = 115;
      this.image = document.getElementById('land6');
    }
  }

  class Background{
    constructor(game){
      this.game = game;
      this.spriteWidth = 730;
      this.spriteHeight = 1058;
      this.width = this.spriteWidth;
      this.height = this.spriteHeight - 58;
    }
    draw(context){
      context.drawImage(this.image, 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
      this.lands.forEach(land => land.draw(context));
    }
    setXY(x, y){
      this.x = x;
      this.y = y;
    }
  }

  class Background1 extends Background{
    constructor(game){
      super(game);
      this.image = document.getElementById('bg1');

      this.land1 = new Land2(this.game);
      this.land2 = new Land4(this.game);
      this.land3 = new Land6(this.game);
      this.land4 = new Land4(this.game);

      this.lands = [this.land1, this.land2, this.land3, this.land4];
    }
  }

  class Background2 extends Background{
    constructor(game){
      super(game);
      this.image = document.getElementById('bg4');

      this.land5 = new Land1(this.game);
      this.land6 = new Land4(this.game);
      this.land7 = new Land6(this.game);
      this.land8 = new Land3(this.game);

      this.lands = [this.land5, this.land6, this.land7, this.land8];
    }
  }

  class Background3 extends Background{
    constructor(game){
      super(game);
      this.image = document.getElementById('bg3');

      this.land9 = new Land1(this.game);
      this.land10 = new Land3(this.game);
      this.land11 = new Land5(this.game);
      this.land12 = new Land3(this.game);

      this.lands = [this.land9, this.land10, this.land11, this.land12];
    }
  }

  class Layer{
    constructor(game){
      this.game = game;

      this.backgrounds = [new Background1(this.game), new Background2(this.game), new Background3(this.game)];
      this.currentBg = this.backgrounds[0];
      this.nextBg = this.backgrounds[1];
      
      this.currentBg.setXY(0, 0);
      this.nextBg.setXY(0, this.currentBg.y - 1000); //1058

      this.allLands = [];
    }
    update(){
      this.currentBg.y += this.game.move;
      this.nextBg.setXY(0, this.currentBg.y - 1000); //1058

      this.currentBg.lands[0].setXY(489, this.currentBg.y + 879);
      this.currentBg.lands[1].setXY(80, this.currentBg.y + 629);
      this.currentBg.lands[2].setXY(439, this.currentBg.y + 379);
      this.currentBg.lands[3].setXY(80, this.currentBg.y + 129);

      this.nextBg.lands[0].setXY(489, this.nextBg.y + 879);
      this.nextBg.lands[1].setXY(80, this.nextBg.y + 629);
      this.nextBg.lands[2].setXY(439, this.nextBg.y + 379);
      this.nextBg.lands[3].setXY(80, this.nextBg.y + 129);

      this.allLands = [this.currentBg.lands[0], this.currentBg.lands[1], this.currentBg.lands[2], this.currentBg.lands[3], this.nextBg.lands[0], this.nextBg.lands[1], this.nextBg.lands[2], this.nextBg.lands[3]]; 

      if(this.currentBg.y >= this.currentBg.height){
        if(this.currentBg === this.backgrounds[0]){
          this.currentBg = this.backgrounds[1];
          this.nextBg = this.backgrounds[2];
        }
        else if(this.currentBg === this.backgrounds[1]){
          this.currentBg = this.backgrounds[2];
          this.nextBg = this.backgrounds[0];
        }
        else if(this.currentBg === this.backgrounds[2]){
          this.currentBg = this.backgrounds[0];
          this.nextBg = this.backgrounds[1];
        }
        this.currentBg.setXY(0, 0);
      }
    }
    draw(context){
      this.currentBg.draw(context);
      this.nextBg.draw(context);
    }
  }

  class UI{
    constructor(game){
      this.game = game;
      this.fontSize = 35;
      this.fontFamily = 'Bangers';
      this.color = 'white';
    }
    draw(context){
      context.save();
      context.fillStyle = this.color;
      context.shadowOffsetX = 5;
      context.shadowOffsetY = 5;
      context.shadowColor = 'black';
      context.font = this.fontSize + "px " + this.fontFamily;

      //score
      context.fillText('Score: ' + this.game.score, 20, 40);

      //distance
      context.fillText('Distance: ' + this.game.distance, 200, 40);

      //game over
      if(this.game.gameOver){
        context.textAlign = 'center';
        let message1 = "Game Over!";
        let message2 = "Score: " + this.game.score;
        let message3 = "Distance: " + this.game.distance;

        context.font = '70px ' + this.fontFamily;
        context.fillText(message1, this.game.width * 0.5, this.game.height * 0.5 - 20);

        context.font = '30px ' + this.fontFamily;
        context.fillText(message2, this.game.width * 0.5, this.game.height * 0.5 + 20);
        context.fillText(message3, this.game.width * 0.5, this.game.height * 0.5 + 60);
      }

      context.restore();
    }
  }

  class Game{
    constructor(width, height){
      this.width = width;
      this.height = height;
      this.layer = new Layer(this);
      this.player = new Player(this);
      this.input = new InputHandler(this);
      this.ui = new UI(this);
      this.keys = [];
      this.stars = [];
      this.thorns = [];
      this.move = 0;
      this.starTimer = 0;
      this.starInterval = 800;
      this.thornTimer = 0;
      this.thornInterval = 2000;
      this.score = 0;
      this.distance = 0;
      this.gameOver = false;
    }
    update(deltaTime){
      if(this.gameOver){
        gameStarted = false;
      }

      if(gameStarted){
        this.move = 2.5;
        this.distance++;
      } else{
        this.move = 0;
        this.starTimer = 0;
        this.thornTimer = 0;
        this.keys = [];
      }

      this.layer.update();
      this.player.update(deltaTime);

      //add stars
      if( (this.starTimer > this.starInterval) && (!this.gameOver)){
        this.addStar();
        this.starTimer = 0;
      } else{
        this.starTimer += deltaTime;
      }

      //add thorns
      if( (this.thornTimer > this.thornInterval) && (!this.gameOver)){
        this.addThorn();
        this.thornTimer = 0;
      } else{
        this.thornTimer += deltaTime;
      }

      //update stars
      this.stars.forEach(star => star.update());
      this.stars = this.stars.filter(star => !star.markedForDeletion);

      //update thorns
      this.thorns.forEach(thorn => thorn.update());
      this.thorns = this.thorns.filter(thorn => !thorn.markedForDeletion);

      //check collision between player and stars
      this.stars.forEach(star => {
        if(this.checkCollision(star,this.player)){
          star.markedForDeletion = true;
          if(!(this.gameOver)){
            this.score++;
          }
        }
      });

      //check collision between player and thorns
      this.thorns.forEach(thorn =>{
        if(this.checkCollision(thorn,this.player)){
          this.gameOver = true;
        }
      });
    }
    draw(context){
      this.layer.draw(context);
      this.ui.draw(context);
      this.player.draw(context);

      //draw stars
      this.stars.forEach(star => star.draw(context));

      //draw thorns
      this.thorns.forEach(thorn => thorn.draw(context));
    }
    addStar(){
      this.stars.push(new Star(this));
    }
    addThorn(){
      this.thorns.push(new Thorn(this));
    }
    checkCollision(rect1, rect2){
      return( rect1.x + 30 < rect2.x + rect2.width &&
              rect1.x + 30 + rect1.width - 60> rect2.x &&
              rect1.y + 30 < rect2.y + rect2.height &&
              rect1.height - 60 + rect1.y + 30 > rect2.y )
    }
  }

  const game = new Game(canvas.width, canvas.height);

  let lastTime = 0;

  function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    game.update(deltaTime);
    game.draw(ctx);
    requestAnimationFrame(animate);
  }

  animate(0);
});