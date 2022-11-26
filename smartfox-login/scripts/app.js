var sfs = null;
$(document).ready(function () {
  console.log("App Started");
  init();

  // $("#connectBt").click(onConnectBtClick);
  // $("#loginBt").click(onLoginBtClick);
  setTimeout(() => {
    onConnectBtClick();
  }, 1000);

  setTimeout(() => {
    onLoginBtClick();
  }, 2000);
});

function init() {
  trace("Application started");

  // Create configuration object
  var config = {};
  config.host = "127.0.0.1";
  config.port = 8080;
  config.zone = "BasicExamples";
  config.debug = true;
  config.useSSL = false;

  // Create SmartFox client instance
  sfs = new SFS2X.SmartFox(config);

  // Set logging
  sfs.logger.level = SFS2X.LogLevel.DEBUG;
  sfs.logger.enableConsoleOutput = true;
  sfs.logger.enableEventDispatching = false;

  sfs.logger.addEventListener(SFS2X.LoggerEvent.DEBUG, onDebugLogged, this);
  sfs.logger.addEventListener(SFS2X.LoggerEvent.INFO, onInfoLogged, this);
  sfs.logger.addEventListener(SFS2X.LoggerEvent.WARNING, onWarningLogged, this);
  sfs.logger.addEventListener(SFS2X.LoggerEvent.ERROR, onErrorLogged, this);

  // Add event listeners
  sfs.addEventListener(SFS2X.SFSEvent.CONNECTION, onConnection, this);
  sfs.addEventListener(SFS2X.SFSEvent.CONNECTION_LOST, onConnectionLost, this);

  sfs.addEventListener(SFS2X.SFSEvent.LOGIN_ERROR, onLoginError, this);
  sfs.addEventListener(SFS2X.SFSEvent.LOGIN, onLogin, this);
  sfs.addEventListener(SFS2X.SFSEvent.LOGOUT, onLogout, this);
  sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN_ERROR, onRoomJoinError, this);
  sfs.addEventListener(SFS2X.SFSEvent.ROOM_JOIN, onRoomJoin, this);

  sfs.addEventListener(
    SFS2X.SFSEvent.USER_COUNT_CHANGE,
    onUserCountChange,
    this
  );
  sfs.addEventListener(SFS2X.SFSEvent.USER_ENTER_ROOM, onUserEnterRoom, this);
  sfs.addEventListener(SFS2X.SFSEvent.USER_EXIT_ROOM, onUserExitRoom, this);
  sfs.addEventListener(SFS2X.SFSEvent.PUBLIC_MESSAGE, onPublicMessage, this);
  sfs.addEventListener(
    SFS2X.SFSEvent.ROOM_VARIABLES_UPDATE,
    onRoomVariablesUpdate,
    this
  );
  sfs.addEventListener(
    SFS2X.SFSEvent.USER_VARIABLES_UPDATE,
    onUserVariablesUpdate,
    this
  );
}
//------------------------------------
// LOGGER EVENT HANDLERS
//------------------------------------

// The dispatched logging messages should be printed in a dedicated debug panel in the application interface
// (because the logger already prints to the console on its own, unless console output is deactivated)

function onConnectBtClick() {
  // Connect to SFS
  // As no parameters are passed, the config object is used
  sfs.connect();
}

function onConnection(event) {
  if (event.success) {
    trace("Connected to SmartFoxServer 2X!");
  } else {
    trace(
      "Connection failed: " +
        (event.errorMessage
          ? event.errorMessage + " (" + event.errorCode + ")"
          : "Is the server running at all?"),
      true
    );
  }
}

function onDebugLogged(event) {
  trace("DEBUG MESSAGE DISPATCHED:\n" + event.message);
}

function onInfoLogged(event) {
  trace("INFO MESSAGE DISPATCHED:\n" + event.message);
}

function onWarningLogged(event) {
  trace("WARNING MESSAGE DISPATCHED:\n" + event.message);
}

function onErrorLogged(event) {
  trace("ERROR MESSAGE DISPATCHED:\n" + event.message);
}

function trace(txt, showAlert) {
  let message = $("#logs").html();
  console.log(txt);
  message = `${message}<br> ${txt}`;
  $("#logs").html(message);
  if (showAlert) alert(txt);
}

function onRoomJoinError(event) {
  trace(
    "Room join error: " + event.errorMessage + " (" + event.errorCode + ")",
    false
  );
}

function onRoomJoin(event) {
  trace("Room joined: " + event.room);
  // showRoomTopic(event.room);
}

function onConnectionLost(event) {
  $("#video-container").addClass("hidden");
  trace("You are disconnected; reason is: " + event.reason, false);
  // alert(`Disconnected : ${event.reason})`);
  location.href = "index.php";
}

// function onLoginError(event) {
//   trace(
//     "Login error: " + event.errorMessage + " (" + event.errorCode + ")",
//     true
//   );
// }

function onLoginError(event) {
  $("#video-container").addClass("hidden");
  trace(
    "Login error: " + event.errorMessage + " (" + event.errorCode + ")",
    true
  );
  // alert(`Login Error: ${event.errorMessage} (${event.errorCode})`);
  location.href = "index.php";
}

function onLogin(event) {
  trace(
    "Login successful!" +
      "\n\tZone: " +
      event.zone +
      "\n\tUser: " +
      event.user +
      "\n\tData: " +
      event.data
  );

  // Populate rooms list
  populateRoomsList();
}

function onLogout(event) {
  trace("Logout from zone " + event.zone + " performed!");
  $("#video-container").addClass("hidden");
}

function onLoginBtClick() {
  // Perform login
  var uName = localStorage.getItem("mobile");
  var isSent = sfs.send(new SFS2X.LoginRequest(uName));
  console.log("isSent", isSent);
  trace(`isSent: ${isSent}`);
}

function populateRoomsList() {
  $("#video-container").removeClass("hidden");
  var rooms = sfs.roomManager.getRoomList();
  var room = rooms[0];
  trace(`room: ${room}`);

  // Join selected room
  if (sfs.lastJoinedRoom == null || room.id != sfs.lastJoinedRoom.id)
    sfs.send(new SFS2X.JoinRoomRequest(room));
}

function onUserCountChange(event) {
  console.log(event);
  // trace(JSON.stringify(event));
  // console.log(JSON.stringify(event));
}

function onUserEnterRoom(event) {
  console.log(event);
  // trace(JSON.stringify(event));
}

function onUserExitRoom(event) {
  console.log(event);
  trace(event);
  // trace(JSON.stringify(event));
}

function onPublicMessage(event) {
  console.log(event);
  trace(event);
  // trace(JSON.stringify(event));
}

function onRoomVariablesUpdate(event) {
  console.log(event);
  trace(JSON.stringify(event));
}

function onUserVariablesUpdate(event) {
  console.log(event);
  trace(JSON.stringify(event));
}
