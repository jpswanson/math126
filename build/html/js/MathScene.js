// Generated by CoffeeScript 1.6.3
var MathScene,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

MathScene = (function() {
  MathScene.prototype.HEIGHT = 400;

  MathScene.prototype.WIDTH = 700;

  MathScene.prototype.shadow = null;

  MathScene.prototype.guiActive = false;

  MathScene.prototype.live = false;

  MathScene.prototype.animated = false;

  MathScene.prototype.initTime = 3000;

  MathScene.prototype.showingObjects = false;

  MathScene.UWMaterial = new THREE.MeshPhongMaterial({
    ambient: 0x39275b,
    color: 0xc79900,
    specular: 0x111111,
    shininess: 20,
    side: THREE.DoubleSide
  });

  function MathScene(containerName) {
    this.animate = __bind(this.animate, this);
    this.render = __bind(this.render, this);
    this.kill = __bind(this.kill, this);
    this.birth = __bind(this.birth, this);
    this.create = __bind(this.create, this);
    this.replaceStaticImage = __bind(this.replaceStaticImage, this);
    this.setCameraControls = __bind(this.setCameraControls, this);
    var webGLEnabled;
    if (containerName != null) {
      this.container = document.getElementById(containerName);
    } else {
      this.container = document.body.appendChild(document.createElement("div"));
    }
    this.container.style.position = "relative";
    webGLEnabled = this.populate();
    if (!webGLEnabled) {
      return;
    }
    this.mathUp();
    this.shadow = false;
    this.guiActive = false;
    return;
  }

  MathScene.prototype.setrenderer = function() {
    if (Detector.webgl) {
      this.renderer = new THREE.WebGLRenderer({
        preserveDrawingBuffer: true,
        antialias: true
      });
      this.renderer.setClearColor(0x111111, 1);
    } else {
      this.renderer = new THREE.CanvasRenderer();
    }
  };

  MathScene.prototype.setCameraControls = function() {
    this.cameraControls = new THREE.TrackballControls(this.camera, this.renderer.domElement);
    this.cameraControls.target.set(0, 0, 0);
    this.cameraControls.addEventListener('end', this.kill);
    this.cameraControls.addEventListener('start', this.birth);
    return null;
  };

  MathScene.prototype.enableShadow = function() {
    this.renderer.shadowMapEnabled = true;
    this.renderer.shadowMapSoft = true;
    this.renderer.shadowMapBias = 0.0039;
    this.renderer.shadowMapDarkness = 1.0;
    this.renderer.shadowMapWidth = 1024;
    this.renderer.shadowMapHeight = 1024;
    return null;
  };

  MathScene.prototype.replaceStaticImage = function() {
    var elt, elts, _i, _len;
    elts = this.container.getElementsByTagName("img");
    for (_i = 0, _len = elts.length; _i < _len; _i++) {
      elt = elts[_i];
      elt.style.display = "none";
    }
    this.renderer.domElement.style.display = "block";
    this.cameraControls.handleResize();
    this.showGui();
    return null;
  };

  MathScene.prototype.populate = function() {
    if (!Detector.webgl) {
      return false;
    }
    this.scene = new THREE.Scene();
    this.scene.add(new THREE.AmbientLight(0xffffff));
    this.scene.add(new THREE.DirectionalLight(0xffffff));
    if (!this.camera) {
      this.camera = new THREE.PerspectiveCamera(45, this.WIDTH / this.HEIGHT);
      this.camera.position.set(3, 3, 3);
    }
    if (this.shadow) {
      this.enableShadow();
      this.pointLight = new THREE.SpotLight(0xffffff);
      this.pointLight.castShadow = true;
    } else {
      this.pointLight = new THREE.PointLight(0xffffff);
    }
    this.pointLight.intensity = 1;
    this.pointLight.position.set(0, 0, 100);
    this.scene.add(this.pointLight);
    this.scene.add(this.camera);
    this.setrenderer();
    this.renderer.setSize(this.WIDTH, this.HEIGHT);
    this.renderer.domElement.style.position = "relative";
    this.renderer.domElement.style.display = "none";
    this.container.appendChild(this.renderer.domElement);
    this.renderer.clear();
    this.gui = new dat.GUI({
      autoPlace: false
    });
    this.gui.domElement.style.position = "absolute";
    this.gui.domElement.style.left = 0;
    this.gui.domElement.style.top = 0;
    this.gui.close();
    this.gui.add(this, "generateSnapshot").name("Take picture");
    this.activateGui();
    this.hideGui();
    this.setCameraControls();
    return true;
  };

  MathScene.prototype.create = function() {
    this.birth();
    setTimeout(this.kill, this.initTime);
    return this.showingObjects = true;
  };

  MathScene.prototype.birth = function() {
    this.live = true;
    this.animate();
  };

  MathScene.prototype.kill = function() {
    this.replaceStaticImage();
    this.live = false;
  };

  MathScene.prototype.generateSnapshot = function() {
    var imgData, imgNode;
    this.hideGui();
    imgData = this.renderer.domElement.toDataURL();
    imgNode = document.createElement("img");
    imgNode.src = imgData;
    this.container.appendChild(imgNode);
    this.showGui();
  };

  MathScene.prototype.loadSnapshot = function() {
    throw "Not yet implemented";
  };

  MathScene.prototype.activateGui = function() {
    if (!this.guiActive) {
      this.container.appendChild(this.gui.domElement);
      this.guiActive = true;
    }
    return null;
  };

  MathScene.prototype.hideGui = function() {
    this.gui.domElement.style.display = "none";
  };

  MathScene.prototype.showGui = function() {
    this.gui.domElement.style.display = "";
  };

  MathScene.prototype.mathUp = function() {
    return this.camera.up = new THREE.Vector3(0, 0, 1);
  };

  MathScene.prototype.addaxes = function(length) {
    this.scene.add(new THREE.AxisHelper(length));
    return null;
  };

  MathScene.prototype.render = function() {
    var _ref;
    if ((_ref = this.cameraControls) != null) {
      _ref.update();
    }
    this.pointLight.position = this.camera.position;
    this.renderer.render(this.scene, this.camera);
    return null;
  };

  MathScene.prototype.calc = function(t) {};

  MathScene.prototype.animate = function() {
    var framing, self;
    self = this;
    framing = function(t) {
      self.calc(t);
      self.render();
      if (self.animated || self.live) {
        requestAnimationFrame(framing, self.container);
      }
      return null;
    };
    framing(new Date().getTime());
    return null;
  };

  MathScene.prototype.add = function(obj) {
    this.create();
    this.scene.add(obj);
    return null;
  };

  return MathScene;

})();

window.MathScene = MathScene;
