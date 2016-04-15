

var FileSlinger = (function (file_upload_url, dropElement) {
    "use strict";
    var onDragOver,
        setOnDragOver = function (callback) {
            onDragOver = callback;
        },

        onDragLeave,
        setOnDragLeave = function (callback) {
            onDragLeave = callback;
        },

        onDrop,
        setOnDrop = function (callback) {
            onDrop = callback;
        },

        onFileAdded,
        setOnFileAdded = function (callback) {
            onFileAdded = callback;
        },

        onProgressUpdate,
        setOnProgressUpdate = function (callback) {
            onProgressUpdate = callback;
        },

        onUploadComplete,
        setOnUploadComplete = function (callback) {
            onUploadComplete = callback;
        },

        onUploadAbort,
        setOnUploadAbort = function (callback) {
            onUploadAbort = callback;
        },

        onUploadError,
        setOnUploadError = function (callback) {
            onUploadError = callback;
        },

        uploadQueue = new Array(),
        xhr;


    var doUpload = function () {
        var fData = new FormData();
        fData.append("FileData", uploadQueue[0].file);

        xhr.open('POST', file_upload_url);
        xhr.send(fData);
    };

    var completeUpload = function (e) {
        typeof onUploadComplete === 'function' && onUploadComplete(uploadQueue[0].id, uploadQueue[0].file.name);

        uploadQueue.shift();

        if (uploadQueue.length > 0) {
            doUpload();
        }
    };

    var updateProgress = function (e) {
        var percent = 0;
        if (e.lengthComputable) {
            percent = (e.loaded / e.total) * 100;
        }

        typeof onProgressUpdate === 'function' && onProgressUpdate(uploadQueue[0].id, uploadQueue[0].file.name, percent);
    };

    var initXhr = function () {
        xhr = new XMLHttpRequest()
        xhr.upload.addEventListener('progress', updateProgress, false);
        xhr.upload.addEventListener('load', completeUpload, false);
        xhr.upload.addEventListener('error', onUploadError, false);
        xhr.upload.addEventListener('abort', onUploadAbort, false);
    };

    var init = function () {
        // set up drag and drop events
        dropElement.ondragenter = function (e) {
            e.stopPropagation();
            e.preventDefault();
        };

        dropElement.ondragleave = function (e) {
            e.stopPropagation();
            e.preventDefault();
            typeof onDragLeave === 'function' && onDragLeave();
        };

        dropElement.ondragover = function (e) {
            e.stopPropagation();
            e.preventDefault();
            typeof onDragOver === 'function' && onDragOver();  
        };

        dropElement.ondrop = function (e) {
            e.stopPropagation();
            e.preventDefault();

            var files = e.dataTransfer.files,
                fileCount = files.length;
            typeof onDrop === 'function' && onDrop();

            for (var i = 0; i < fileCount; i++) {
                uploadQueue.push({
                    id: i,
                    file: files[i]
                });
                typeof onFileAdded === 'function' && onFileAdded(i, files[i].name);
            }
            
            if (typeof xhr === 'undefined') {
                initXhr();
            }

            if (xhr.readyState == 4 || xhr.readyState == 0) {
                doUpload();
            }
        };
    };

    init();

    return {
        onDragOver: setOnDragOver,
        onDragLeave: setOnDragLeave,
        onDrop: setOnDrop,
        onFileAdded: setOnFileAdded,
        onUploadProgress: setOnProgressUpdate,
        onUploadComplete: setOnUploadComplete
    };
});


