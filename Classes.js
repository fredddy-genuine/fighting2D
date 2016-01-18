function Point(x, y) {
  this.x = x;
  this.y = y;
}

function Rectangle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

function getImageObj(src) {
  var image = new Image();

  return new Promise(function(luck, err) {
    image.src = src;

    image.onload = function() {
      luck(img);
    }
  });
}

function Sprite(rectangleImage) {
  this.rectangleImage = rectangleImage;
}

function SpriteSheet( /**run, stand, jump, fight*/options) {
  this.run = options.run; //obj -> img, [sprites]
  this.stand = options.stand; //obj -> img, [sprites]
  this.jump = options.jump; //obj -> img, [sprites]
  this.fight = options.fight; //obj -> img, [sprites]
  this.parameters = options.parameters;
}

/*function flipHorizontal(image, sheet) {
  var canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  var context = canvas.getContext("2d");
  context.drawImage(image, 0, 0);
  var imageData = canvas.getImageData(0, 0, image.width, image.height);

  var flippedSheet = [];

  for (var i = 0; i < sheet.length; i++) {
    var
  }
}*/

function rand(min, max) {
  return Math.round(Math.random() * (max - min + 1) + min - 0.5);
}
