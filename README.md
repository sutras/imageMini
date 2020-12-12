# imageMini
在前端压缩上传的图片


# 使用
``` html
<script type="text/javascript" src="imageMini.min.js"></script>
<input type="file" id="fileEl" onchange="onChange(this)" />

<script type="text/javascript">
    function onChange( el ) {
        var file = el.files[0];
        if ( !file ) {
            return;
        }
        imageMini.compressFile( file, {
            maxWidth: 640
        }, function( compressedFile ) {
            console.log('压缩后的图片文件：', compressedFile);
        });
    }
</script>
```


# imageMini.compressFile()

``` js
imageMini.compressFile(
    file: Blob,
    options: void | (w: number, h: number ) => (Options | void) | Options = {},
    callback: (file: Blob, compressed: Compressed)
)

enum Quality {
    low = 0.3,
    medium = 0.6,
    high = 0.9,  // 默认
    super = 0.95,
}

interface Options {
    quality?: number | Quality;  // 数值的区间：[0, 1]
    width?: number;
    height?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
}

interface Compressed {
    srcWidth: number;
    srcHeight: number;
    width: number;
    height: number;
    dataURL: string;
}
```


# 其他工具函数
## imageMini.download( target: Blob | string, filename?: string = 'download', callback: () );
## imageMini.blobToDataURL( blob: Blob, callback?: ( dataURL: string ) );
## imageMini.blobToImage( blob: Blob, callback?: ( image: HTMLImageElement ) );
## imageMini.dataURLtoBlob( dataURL: string ): Blob;
## imageMini.dataURLtoImage( dataURL: string, callback?: ( image: HTMLImageElement ) );


# 全局配置对象
``` js
// 允许压缩的文件类型（仅允许压缩图片类型）
imageMini.allowed = [
    'image/png',
    'image/jpeg'
];

// 文件下载时对应的扩展名
imageMini.mapMimeToExt = {
    'image/jpeg': 'jpg',
    'image/png': 'png'
};
```

# 兼容性
- FileReader       -> IE10+(含)
- atob             -> IE10+(含)
- ArrayBuffer      -> IE10+(含)
- Uint8Array       -> IE10+(含)
- Blob             -> IE10+(含)
- canvas           -> IE9+(含)

- HTMLAnchorElement.download -> IE不支持
     （IE10 的navigator.msSaveBlob无法下载，只保留一个临时文件：不知为何）
     
鉴于以上兼容性，不使用下载功能，可以用于IE10浏览器；
使用下载功能，则要放弃IE浏览器。