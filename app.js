var tessel = require('tessel');
var fs = require('fs');
var request = require('request');
var audio = require('audio-vs1053b').use(tessel.port['A']);

var audioFileLike = 'like.mp3';
var audioFileUnlike = 'unlike.mp3';
var currentLikes = 0;
var firstRun = true;
var pollTime = 10000; // milliseconds

// When we get data, push it into our array
audio.on('data', function(data) {
  chunks.push(data);
});

// Wait for the module to connect
audio.on('ready', function() {
  console.log("Audio module connected! Setting volume...");
  // Set the volume in decibels. Around 20 is good; smaller is louder.
  audio.setVolume(10, function(err) {
    if (err) {
      return console.log(err);
    }

    // start the api call
    setInterval(checkLikes, pollTime);
    checkLikes();

  });
});

audio.on('error', function(err) {
  console.log(err);
});

function playSound (arg) {

  console.log("playSound: " + arg);

  if (arg === 1) {
    var song = fs.readFileSync(audioFileLike);
  }else{
    var song = fs.readFileSync(audioFileUnlike);
  }

  audio.play(song, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Done playing');
    }
  });
}




// ##################

function checkLikes () {

  console.log("checking likes")

  request('http://advanced-users.de/like.php', function (error, response, body) {

    if (!error && response.statusCode == 200) {

      var newLikes = parseInt(body);
      console.log("likecount: " + newLikes);

      if (firstRun) {
        firstRun = false;
        currentLikes = newLikes;
      }else{

        if (currentLikes === newLikes) {
          console.log("no new likes");
        }else if (currentLikes < newLikes) {
          console.log("crazy shit, there are new likes!!");
          playSound(1);
        }else if (currentLikes > newLikes) {
          console.log("oh no! we have lost someone!");
          playSound(2);
        }else{
          console.log("strange things happening");
        }

        currentLikes = newLikes;

      }
    }else{
      console.log("error or no 200 status");
    }
  })

}

//setInterval(checkLikes, pollTime);
//checkLikes();
