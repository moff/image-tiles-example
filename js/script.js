$(function(){

    // required variable - margin for tiles
    var margin = 2;

    // tiles app
    var app = new Vue({
        el: '#tilesBox',
        data: {
            images: []
        },
        created: function() {
                fetchImages();
        }
    });

    // initial arrangement
    arrangeTiles();

    // re-arrange tiles on window resize
    window.onresize = function() {
        arrangeTiles();
    }
    
    // load images from database
    function fetchImages() {
        $.getJSON("/images.php", function(data) {
            preloadImages(data);
        }); 
    }

    function preloadImages(data) {
        
        // empty images array
        app.images = [];
        
        data.forEach(function(item){
            var img = new Image();
            img.src = item.filename;
            img.onload = function() {
                // push to images array
                app.images.push({
                    height: img.height,
                    width: img.width,
                    cssObj: {
                        backgroundImage: "url('" + img.src + "')",
                        height: img.height + "px",
                        width: img.width + "267px"
                    }
                });
                arrangeTiles();
            }
        });
    }

    // arrange tiles properly
    function arrangeTiles() {
        var containerWidth = app.$el.clientWidth;
        var filledWidth = 0;
        var prev = 0;

        app.images.forEach(function(image) {
            image.cssObj.width = image.width + 'px';
            image.cssObj.margin = margin + 'px';
        });

        app.images.forEach(function(image, index) {
            filledWidth += image.width + margin * 2;

            if (filledWidth > containerWidth) {
                var imgsInRow = prev > 0 ? index - prev : index + 1;
                var diff = (filledWidth - containerWidth) / imgsInRow;

                app.images.forEach(function(img, ind) {
                    if (ind <= index && prev == 0 || ind <= index && ind > prev) {
                        img.cssObj.width = (img.width - diff) + 'px';
                    }
                });

                prev = index;
                filledWidth = 0;
            }
        });
    }
    
    // uploader app
    var uploader = new Vue({
      el: '#uploadBox',
      data: {
        uploadedFiles: [], 
        fileProgress: 0, 
        allFilesUploaded: false,
        pending: false,
        errors: []
      },
      methods: {
        dismissError: function(index) {
            console.log('Dismiss!');
            console.log(index);
            console.log(this.errors);
            this.errors.splice(index,1);
        }
      },
      events: {
        onFileClick: function(file) {
          console.log('onFileClick', file);
        },
        onFileChange: function(file) {
          console.log('onFileChange', file);
          // here is where we update our view
          this.fileProgress = 0;
          this.allFilesUploaded = false;
        },
        beforeFileUpload: function(file) {
          // called when the upload handler is called
          console.log('beforeFileUpload', file);
        },
        afterFileUpload: function(file) {
          // called after the xhr.send() at the end of the upload handler
          console.log('afterFileUpload', file);
        },
        onFileProgress: function(progress) {
          console.log('onFileProgress', progress);
          // update our progress bar
          this.fileProgress = progress.percent;
          
          // show pending
          this.pending = true;
        },
        onFileUpload: function(file, res) {
          console.log('onFileUpload', file, res);
          // update our list
          this.uploadedFiles.push(file);
        },
        onFileError: function(file, res) {
          this.pending = false;
          if (!res.hasOwnProperty('error')) {
            res = {
                errorText: res
            };
          }
          this.errors.$remove(res);
          this.errors.push(res);
        },
        onAllFilesUploaded: function(files) {
          console.log('onAllFilesUploaded', files);
          // everything is done!
          this.allFilesUploaded = true;
          this.pending = false;
          fetchImages();
        }
      }
    });
    
});
