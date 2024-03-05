
const sound = new Howl({ src: ["./assets/video/sound.mp3"] });
const bgm = new Howl({
  src: ["./assets/video/bgm.mp3"],
  html5: true,
  loop: true,
  volume: 0.2,
});

function hideLoading() {
  const loadingElement = document.querySelector("#loading");
  if (loadingElement) {
    loadingElement.remove();
  }
}

window.onload = () => {
  hideLoading();
  let ringId = 0;
  let bgmId = 0;
  let count = 0;
  let countFlag = false;
  let autoClick = false;
  let autoClickInterval = null;
  let countElement = document.querySelector(".count");
  let woodenFishElement = document.querySelector(".woodenFish");
  let logoElement = document.querySelector("#Immersion");
  let autoClickElement = document.querySelector("#autoClick");
  let centerElement = document.querySelector("#center");

  const localStorageCount = localStorage.getItem("count");
  if (localStorageCount) {
    count = Number(localStorageCount);
    countElement.innerHTML = String(count);
  }

  function startAnimate() {
    countElement.style.transform = "scale(1.1)";
    woodenFishElement.style.transform = "scale(.95)";
    const div = document.createElement("div");
    div.classList.add("subtitleCountTip");
    div.innerText = "功德 + 1";
    centerElement.appendChild(div);
    // setTimeout(() => {
    //   div.remove();
    // }, 1000);
  }

  function initAnimate() {
    countElement.style.transform = "scale(1)";
    woodenFishElement.style.transform = "scale(1)";
  }

  function counter() {
    countFlag = true;
    count++;
    countElement.innerHTML = String(count);
    startAnimate();
    if (ringId !== 0) {
      if (sound.playing()) {
        sound.stop(ringId);
      }
      sound.play(ringId);
    } else {
      ringId = sound.play();
    }
    localStorage.setItem("count", String(count));
  }

  document.onkeyup = (e) => {
    if (e.key === " ") {
      if (!countFlag) {
        counter();
      }
    }
  };

  document.onkeydown = (e) => {
    if (e.key === " ") {
      countFlag = false;
      initAnimate();
    }
  };

  woodenFishElement.addEventListener("mouseup", () => {
    counter();
  });

  woodenFishElement.addEventListener("mousedown", () => {
    // setTimeout(() => {
    //   initAnimate();
    // }, 200);
  });

  logoElement.addEventListener("click", () => {
    if (bgm.playing() && bgm.state().toString() === "loaded") {
      bgm.pause(bgmId);
    } else {
      if (bgmId !== 0) {
        bgm.play(bgmId);
      } else {
        bgmId = bgm.play();
      }
    }
  });

  autoClickElement.addEventListener("click", () => {
    autoClick = !autoClick;
    if (autoClick) {
      autoClickElement.classList.add("confirm");
      autoClickInterval = setInterval(() => {
        counter();
        // setTimeout(() => {
        //   initAnimate();
        // }, 200);
      }, 500);
    } else {
      autoClickElement.classList.remove("confirm");
      clearInterval(autoClickInterval);
    }
  });

};

function remChange(doc, win) {
  let docEl = doc.documentElement;
  let resizeEvt =
    "orientationchange" in window ? "orientationchange" : "resize";
  let recalc = function () {
    var clientWidth = docEl.clientWidth;
    if (!clientWidth) return;
    if (clientWidth >= 640) {
      docEl.style.fontSize = "100px";
    } else {
      docEl.style.fontSize = 100 * (clientWidth / 640) + "px";
    }
  };
  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener("DOMContentLoaded", recalc, false);
  recalc();
}
remChange(document, window);


function toggleMenu() {
      var submenu = document.querySelector('.submenu');
      submenu.style.display = (submenu.style.display === 'block') ? 'none' : 'block';
    }

    function showUsage() {
   // 显示提示信息
      showTip('按下 空格键 或 点击 积攒功德！');
    }

    // 点击页面其他区域时关闭菜单
    document.addEventListener('click', function (event) {
      var menuContainer = document.getElementById('menu-container');
      var submenu = document.querySelector('.submenu');
      
      if (!menuContainer.contains(event.target) && !submenu.contains(event.target)) {
        submenu.style.display = 'none';
      }
    });

    // 显示版权信息
    var copyrightDiv = document.getElementById('copyright');
    copyrightDiv.style.display = 'block';

    // 显示提示信息
    function showTip(message) {
      var tipContainer = document.getElementById('tip-container');
      tipContainer.innerHTML = message;
      tipContainer.style.display = 'block';

      // 三秒后隐藏提示信息
      setTimeout(function () {
        tipContainer.style.display = 'none';
      }, 3000);
    }

function againClick(){
    // 重置 count 为 0
  count = 0;
  // 更新本地存储中的值为重置后的 count
  localStorage.setItem("count", String(count));
  let countElement = document.querySelector(".count");
  countElement.innerHTML = String(count);

}