function elementInViewport(el) {
  const rect = el.getBoundingClientRect()

  return (
     rect.top    >= -100
  && rect.left   >= 0
  && rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 100
  )
}

const columns = 10

function shadeColor(color, percent) {

  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;  
  G = (G<255)?G:255;  
  B = (B<255)?B:255;  

  var RR = ((R.toString(16).length==1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length==1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length==1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

function randomColor() {
  /* Random colors within a range */
  var C = [];
  const minVibrancy = 200; // minimum guaranteed value for at least one slider
  const minValue = 45;
  const maxValue = 180;

  for (var i=0;i<3;i++) {
    C[i] = minValue + parseInt(Math.random() * (maxValue - minValue));
  }

  /* We want vibrant colors (make sure at least one slider is high enough) */
  if (C[0] < minVibrancy && C[1] < minVibrancy && C[2] < minVibrancy) {
    C[parseInt(Math.random() * 3)] = minVibrancy;
  }

  /* Convert back to hex */
  for (var i=0;i<3;i++) {
    C[i] = ((C[i].toString(16).length==1)?"0"+C[i].toString(16):C[i].toString(16));
  }

  return "#" + C[0] + C[1] + C[2];
}

const rc = randomColor();
const color = {
  dark: rc,
  light: shadeColor(rc, 50),
  bg: shadeColor(rc, -60),
  shade: shadeColor(rc, -85),
}
console.log(color)
document.body.style.setProperty("--node-color-light", color.light)
document.body.style.setProperty("--node-color-dark", color.dark)
document.body.style.setProperty("--background-color", color.bg)
document.body.style.setProperty("--shadow-color", color.shade)

function onWindowResize() {
  document.body.style.setProperty("--node-size", (window.innerWidth / (2 * columns + 1)) + "px")
  document.body.style.setProperty("--node-shadow-size", (window.innerWidth / (2 * columns + 1) / 10) + "px")
  document.body.style.setProperty("--node-border-size", Math.round(window.innerWidth / (2 * columns + 1) / 6) + "px")
  while (wrapper.clientHeight < window.innerHeight + 1000)
      Module.__Z6newRowv()
}

Module['onRuntimeInitialized'] = function() {
  window.addEventListener( 'resize', onWindowResize, false );
  Module.__Z4initi(columns)
  onWindowResize();
  const wrapper = document.getElementById("wrapper")
  while (wrapper.clientHeight < window.innerHeight + 2000)
      Module.__Z6newRowv()
  function onScroll(e) {
    window.scrollBy(0, e.deltaY)
    if (!elementInViewport(wrapper.children[0])) {
      Module.__Z6newRowv()
      wrapper.removeChild(wrapper.firstElementChild)
    }
  }
  var lastY = 0
  function onTouchMove(e) {
    var currentY = e.originalEvent ? e.originalEvent.touches[0].pageY : e.touches[0].pageY
    if (currentY < lastY - 30) {
      if (!elementInViewport(wrapper.children[0])) {
        Module.__Z6newRowv()
        wrapper.removeChild(wrapper.firstElementChild)
      }
    }
    lastY = currentY
  }
  window.addEventListener('wheel', onScroll, false)
  window.addEventListener('touchmove', onTouchMove)
  window.addEventListener('touchstart', function(e) {
    lastY = e.originalEvent ? e.originalEvent.touches[0].pageY : e.touches[0].pageY
  })
}
