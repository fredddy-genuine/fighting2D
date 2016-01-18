function Platform(x, y, width, height, texture/*=={color:..., image:...}*/, context) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;

  this.texture = texture.image ? texture.image : texture.color;
  this.context = context;
}

Platform.prototype.draw = function() {
  this.context.save();
  this.context.fillStyle = this.texture;
  this.context.fillRect(this.x, this.y, this.width, this.height);
  this.context.restore();
}


Platform.prototype.update = function() {
  this.draw();
}
