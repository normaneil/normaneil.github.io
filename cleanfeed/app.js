// Replace the DASH and HLS URIs when you test your own content.
let myData = document.getElementById("browserCheckResult");
let hlsUri = myData.getAttribute("data-hls-uri");

// VideoJS
const player = videojs("videojs-player", {
  muted: true,
  autoplay: true,
  controlBar: {
    fullscreenToggle: false
  },
  userActions: {
    doubleClick: false
  }
});

function configureDRM() {
  player.ready(function () {
    let playerConfig;
    playerConfig = {
      src: hlsUri,
      type: "application/x-mpegurl"
    };
    console.log("playerConfig.src", playerConfig.src);
    player.src(playerConfig);
  });
}

player.ready(function () {
  configureDRM();
});

player.play();
