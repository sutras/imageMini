// 允许压缩的文件类型（仅允许压缩图片类型）
let allowed = [
    'image/png',
    'image/jpeg'
];
// 文件下载时对应的扩展名
let mapMimeToExt = {
    'image/jpeg': 'jpg',
    'image/png': 'png'
};

// 图片压缩质量关键字，默认为high；可选值：0-1
const mapQuality = {
    'low': 0.3,
    'medium': 0.6,
    'high': 0.9,
    'super': 0.95
};

function imageMini() {}

function getMimeByDataURL( dataURL ) {
    return /^data:(.*?);/.exec( dataURL )[1];
}

function blobToDataURL( blob, callback ) {
    const reader = new FileReader();
    reader.onload = function () {
        if ( callback ) {
            callback( reader.result );
        }
    }
    reader.readAsDataURL( blob );
}

function blobToImage( blob, callback ) {
    blobToDataURL( blob, function( dataURL ) {
        dataURLtoImage( dataURL, callback );
    });
}

function dataURLtoBlob( dataURL ) {
    const mime = getMimeByDataURL( dataURL );
    const decodedData = atob( dataURL.split(',')[1] );  // 解码
    const arrayBuffer = new ArrayBuffer( decodedData.length );  // 创建缓冲数组
    const intArray = new Uint8Array( arrayBuffer );  // 创建视图

    for ( let i = 0, l = decodedData.length; i < l; i++ ) {
        intArray[i] = decodedData.charCodeAt(i);
    }
    return new Blob([intArray], {type: mime});
}

function dataURLtoImage( dataURL, callback ) {
    const image = new Image();
    image.src = dataURL;
    image.onload = function() {
        if ( callback ) {
            callback( image );
        }
    };
}

function compressImage( image, options ) {
    let
        mime = getMimeByDataURL( image.src ),
        quality,
        widthAndHeight,
        srcWidth = image.width,
        srcHeight = image.height,
        width,
        height,
        canvas, context;

    if ( typeof options === 'function' ) {
        options = options( srcWidth, srcHeight );
    }
    if ( !options ) {
        options = {};
    }

    quality = options.quality;

    if ( typeof quality === 'string' ) {
        quality = mapQuality[ quality ];
    }

    if ( typeof quality !== 'number' || quality < 0 || quality > 1 ) {
        quality = mapQuality.high;
    }

    widthAndHeight = getWidthAndHeight(
        srcWidth, srcHeight,
        options.width, options.minWidth, options.maxWidth,
        options.height, options.minHeight, options.maxHeight
    );
    width = widthAndHeight[0];
    height = widthAndHeight[1];

    canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height= height;
    context = canvas.getContext('2d');
    context.drawImage( image, 0, 0, width, height );

    return {
        srcWidth,
        srcHeight,
        width,
        height,
        dataURL: canvas.toDataURL( mime, quality )
    };
}

function compressFile( file, options, callback ) {
    if ( typeof callback !== 'function' ) {
        return;
    }
    if ( allowed.indexOf( file.type ) !== -1 ) {
        blobToDataURL( file, function( dataURL ) {
            dataURLtoImage( dataURL, function( image ) {
                let compressed = compressImage( image, options );
                callback( dataURLtoBlob( compressed.dataURL ), compressed );
            } );
        } );
    } else {
        callback( file );
    }
}

// target: Blob | dataURL
function download( target, filename, callback ) {
    function download( dataURL ) {
        const anchor = document.createElement('a');
        anchor.download = filename;
        anchor.href = dataURL;
        anchor.onclick = function() {
            if ( callback ) {
                callback();
            }
        };
        anchor.click();
    }

    const isBlob = target instanceof Blob;
    const ext = mapMimeToExt[ isBlob ? target.type : getMimeByDataURL( target ) ];
    filename = ( filename || 'download' ) + '.' + ext;

    // IE10
    if ( window.navigator.msSaveBlob ) {
        if ( !isBlob ) {
            target = dataURLtoBlob( target );
        }
        window.navigator.msSaveBlob( target, filename );

    // 其他浏览器
    } else {
        if ( isBlob ) {
            blobToDataURL( target, function( dataURL ) {
                download( dataURL );
            } );
        } else {
            download( target );
        }
    }
}

function getWidthAndHeight( srcW, srcH, w, minW, maxW, h, minH, maxH ) {
    let scale = srcW / srcH,
        lastW,
        lastH;

    function limitW() {
        if ( maxW && lastW > maxW ) {
            lastW = maxW;
        }
        if ( minW && lastW < minW ) {
            lastW = minW;
        }
    }

    function limitH() {
        if ( maxH && lastH > maxH ) {
            lastH = maxH;
        }
        if ( minH && lastH < minH  ) {
            lastH = minH;
        }
    }

    if ( w ) {
        lastW = w;
        limitW();

        lastH = h ? h : lastW / scale;
        limitH();
    } else if ( !w && h ) {
        lastH = h;
        limitH();

        lastW = lastH * scale;
        limitW();
    } else {
        lastW = srcW;
        limitW();

        lastH = srcH;
        limitH();

        maxW = scale * lastH;
        maxH = lastW / scale;

        limitW();
        limitH();
    }

    return [ lastW, lastH ];
}

// 对外接口
imageMini.compressFile = compressFile;
imageMini.download = download;

imageMini.allowed = allowed;
imageMini.mapMimeToExt = mapMimeToExt;

imageMini.blobToDataURL = blobToDataURL;
imageMini.blobToImage = blobToImage;
imageMini.dataURLtoBlob = dataURLtoBlob;
imageMini.dataURLtoImage = dataURLtoImage;

export default imageMini;