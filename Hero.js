function Hero(spriteSheet, startPoint, context, fps, platforms) {
  this.context = context;

  this.spriteSheet = spriteSheet;
  this.spriteSheet.run.spritesImgWidth = this.spriteSheet.run.imageRight.width;
  this.spriteSheet.stand.spritesImgWidth = this.spriteSheet.stand.imageRight.width;
  this.spriteSheet.jump.spritesImgWidth = this.spriteSheet.jump.imageRight.width;

  this.indexOfSpriteRun = 0;
  this.countOfSprites = spriteSheet.run.spritesRight.length;

  this.indexOfSpriteJump = 1;
  this.fallingDirectionVertical = 'down';

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
    decelerationCoefficient: 0.95,
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
  this.deferedStatus = 'stand';
  this.currentSpriteRectangle = this.spriteSheet.stand.spritesRight[0];

  this.platforms = platforms;

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //~~~~~~~~~~~HELPER~~~~~~~~~~~~~~~~~~~~~~~
  this.fillStyleHeroRectangle = 'rgba(100, 100, 220, 0.5)';
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
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
    if (this.y + this.height >= this.platforms[i].y + 5 && this.y + this.height < this.platforms[i].y + this.gravity * 2 &&
      this.x + this.currentSpriteRectangle.width > this.platforms[i].x && this.x < this.platforms[i].x + this.platforms[i].width &&
      this.fallingDirectionVertical == 'down') {

      this.y = this.platforms[i].y - this.height + 5;
      this.canFalling = false;
      if (this.jumpDetails.started) this._restartJumping();
      else if (this.jumpDetails.deferStoppingJumping) this._stopDeferedJumping();
      break;
    }
  }
  if (this.canFalling) this.makeFalling();
}

Hero.prototype._updateFallingDirectionVertical = function() {
  if (this.jumpDetails.jerked && this.jumpDetails.speedAfterJerk < this.gravity) {
    this.fallingDirectionVertical = 'down';
    this.indexOfSpriteJump = 1;
  } else if (!this.jumpDetails.jerked) {
    this.fallingDirectionVertical = 'down';
    this.indexOfSpriteJump = 1;
  } else {
    this.fallingDirectionVertical = 'up';
    this.indexOfSpriteJump = 3;
  }
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
  if (this.jumpDetails.started || this.canFalling) {
    if (this.jumpDetails.deferStoppingJumping || !this.jumpDetails.started && this.canFalling) {
      this.jumpDetails.started = true;
      this.jumpDetails.deferStoppingJumping = false;
    }

    return;
  }
  this.jumpDetails.started = true;
  this.jumpDetails.jerked = true;
  this.y -= this.jumpDetails.jerkHeight;
  this.fillStyleHeroRectangle = 'rgba(' + this._rand(0, 250) + ', ' + this._rand(0, 250) + ', ' + this._rand(0, 250) + ', 0.5)';

  this.deferedStatus = this.status;
  this._changeStatus('jump');
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
  this.fillStyleHeroRectangle = 'rgba(' + this._rand(0, 250) + ', ' + this._rand(0, 250) + ', ' + this._rand(0, 250) + ', 0.5)';
  this._changeStatus('jump');
}

Hero.prototype.stopJumping = function() {
  this.jumpDetails.started = false;
  this.jumpDetails.deferStoppingJumping = true;
}

Hero.prototype._stopDeferedJumping = function() {
  this.jumpDetails = Object.create(this.jumpDetailsDefault);
  this._changeStatus(this.deferedStatus);
}

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// STATUS
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Hero.prototype._changeStatus = function(newStatus) {
  if (newStatus != 'jump' && this.jumpDetails.jerked) {
    this.deferedStatus = newStatus;
    return;
  }
  //alert(newStatus + ' ; ' + this.jumpDetails.jerked);
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

  this._updateFallingDirectionVertical();

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
    this.currentSpriteRectangle = Object.create(this.spriteSheet.jump.spritesRight[1]);
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
  this.context.fillStyle = this.fillStyleHeroRectangle; //'rgba(100, 100, 220, 0.5)';
  this.context.fillRect(this.currentSpriteRectangle.x, this.currentSpriteRectangle.y,
    this.currentSpriteRectangle.width * this.scaleWidthHeight,
    this.currentSpriteRectangle.height * this.scaleWidthHeight);
  //******************************
  //******************************
  this.context.save();
  this.context.fillStyle = "blue";
  this.context.font = "16px Arial";
  this.context.fillText('lastMoveDirection: ' + this.lastMoveDirection, 700, 100);
  this.context.fillText('this._getMoveDirection(): ' + this._getMoveDirection(), 700, 130);
  this.context.fillText('this.status: ' + this.status, 700, 160);
  this.context.fillText('this.x: ' + this.x, 900, 140);
  this.context.fillText('this.y: ' + this.y, 900, 160);
  this.context.fillText('this.fallingDirectionVertical: ' + this.fallingDirectionVertical, 900, 200);
  this.context.fillText('this.jumpDetails.started: ' + this.jumpDetails.started, 400, 100);
  this.context.fillText('this.canFalling: ' + this.canFalling, 400, 150);
  this.context.fillText('this.jumpDetails.jerked: ' + this.jumpDetails.jerked, 400, 200);
  this.context.restore();

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
      this.context.drawImage(this.spriteSheet.jump.imageRight,
        this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].x, this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].y,
        this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].width, this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].height,
        this.x, this.y,
        this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].width * this.scaleWidthHeight,
        this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].height * this.scaleWidthHeight);
    } else if (this.lastMoveDirection == 'left') {
      this.context.drawImage(this.spriteSheet.jump.imageLeft,
        this.spriteSheet.jump.spritesImgWidth - this._getWidth('jump', this.indexOfSpriteJump), this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].y,
        this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].width, this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].height,
        this.x, this.y,
        this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].width * this.scaleWidthHeight,
        this.spriteSheet.jump.spritesRight[this.indexOfSpriteJump].height * this.scaleWidthHeight);
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

Hero.prototype._rand = function(min, max) {
  return Math.round(Math.random() * (max - min + 1) + min - 0.5);
}
