//function Hero(spriteSheet, flippedSpritesImage, startPoint, context, backgroungImageData, fps, platforms) {
function Hero(spriteSheet, startPoint, context, fps, platforms) {
  this.context = context;

  this.spriteSheet = spriteSheet;
  this.spriteSheet.run.spritesImgWidth = this.spriteSheet.run.imageRight.width;
  this.spriteSheet.stand.spritesImgWidth = this.spriteSheet.stand.imageRight.width;

  this.indexOfSpriteRun = 2;
  this.countOfSprites = spriteSheet.run.spritesRight.length;

  this.x = startPoint.x;
  this.y = startPoint.y;

  this.moveDirection = {
    old: null,
    new: null
  };

  this.velocity = 8;

  this.scaleWidthHeight = 1.5;

  this.height = this.spriteSheet.parameters.height * this.scaleWidthHeight;


  //this.currentDirection = 'right';
  this.lastMoveDirection = 'right';

  this.counter = 0;

  this.gravity = 10; // px/frame
  this.canFalling = true;

  this.status = 'stand';

  this.platforms = platforms;
}


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// FALLING AND GRAVITY
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hero.prototype.makeFalling = function() {
  this.y += this.gravity;
}

Hero.prototype.makeGravity = function() {
  for (var i = 0; i < this.platforms.length; i++) {
    this.canFalling = true;
    if (this.y + this.height - 4 >= this.platforms[i].y) {
      this.canFalling = false;
      break;
    }
  }
  if (this.canFalling) this.makeFalling();
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// MOVING
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hero.prototype._getMoveDirection = function() {
  return this.moveDirection.new ? this.moveDirection.new : this.moveDirection.old;
}

Hero.prototype.pushMoveDirection = function(direction) {
  if (this._getMoveDirection() == direction) return;
  if (!this.moveDirection.old) this.moveDirection.old = direction;
  else this.moveDirection.new = direction;

  this.moveDirectionChanged(direction);
}

Hero.prototype.deleteMoveDirection = function(direction) {
  if (this.moveDirection.old == direction)
    this.moveDirection.old = this.moveDirection.new;

  this.moveDirection.new = null;

  this.moveDirectionChanged(this.moveDirection.old);
}

Hero.prototype.moveDirectionChanged = function(newDirection) {

  this.lastMoveDirection = !!newDirection ? newDirection : this.lastMoveDirection;
  //if (newDirection == this.currentDirection) return;
  //this.currentDirection = newDirection;

  if (!this._getMoveDirection()) { // player standing
    this._changeStatus('stand');
  } else {
    this._changeStatus('run');
  }
}

Hero.prototype.move = function() {
  switch (this._getMoveDirection()) {
    case 'right':
      this.x += this.velocity;
      break;
    case "left":
      this.x -= this.velocity;
      break;
  }

  //this._draw();
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// STATUS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hero.prototype._changeStatus = function(newStatus) {
  this.status = newStatus;
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// UPDATE
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hero.prototype.update = function() {
  if (!!this._getMoveDirection()) {
    if (this.counter % 5 == 0) {
      this.indexOfSpriteRun = (this.indexOfSpriteRun + 1) % this.countOfSprites;
      this.counter = 0;
    }

    this.move();

    this.counter++;
  } /*else {
    this._draw();
  }*/

  this.makeGravity();
  
  this._draw();
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// DRAWING
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hero.prototype._draw = function() {
  //******************************
  //******************************
  // HELPER: HERO BACKGROUND
  //******************************
  //******************************
  var __index = 0 ;

  if (this.status == 'run') {
    __index = this.indexOfSpriteRun;
  } else if (this.status == 'stand') {
    __index = 0;
  }
  this.context.fillStyle = 'rgb(150, 150, 200)';
  this.context.fillRect(this.x, this.y,
    this.spriteSheet[this.status].spritesRight[__index].width * this.scaleWidthHeight,
    this.spriteSheet[this.status].spritesRight[__index].height * this.scaleWidthHeight);
  //******************************
  //******************************
  this.context.beginPath();
  this.context.fillStyle = "blue";
  this.context.font = "16px Arial";
  this.context.fillText('lastMoveDirection: ' + this.lastMoveDirection, 700, 100);
  this.context.fillText('this._getMoveDirection(): ' + this._getMoveDirection(), 700, 300);
  this.context.closePath();

  if (this.status == 'run') {
    if (this._getMoveDirection() == 'right' || ( /*this._getMoveDirection() == null &&*/ this.lastMoveDirection == 'right')) {
      this.context.drawImage(this.spriteSheet.run.imageRight,
        this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].x, this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].y,
        this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].width, this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].height,
        this.x, this.y,
        this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].width * this.scaleWidthHeight,
        this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].height * this.scaleWidthHeight);
    } else if (this._getMoveDirection() == 'left' || (this._getMoveDirection() == null && this.lastMoveDirection == 'left')) {
      this.context.drawImage(this.spriteSheet.run.imageLeft,

        this.spriteSheet.run.spritesImgWidth - this._getWidth('run', this.indexOfSpriteRun), this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].y,
        this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].width, this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].height,
        this.x, this.y,
        this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].width * this.scaleWidthHeight,
        this.spriteSheet.run.spritesRight[this.indexOfSpriteRun].height * this.scaleWidthHeight);
    }
  } else if (this.status == 'stand') {
    if (this.lastMoveDirection == 'right') {
      this.context.drawImage(this.spriteSheet.stand.imageRight,
        this.spriteSheet.stand.spritesRight[0].x, this.spriteSheet.stand.spritesRight[0].y,
        this.spriteSheet.stand.spritesRight[0].width, this.spriteSheet.stand.spritesRight[0].height,
        this.x, this.y,
        this.spriteSheet.stand.spritesRight[0].width * this.scaleWidthHeight,
        this.spriteSheet.stand.spritesRight[0].height * this.scaleWidthHeight);
    } else if (this.lastMoveDirection == 'left') {
      this.context.drawImage(this.spriteSheet.stand.imageLeft,
        this.spriteSheet.stand.spritesImgWidth - this._getWidth('stand', 0), this.spriteSheet.stand.spritesRight[0].y,
        this.spriteSheet.stand.spritesRight[0].width, this.spriteSheet.stand.spritesRight[0].height,
        this.x, this.y,
        this.spriteSheet.stand.spritesRight[0].width * this.scaleWidthHeight,
        this.spriteSheet.stand.spritesRight[0].height * this.scaleWidthHeight);
    }
  }
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// HELPERS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hero.prototype._getWidth = function(status, index) {
  var i = index;
  var width = 0;
  while (i > -1) {
    width += this.spriteSheet[status].spritesRight[i].width;
    i--;
  }
  return width + 1;
}
