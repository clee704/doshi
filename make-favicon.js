var config = {
  app: 'app',
  images: 'app/images',
  temp: '.tmp'
};
var sizes = [16, 32];

var sys = require('sys')
var exec = require('child_process').exec;
var svg2png = require('svg2png');

var counter = sizes.length;

sizes.forEach(function (size) {
  var src = config.images + '/favicon-' + size + '.svg';
  var dest = config.temp + '/favicon-' + size + '.png';
  svg2png(src, dest, function (error) {
    if (error !== null) {
      sys.error('An error occurred: ' + error);
    } else {
      sys.puts(src + ' -> ' + dest);
      counter -= 1;
      if (counter === 0) {
        merge();
      }
    }
  });
});

// ImageMagick is required.
function merge() {
  var args = ['convert'];
  sizes.forEach(function (size) {
    args.push(config.temp + '/favicon-' + size + '.png');
  });
  args.push(config.app + '/favicon.ico');
  var command = args.join(' ');
  sys.puts(command);
  exec(command, function (error, stdout, stderr) {
    if (error !== null) sys.error(error);
    if (stderr) sys.error(stderr);
    if (stdout) sys.puts(stdout);
  });
}
