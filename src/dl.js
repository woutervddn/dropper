var fs = require('fs-extra');
var path = require('path');
var youtubedl = require('youtube-dl');
const {ipcRenderer} = require('electron');
var DOWNLOADDIR = '';
var DROPPERDIR = 'Dropper';

// ipc.on('dldir', function (arg) {
//     DOWNLOADDIR = arg;
// });

var mkDlDir = function(){
  if (!fs.existsSync(DOWNLOADDIR + path.sep + DROPPERDIR)){
    fs.mkdirSync(DOWNLOADDIR + path.sep + DROPPERDIR);
  }
}

var downloadVideoStart = function(url, parameters, extension){
  mkDlDir();
  var video = youtubedl('http://www.youtube.com/watch?v=90AiXO1pAiA',
    // Optional arguments passed to youtube-dl.
    parameters,
    // Additional options can be given for calling `child_process.execFile()`.
    { cwd: __dirname });

  // Will be called when the download starts.
  video.on('info', function(info) {
    console.log('Download started');
    console.log('filename: ' + info.filename);
    console.log('size: ' + info.size);
    video.pipe(fs.createWriteStream(DOWNLOADDIR + path.sep + DROPPERDIR + path.sep + info.filename + extension));
    window.location.reload()
  });
}

var downloadAudioStart = function(url, parameters, extension){
  mkDlDir();
  youtubedl.exec(url, ['-x', '--audio-format', 'mp3'], {}, function(err, output) {
    if (err) throw err;
    console.log(output.join('\n'));

    let files = fs.readdirSync('./', 'utf8');
    let response = [];
    for( let file of files ){
      let extension = path.extname(file);
      if( extension === '.mp3' ){
        fs.move(file, DOWNLOADDIR + path.sep + DROPPERDIR + path.sep + file, { overwrite: true }, function(err){
          //if (err) throw err;
          console.log('success!');
          window.location.reload()
        });
      }
    }


  });
}



$(document).ready(function(){
  DOWNLOADDIR = ipcRenderer.sendSync('dldir-message', 'ping'); // prints "pong"
  $('#download').click(function(e){
    e.preventDefault();
    var url = $('#linkURL').val();
    $('#linkURL').attr('disabled','disabled');
    $('#download').attr('disabled','disabled');
    $('.mdl-card__title').css('background', '#C2185B')
    if( $('.mdl-switch').hasClass('is-checked') ){
      // alert('download audio');
      downloadAudioStart( url, ['-x', '--audio-format', 'mp3'], '.mp3' );

    } else {
      // alert('download video');
      downloadVideoStart( url, [], '.mp4' );
    }

  });
});
