var piont = {};

piont.canvas = { originX: 0 , originY: 0, width: 256, height: 256, background: "#ffffff"};

piont.dispatchMove = function () {
  // ...
  console.log("mouse.x = " + piont.mouse.local[0].x);
  console.log("mouse.y = " + piont.mouse.local[0].y);  
}

piont.dispatchClick = function () {
  piont.mouse.isClick = false;
  console.log('click');
  // ...
  console.log("mouse.x = " + piont.mouse.local[0].x);
  console.log("mouse.y = " + piont.mouse.local[0].y);
}

piont.dispatchDoubleClick = function () {
  piont.mouse.isClick = false;
  console.log('double click');
  // ...
  console.log("mouse.x = " + piont.mouse.local[0].x);
  console.log("mouse.y = " + piont.mouse.local[0].y);
}

piont.initMouse = function () {
  
  var mouse = { global:[], local:[], isDown: false, isMoved: false, isClick: false, clickInt: 0 };
  
  mouse.getTouchPointsFromEvent = function (e) {
    var x, y;
    if (e.type === 'touchmove' || e.type === 'touchstart') {
      mouse.global = [];
      mouse.local = [];
      for (var p = 0; (p < e.touches.length && p < 3); p++) {
        if (e.touches[p].pageX || e.touches[p].pageY) {
          x = e.touches[p].pageX;
          y = e.touches[p].pageY;
        } else {
          x = e.touches[p].clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          y = e.touches[p].clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        x -= piont.UIcanvas.offsetLeft;
        y -= piont.UIcanvas.offsetTop;
        mouse.global[p] = {x: x, y: y};
        mouse.local[p] = {x: x - piont.canvas.originX, y: y - piont.canvas.originY};
      }
    } else { // mouse-events
      if (e.pageX || e.pageY) {
        x = e.pageX;
        y = e.pageY;
      } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }
      x -= piont.UIcanvas.offsetLeft;
      y -= piont.UIcanvas.offsetTop;
      mouse.global = [{x: x, y: y}];
      mouse.local = [{x: x - piont.canvas.originX, y: y - piont.canvas.originY}];
      //console.log("mouse.x = " + mouse.local[0].x);
      //console.log("mouse.y = " + mouse.local[0].y);
    }    
  };
  
  piont.mousedown = function (e) {
    e.preventDefault();
    mouse.isDown = true;
    mouse.getTouchPointsFromEvent(e);
  };
  piont.UIcanvas.addEventListener('mousedown', piont.mousedown, false);
  piont.UIcanvas.addEventListener('touchstart', piont.mousedown, false);
  
  piont.mousemove = function (e) {
    e.preventDefault();
    if (mouse.isDown) {
      mouse.isMoved = true;
      mouse.getTouchPointsFromEvent(e);
      piont.dispatchMove();
    }
  };
  piont.UIcanvas.addEventListener('mousemove', piont.mousemove, false);
  piont.UIcanvas.addEventListener('touchmove', piont.mousemove, false);
  
  piont.mouseup = function (e) {
    e.preventDefault();
    mouse.isDown = false;
    if (mouse.isMoved) {
      mouse.isClick = false;
      mouse.isMoved = false;
    } else if (mouse.isClick) {
      clearTimeout(mouse.clickInt);
      piont.dispatchDoubleClick();
    } else {
      mouse.isClick = true;
      mouse.clickInt = setTimeout(piont.dispatchClick, 240);
    }
  };
  piont.UIcanvas.addEventListener('mouseup', piont.mouseup, false);
  piont.UIcanvas.addEventListener('touchend', piont.mouseup, false);
  
  piont.mouse = mouse;
}

piont.redrawUI = function () {
  // clear
  piont.UIcontext.clearRect(0, 0, piont.UIcanvas.width, piont.UIcanvas.height);
  
  // apply zooming and positioning of canvas
  piont.UIcontext.save();
  piont.UIcontext.translate(piont.canvas.originX, piont.canvas.originY);
  
  // draw canvas background
  piont.UIcontext.fillStyle = piont.canvas.background;
  piont.UIcontext.fillRect(0, 0, piont.canvas.width, piont.canvas.height);
  
  // draw drawing
  // ...
  
  // restore from zooming and positioning of canvas
  piont.UIcontext.restore();
  // draw toolbar
  // ...
}

piont.resizeUI = function (e) {
  //console.log(piont.toolbarContainer.offsetWidth);
  // scale canvas up to browser window
  piont.UIcanvas.width = window.innerWidth;
  piont.UIcanvas.height = window.innerHeight - piont.toolbarContainer.offsetHeight;
  // set origin of drawing
  piont.canvas.originX = (piont.UIcanvas.width - piont.canvas.width) / 2;
  piont.canvas.originY = (piont.UIcanvas.height - piont.canvas.width) / 2; 
  // redraw the ui
  piont.redrawUI();   
}


piont.setup = function () {
  // double check if the window is ready
  if (!window.innerWidth) {
    setTimeout(piont.setup, 500);
    return;
  }
  // toolbar container
  piont.toolbarContainer = document.getElementById('toolbar-container');
  // UIcanvas and UIcontext
  piont.UIcanvas = document.getElementById('UIcanvas')
  piont.UIcontext = piont.UIcanvas.getContext('2d');
  // resize and keep checking
  piont.resizeUI();
  window.addEventListener("resize", piont.resizeUI, false);
  // setup mouse interactions
  piont.initMouse();
}

// check if the document is ready and start app
if (document.readyState === 'complete') {
  piont.setup();
} else {
  window.onload = function () {
    piont.setup();
  }
}