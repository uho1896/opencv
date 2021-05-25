const { Canvas, createCanvas, Image, ImageData, loadImage } = require('canvas')
const { JSDOM } = require('jsdom')
const { writeFile, mkdirSync, existsSync } = require('fs')

class OpenCV {
  constructor(opts = {}) {
    this.version = opts.version || '4.5.2';
  }

  installDOM() {
    const dom = new JSDOM();
    global.document = dom.window.document;
    global.Image = Image;
    global.HTMLCanvasElement = Canvas;
    global.ImageData = ImageData;
    global.HTMLImageElement = Image;
  }

  loadCV(rootDir = '/work', localRootDir = process.cwd()) {
    if (global.Module && global.Module.onRuntimeInitialized && global.cv && global.cv.imread) {
      return Promise.resolve()
    }

    return new Promise(resolve => {
      this.installDOM();
      global.Module = {
        onRuntimeInitialized() {
          cv.FS.chdir(rootDir);
          return resolve();
        },
        preRun() {
          const FS = global.Module.FS
          // create rootDir if it doesn't exists
          if(!FS.analyzePath(rootDir).exists) {
            FS.mkdir(rootDir);
          }
          // create localRootFolder if it doesn't exists
          if(!existsSync(localRootDir)) {
            mkdirSync(localRootDir, { recursive: true});
          }
          // FS.mount() is similar to Linux/POSIX mount operation. It basically mounts an external
          // filesystem with given format, in given current filesystem directory.
          FS.mount(FS.filesystems.NODEFS, { root: localRootDir}, rootDir);
        }
      };

      global.cv = require(`./lib/opencv.${this.version}.js`);
    });
  }

  async imread(imgPath) {
    const image = await loadImage(imgPath);
    return cv.imread(image);
  }

  async imwrite(fn, src, opts = {}) {
    const format = opts.format || 'image/png';
    const flag = opts.flag || 'w+';
    const canvas = createCanvas(src.size().width, src.size().height);
    cv.imshow(canvas, src);

    return new Promise((resolve, reject) => {
      writeFile(fn, canvas.toBuffer(format), {flag}, (err) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    });
  }
}

module.exports = OpenCV