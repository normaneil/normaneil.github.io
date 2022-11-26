<?php
session_set_cookie_params(14400);
ini_set('session.cookie_lifetime', 0); // until the browser close
ini_set('session.gc_maxlifetime', 14400); //
session_destroy();
session_start();
$mobile = "";
$mobile_error="";
$user_session_id = "";
function file_post_contents($url, $data)
{
    $postdata = http_build_query($data);

    $opts = array('http' =>
        array(
            'method'  => 'POST',
            'header'  => 'Content-type: application/x-www-form-urlencoded',
            'content' => $postdata
        )
    );

    $context = stream_context_create($opts);
    return file_get_contents($url, false, $context);
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
  // collect value of input field
  $mobile = $_POST['mobile'];
  if (empty($mobile)) {
    // echo "Name is empty";
    $mobile_error = "Mobile is empty. Please input your mobile number";
  } else {
    $data = array("mobile" => $mobile);
    $response =  file_post_contents("http://127.0.0.1:8000/api/auth", $data);
    
    if ($response == "true") {
      // Create session id
      session_regenerate_id();
      $user_session_id = session_id();
      $_SESSION['session_id'] = $user_session_id;
      $_SESSION['mobile'] = $mobile;
      $is_allowed = 1;
    } else {
      $mobile_error = "Unauthorized";
      $is_allowed = 0;
    }
  }
}
?>

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link
      href="https://unpkg.com/tailwindcss@^2/dist/tailwind.min.css"
      rel="stylesheet"
    />
   
    
  </head>
  <body>
      <form method="POSt" action="<?php echo $_SERVER['PHP_SELF'];?>">
    <div class="min-h-screen bg-gray-100 text-gray-800 antialiased px-4 py-6 flex flex-col justify-center sm:py-12">
        <div class="relative py-3 sm:max-w-xl mx-auto text-center">
          <span class="text-2xl font-light">Login to your account</span>
          <div class="relative mt-4 bg-white shadow-md sm:rounded-lg text-left">
            <div class="h-2 bg-indigo-400 rounded-t-md"></div>
            <div class="py-6 px-8">
              <div id="login-container">
                <label class="block font-semibold">Mobile Number<label>
                <input type="text" id="mobile" name="mobile" placeholder="Mobile" value="<?php echo $mobile; ?>" class=" border w-full h-5 px-3 py-5 mt-2 hover:outline-none focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-md">
                <div class="text-red-600 text-sm"><?php echo $mobile_error;?></div>
                <div class="flex justify-between items-baseline">
                  
                  <button class="mt-4 bg-indigo-500 text-white py-2 px-6 rounded-lg w-full " id="loginBt" >Login</button>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
      
      <script>
        localStorage.setItem("is_allowed", "0");
        localStorage.setItem("mobile","");
        <?php 
        if($is_allowed == 1) {
        ?>
        console.log("User is allowed");
        localStorage.setItem("is_allowed","<?php echo $user_session_id; ?>");
        localStorage.setItem("mobile","<?php echo $mobile; ?>");
        location.href="console.php?id=<?php echo $user_session_id; ?>";
        <?php
        }
        ?>
      </script>
      </form>
  </body>
</html>
