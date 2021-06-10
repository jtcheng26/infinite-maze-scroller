function elementInViewport(el) {
  const rect = el.getBoundingClientRect()

  return (
     rect.top    >= -100
  && rect.left   >= 0
  && rect.top <= (window.innerHeight || document.documentElement.clientHeight) + 100
  )
}

const columns = 10

const colors = [
  {
    dark: "#0ba3a8",
    light: "#27ebf1",
    bg: "#054648",
    shade: "#021718",
  },
  {
    dark: "#9C1FFF",
    light: "#c780ff",
    bg: "#470080",
    shade: "#2b004d",
  },
  {
    dark: "#4940d9",
    light: "#716ae1",
    bg: "#1a156a",
    shade: "#100d40",
  },
  {
    dark: "#f721bd",
    light: "#fb84da",
    bg: "#7b045b",
    shade: "#4a0337",
  },
  {
    dark: "#2158c4",
    light: "#6691e5",
    bg: "#12316d",
    shade: "#0b1d41",
  },
  {
    dark: "#1e8fc7",
    light: "#90cfee",
    bg: "#11506f",
    shade: "#0a3042"
  },
  {
    dark: "#7386a6",
    light: "#b1bccd",
    bg: "#323c4e",
    shade: "#1e242f",
  },
  {
    dark: "#fbe91d",
    light: "#fffde6",
    bg: "#afa103",
    shade: "#7d7302",
  },
  {
    dark: "#55ac07",
    light: "#a2f853",
    bg: "#254a03",
    shade: "#0c1901",
  },
  {
    dark: "#bb935e",
    light: "#d9c3a6",
    bg: "#594426",
    shade: "#362917",
  },
  {
    dark: "#ce5317",
    light: "#ed8d5e",
    bg: "#732e0d",
    shade: "#451c08",
  },
  {
    dark: "#df0f06",
    light: "#fa5852",
    bg: "#7c0804",
    shade: "#4a0502",
  },
  {
    dark: "#bfbfbf",
    light: "#FFFFFF",
    bg: "#8c8c8c",
    shade: "#595959"
  },
]
/*
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
*/
function onWindowResize() {
  document.body.style.setProperty("--node-size", (window.innerWidth / (2 * columns + 1)) + "px")
  document.body.style.setProperty("--node-shadow-size", (window.innerWidth / (2 * columns + 1) / 10) + "px")
  document.body.style.setProperty("--node-border-size", Math.round(window.innerWidth / (2 * columns + 1) / 6) + "px")
  while (wrapper.clientHeight < window.innerHeight + 1000)
      Module.__Z6newRowv()
}

Module['onRuntimeInitialized'] = function() {
  console.log("wasm loaded ");
  const color = colors[Math.floor(Math.random() * colors.length)]
  /*const randC = "#" + Math.floor(Math.random()*16777215).toString(16);
  const randCDark = shadeColor(randC, -50)
  const randCLight = shadeColor(randC, 50)
  const randCDarker = shadeColor(randCDark, -50)*/
  document.body.style.setProperty("--node-color-light", color.light)
  document.body.style.setProperty("--node-color-dark", color.dark)
  document.body.style.setProperty("--background-color", color.bg)
  document.body.style.setProperty("--shadow-color", color.shade)
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
