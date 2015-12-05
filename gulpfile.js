var fs = require('fs');
var gulp = require('gulp');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var es = require('event-stream');
var glob = require('glob');



gulp.task('watchify', function(done) {

  var source = 'src/*.js';

  function bundle(b, distName, callback) {
    return b.bundle()
      .pipe(source(distName))
      .pipe(gulp.dest('./build/'))
      .on('end', callback)
  }

  glob(source, function(err, files) {
    if(err) done(err);

    var tasks = files.map(function(entry) {
      var opts = {
        entries: [entry],
        plugin: [watchify],
        delay: 100,
        ignoreWatch: ['**/node_modules/**'],
        poll: false
      }

      var b = browserify(opts).transform('babelify', {presets: ['es2015', 'react']});

      (function(b, entry) {
        var start = new Date().getTime();
        b.on('update', function() {
          var start = new Date().getTime();
          bundle(b, entry, function() {
            console.log("build coast:" + new Date().getTime() - start + 'ms');
          });
        })
      })(b, entry)

      var start = new Date().getTime();
      return bundle(b, entry, function() {
        console.log(new Date().getTime() - start);
      });
    })

    es.merge(tasks).on('end', done);
  })
})
