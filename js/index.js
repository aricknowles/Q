// based off of https://codepen.io/jscottsmith/pen/XgGZaL

'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }


var RADIANS = Math.PI / 180;
var STRENGTH = 2;
var ELASTICITY = 0.0005;
var DAMPING = 0.996;
var MASS = 0.1;
var MAX_SIZE = 1200;
var SIZE = 10;
var CIRCLE = 'circle';
var SQUARE = 'square';
var TYPE = SQUARE;
var DPR = 1;
var DEMO_IMAGE = 'https://i.imgur.com/xMgUzij.jpg';

var Canvas = function () {
    function Canvas() {
        _classCallCheck(this, Canvas);

        this.canvas = document.getElementById('canvas');
        this.dpr = DPR;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(this.dpr, this.dpr);

        this.render = this.render.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDragLeave = this.handleDragLeave.bind(this);
        this.handleMouse = this.handleMouse.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleMousedown = this.handleMousedown.bind(this);
        this.handleMouseup = this.handleMouseup.bind(this);

        this.isDragging = false;
        this.hasLoaded = false;
        this.tick = 0;
        this.mouse = {
            x: window.innerWidth * this.dpr / 2,
            y: window.innerHeight * this.dpr / 2,
            mousedown: false
        };

        this.setupListeners();
        this.addInitialImage();
        this.setCanvasSize();
        this.render();
    }

    Canvas.prototype.setupListeners = function setupListeners() {
        window.addEventListener('resize', this.handleResize);
        this.canvas.addEventListener('drop', this.handleDrop, false);
        this.canvas.addEventListener('dragover', this.handleDragOver, false);
        this.canvas.addEventListener('dragleave', this.handleDragLeave, false);
        window.addEventListener('mousemove', this.handleMouse);
        window.addEventListener('mousedown', this.handleMousedown);
        window.addEventListener('mouseup', this.handleMouseup);
    };

    Canvas.prototype.handleResize = function handleResize() {
        this.setCanvasSize();
    };

    Canvas.prototype.handleMousedown = function handleMousedown(event) {
        this.mouse.mousedown = true;
    };

    Canvas.prototype.handleMouseup = function handleMouseup(event) {
        this.mouse.mousedown = false;
    };

    Canvas.prototype.handleDrop = function handleDrop(event) {
        event.preventDefault();

        var image = event.dataTransfer.getData('text/plain');
        this.isDragging = false;
        this.hasLoaded = false;

        var file = event.dataTransfer.files[0];

        this.handleImageFile(file);
    };

    Canvas.prototype.handleImageFile = function handleImageFile(file) {
        var _this = this;

        var imageType = /image.*/;
        if (!file.type.match(imageType)) return;

        this.image = new FluidImage({
            file: file
        }, SIZE);

        this.image.hasLoaded().then(function () {
            console.log('successfully loaded!');
            _this.handleLoad();
        }).catch(function (e) {
            console.log('>:-| failed:', e);
        });
    };

    Canvas.prototype.handleLoad = function handleLoad() {
        this.hasLoaded = true;
        this.centerImageToWindow();

        if (!this.demo) {
            this.demoForce();
        }
    };

    Canvas.prototype.handleDragOver = function handleDragOver(event) {
        event.preventDefault();
        this.isDragging = true;
    };

    Canvas.prototype.handleDragLeave = function handleDragLeave(event) {
        event.preventDefault();
        this.isDragging = false;
    };

    Canvas.prototype.handleMouse = function handleMouse(event) {
        var x = event.clientX * this.dpr;
        var y = event.clientY * this.dpr;
        this.mouse.x = x;
        this.mouse.y = y;

        this.applyForce();
    };

    Canvas.prototype.addInitialImage = function addInitialImage() {
        var _this2 = this;

        this.image = new FluidImage({
            src: DEMO_IMAGE
        }, SIZE);

        this.image.hasLoaded().then(function () {
            _this2.handleLoad();
        }).catch(function (e) {
            console.log('>:-| failed:', e);
        });
    };

    Canvas.prototype.centerImageToWindow = function centerImageToWindow() {
        var _image$canvas = this.image.canvas;
        var w = _image$canvas.width;
        var h = _image$canvas.height;
        var _canvas = this.canvas;
        var cw = _canvas.width;
        var ch = _canvas.height;

        var tx = cw / 2 - w / 2;
        var ty = ch / 2 - h / 2;

        this.image.points.map(function (p) {
            var x = p.x + tx;
            var y = p.y + ty;
            p.setOrigin(x, y);
            return p;
        });
    };

    Canvas.prototype.applyForce = function applyForce() {
        if (!this.hasLoaded) return; 
        var _mouse = this.mouse;
        var mousedown = _mouse.mousedown;
        var x = _mouse.x;
        var y = _mouse.y;

        var points = this.image.points;
        var length = points.length;

        for (var i = 0; i < length; i++) {
            var fd = points[i];
            var dx = fd.cx - x;
            var dy = fd.cy - y;
            var angle = Math.atan2(dy, dx);
            var dist = STRENGTH / Math.sqrt(dx * dx + dy * dy);

            if (mousedown) {
                dist *= -1;
            }

            var fx = Math.cos(angle) * dist;
            var fy = Math.sin(angle) * dist;
            fd.applyForce(fx, fy);
        }
    };

    Canvas.prototype.setCanvasSize = function setCanvasSize() {
        this.canvas.width = window.innerWidth * this.dpr;
        this.canvas.height = window.innerHeight * this.dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    };

    Canvas.prototype.drawBg = function drawBg(color) {
        this.ctx.fillStyle = color || '#8e8989';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    
/*
enter bttn
*/
    Canvas.prototype.drawText = function drawText() {
        var size = 60 * this.dpr;
        this.ctx.font = size + 'px  futura-pt, futura, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'black';

        var copy = this.isDragging ? '' : '';
        this.ctx.fillText(copy, this.canvas.width / 2, this.canvas.height / 2.5 + size / 2.5);
        
  };

/*
mouse pointer
*/
    Canvas.prototype.drawMouse = function drawMouse() {
        var _mouse2 = this.mouse;
        var mousedown = _mouse2.mousedown;
        var x = _mouse2.x;
        var y = _mouse2.y;

        this.ctx.lineWidth = 2 * this.dpr;
        this.ctx.strokeStyle = mousedown ? '#FFFFFF' : '#333333';
        this.ctx.beginPath();
        this.ctx.arc(x, y, 16 * this.dpr, 0, Math.PI * 2, true);
        this.ctx.closePath();
        this.ctx.stroke();
    };

    Canvas.prototype.render = function render() {
        var _this3 = this;

        if (this.hasLoaded) {
            var bg = this.image.points[0].color;

            this.drawBg(bg);
            this.image.points.forEach(function (p) {
                p.draw(_this3.ctx);
                p.update();
            });
            this.ctx.restore();
        } else {
            this.drawBg();
        }

        this.drawMouse();

        if (this.tick < 300) {
            this.applyForce();
        }

        this.drawText();
        this.tick++;
        window.requestAnimationFrame(this.render);
    };

    return Canvas;
}();


var FluidImage = function () {
    function FluidImage() {
        var image = arguments.length <= 0 || arguments[0] === undefined ? {
            src: false,
            file: false
        } : arguments[0];
        var size = arguments.length <= 1 || arguments[1] === undefined ? SIZE : arguments[1];

        _classCallCheck(this, FluidImage);

        this.src = image.src;
        this.file = image.file;
        this.size = size;

        this.pw = 0; 
        this.ph = 0; 
        this.points = [];

        this.onLoad = this.onLoad.bind(this);

        this.canvas = document.createElement('canvas');
        this.img = document.createElement('img');
        this.img.crossOrigin = 'Anonymous';
        this.img.onload = this.onLoad;

        this.ctx = this.canvas.getContext('2d');

        if (this.src) {
            this.img.src = this.src;
        } else if (this.file) {
            this.readFile();
        }
    }

    FluidImage.prototype.readFile = function readFile() {
        var _this4 = this;

        var reader = new FileReader();

        var loadHandler = function loadHandler(aImg) {
            return function (e) {
                aImg.src = e.target.result;

                _this4.drawToCanvas();
            };
        };
        reader.onload = loadHandler(this.img);

        reader.readAsDataURL(this.file)=false;
    };

    FluidImage.prototype.hasLoaded = function hasLoaded() {
        var _this5 = this;

        return new Promise(function (resolve, reject) {
            _this5.resolveLoaded = resolve;
        });
    };

    FluidImage.prototype.onLoad = function onLoad(event) {
        if (this.resolveLoaded) {
            this.resolveLoaded();
        }
        this.setupCanvas();
        this.drawToCanvas();
        this.getPixels();
    };

    FluidImage.prototype.getPixels = function getPixels() {
        var img = this.canvas;
        var size = this.size;
        var pixelData = this.ctx.getImageData(0, 0, img.width, img.height);
        var colors = pixelData.data;

        for (var i = size; i <= img.height; i += size) {
            for (var j = size; j <= img.width; j += size) {
                var pixelPosition = (j + i * pixelData.width) * 4;
                var x = j;
                var y = i;
                var w = size;
                var h = size;
                var r = colors[pixelPosition];
                var g = colors[pixelPosition + 1];
                var b = colors[pixelPosition + 2];
                var rgba = 'rgba(' + r + ', ' + g + ', ' + b + ', 1)';

                var fluidPx = new FluidPixel(x, y, w, h, rgba);

                this.points.push(fluidPx);
            }
        }
    };

    FluidImage.prototype.setupCanvas = function setupCanvas() {
        var _img = this.img;
        var w = _img.width;
        var h = _img.height;

        var maxSide = Math.max(w, h);

        this.width = w;
        this.height = h;
        var max = MAX_SIZE * this.size;

        if (maxSide >= max) {
            var r = h / w;

            if (w >= max) {
                this.width = max;
                this.height = max * r;
            } else {
                this.height = max;
                this.width = max * r;
            }
        }

        this.canvas.width = this.width;
        this.canvas.height = this.height;
    };

    FluidImage.prototype.drawToCanvas = function drawToCanvas() {
        var width = this.width;
        var height = this.height;

        this.ctx.drawImage(this.img, 0, 0, width, height);
    };

    return FluidImage;
}();


var FluidPixel = function () {
    function FluidPixel() {
        var x = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];
        var y = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
        var w = arguments.length <= 2 || arguments[2] === undefined ? 50 : arguments[2];
        var h = arguments.length <= 3 || arguments[3] === undefined ? 50 : arguments[3];
        var color = arguments.length <= 4 || arguments[4] === undefined ? 'red' : arguments[4];

        _classCallCheck(this, FluidPixel);

        this.ox = x;
        this.oy = y;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.hw = w / 2;
        this.hh = h / 2;
        this.cx = x + this.hw;
        this.cy = y + this.hh; 
        this.vx = 0;
        this.vy = 0;
        this.fx = 0;
        this.fy = 0;
        this.color = color;
        this.mass = MASS;
        this.elasticity = ELASTICITY;
        this.damping = DAMPING;
    }

    FluidPixel.prototype.setOrigin = function setOrigin(x, y) {
        this.ox = x;
        this.oy = y;
        this.x = x;
        this.y = y;
        this.cx = x + this.hw;
        this.cy = y + this.hh;
    };

    FluidPixel.prototype.update = function update() {
        var ofx = (this.ox - this.x) * this.elasticity;
        var ofy = (this.oy - this.y) * this.elasticity;

        var fx = this.fx + ofx;
        var fy = this.fy + ofy;

        var ax = fx / this.mass;
        var ay = fy / this.mass;

        this.vx = this.damping * this.vx + ax;
        this.vy = this.damping * this.vy + ay;

        this.x += this.vx;
        this.y += this.vy;
        this.cx += this.vx;
        this.cy += this.vy;

        this.fx = 0;
        this.fy = 0;
    };

    FluidPixel.prototype.applyForce = function applyForce(fx, fy) {
        this.fx = fx;
        this.fy = fy;
    };

    FluidPixel.prototype.draw = function draw(ctx) {
        var x = this.x;
        var y = this.y;
        var w = this.w;
        var h = this.h;
        var color = this.color;

        ctx.fillStyle = color;

        if (TYPE === CIRCLE) {
            var _x = x - w / 2;
            var _y = y - h / 2;
            ctx.beginPath();
            ctx.arc(_x, _y, w / 2, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fill();
        } else if (TYPE === SQUARE) {
            ctx.fillRect(x, y, w, h);
        }

    };

    return FluidPixel;
}();



var canvas = new Canvas();



