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

  this.jumpDetailsDefault = {
    jerked: false,
    jerkHeight: 40,
    speedAfterJerk: 25,
    decelerationCoefficient: 0.92,
    deferStoppingJumping: false
  };

  this.jumpDetails = Object.create(this.jumpDetailsDefault);
  this.jumpDetails.started = false;

  this.velocity = 8;

  this.scaleWidthHeight = 1.5;

  this.height = this.spriteSheet.parameters.height * this.scaleWidthHeight;

  this.lastMoveDirection = 'right';

  this.counter = 0;

  this.gravity = 10; // px/frame
  this.canFalling = true;

  this.status = 'stand';
  this.currentSpriteRectangle = this.spriteSheet.stand.spritesRight[0];

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
    if (this.y + this.height - 5 >= this.platforms[i].y) {
      this.y = this.platforms[i].y - this.height + 5;
      this.canFalling = false;
      if (this.jumpDetails.started) this._restartJumping();
      else if(this.jumpDetails.deferStoppingJumping) this.stopDeferedJumping();
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
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// JUMPING
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
Hero.prototype.startJumping = function() {
  if (this.jumpDetails.started || this.canFalling) return; // if remove this.canFalling, hero could jumping like flappy bird
  this.jumpDetails.started = true;
  this.jumpDetails.jerked = true;
  this.y -= this.jumpDetails.jerkHeight;
}

Hero.prototype._jump = function() {
  if (this.jumpDetails.jerked) {
    this.y -= this.jumpDetails.speedAfterJerk;
    this.jumpDetails.speedAfterJerk *= this.jumpDetails.decelerationCoefficient;
  }
}

Hero.prototype._restartJumping = function() {
  this.jumpDetails = Object.create(this.jumpDetailsDefault);

  this.jumpDetails.started = true;
  this.jumpDetails.jerked = true;
  this.y -= this.jumpDetails.jerkHeight;
}

Hero.prototype.stopJumping = function() {
  this.jumpDetails.started = false;
  this.jumpDetails.deferStoppingJumping = true;
}

Hero.prototype.stopDeferedJumping = function() {
  this.jumpDetails = Object.create(this.jumpDetailsDefault);
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
  }

  this._jump();
  this.makeGravity();

  this._updateCurrentSpriteRectangleInfo();

  this._draw();
}

Hero.prototype._updateCurrentSpriteRectangleInfo = function() {
  if (this.status == 'stand') {
    this.currentSpriteRectangle = Object.create(this.spriteSheet.stand.spritesRight[0]);
    //if (this.lastMoveDirection == 'left')
    //this.currentSpriteRectangle.x = this.spriteSheet.stand.spritesImgWidth - this._getWidth('stand', 0);
  } else if (this.status == 'run') {
    this.currentSpriteRectangle = Object.create(this.spriteSheet.run.spritesRight[this.indexOfSpriteRun]);
    //if (this.lastMoveDirection == 'left')
    //this.currentSpriteRectangle.x = this.spriteSheet.run.spritesImgWidth - this._getWidth('run', this.indexOfSpriteRun);
  } else if (this.status == 'jump') {

  }

  this.currentSpriteRectangle.x = this.x;
  this.currentSpriteRectangle.y = this.y;
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
  var __index = 0;

  if (this.status == 'run') {
    __index = this.indexOfSpriteRun;
  } else if (this.status == 'stand') {
    __index = 0;
  }
  this.context.fillStyle = 'rgba(100, 100, 220, 0.5)';
  this.context.fillRect(this.currentSpriteRectangle.x, this.currentSpriteRectangle.y,
    this.currentSpriteRectangle.width * this.scaleWidthHeight,
    this.currentSpriteRectangle.height * this.scaleWidthHeight);
  //******************************
  //******************************
  this.context.beginPath();
  this.context.fillStyle = "blue";
  this.context.font = "16px Arial";
  this.context.fillText('lastMoveDirection: ' + this.lastMoveDirection, 700, 100);
  this.context.fillText('this._getMoveDirection(): ' + this._getMoveDirection(), 700, 130);
  this.context.fillText('this.status: ' + this.status, 700, 160);
  this.context.fillText('this.x: ' + this.x, 900, 140);
  this.context.fillText('this.y: ' + this.y, 900, 160);
  this.context.closePath();

  //******************************
  //******************************

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
  } else if (this.status == 'jump') {
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
