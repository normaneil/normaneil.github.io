<?php
session_start();
if (!isset($_SESSION['session_id'])) {
  header("location:index.php");
  exit;
}
if (!isset($_GET['id'])) {
  header("location:index.php");
  exit;
}
// echo $_SESSION['session_id'];
$session_id = $_GET['id'];
// echo $session_id;

$has_drm_token = FALSE;

$response = file_get_contents("http://127.0.0.1:8000/api/token");
$response = json_decode($response);
if ($response) {

  $DASH_URI = $response->DASH_URI;
  $HLS_URI = $response->HLS_URI;
  $LICENSE_URI = $response->LICENSE_URI;
  $FAIRPLAY_CERT_URI = $response->FAIRPLAY_CERT_URI;
  $FAIRPLAY_CERT_DERURI = $response->FAIRPLAY_CERT_DERURI;
  $widevine_token = $response->widevine_token;
  $playready_token = $response->playready_token;
  $fairplay_token = $response->fairplay_token;

  $has_drm_token = TRUE;
}
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script type="text/javascript" src="libs/jquery-1.7.2.min.js"></script>
    <link
      href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
      rel="stylesheet"
    />
    <script type="text/javascript" src="libs/sfs2x-api-1.7.11.js"></script>

    <!-- VideoJS library and css -->
    <script src="https://vjs.zencdn.net/7.17.0/video.min.js"></script>
    <link href="https://vjs.zencdn.net/7.17.0/video-js.css" rel="stylesheet" />
    <script src="https://unpkg.com/videojs-contrib-dash/dist/videojs-dash.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/videojs-contrib-eme@3.7.0/dist/videojs-contrib-eme.min.js"></script>

    <style>
        .container {
            position: absolute;
            left: 50%;
            top: 50%;
            -webkit-transform: translate(-50%, -50%);
            transform: translate(-50%, -50%);
            width: 500px;
            height: 240px;
        }
        .video-js .vjs-big-play-button {
            display: none;
        }
        .video-js .vjs-control-bar {
            display: flex;
        }
        .video-js .vjs-fullscreen-control { 
            display: none; 
        }
        #logs {
          font-size: smaller;
          color: #666;
        }

    </style>
    
  </head>
  <body>
    <div class="container">
        <code id="browserCheckResult" data-dash-uri="<?php echo $DASH_URI;?>" data-hls-uri="<?php echo $HLS_URI;?>" data-license-uri="<?php echo $LICENSE_URI;?>" data-fairplayCertUri="<?php echo $FAIRPLAY_CERT_URI;?>" data-fairplayCertDerUri="<?php echo $FAIRPLAY_CERT_DERURI;?>" data-widevineToken="<?php echo $widevine_token; ?>" data-playreadyToken="<?php echo  $playready_token; ?>" data-fairplayToken="<?php $fairplay_token; ?>" ></code>
        <video id="videojs-player" class="video-js vjs-default-skin vjs-16-9" controls></video>
        <code id="logs"></code>
    </div>
    <script>
      let is_allowed = localStorage.getItem("is_allowed");
      console.log("is_allowed", is_allowed);
      if(is_allowed == 0 || is_allowed == "0") {
        location.href="index.php";
      } 
    </script>
    <script type="text/javascript" src="scripts/app.js"></script>
    <?php if ($has_drm_token) { ?>
      <script type="text/javascript" src="scripts/video.js"></script>
     <?php } ?>
  </body>
</html>
