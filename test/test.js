const OpenCV = require('../index')
const path = require('path')

async function main() {
  const opencv = new OpenCV();
  await opencv.loadCV();

  const src = await opencv.imread(path.join(__dirname, './lena.png'));
  const dst = new cv.Mat();
  const M = cv.Mat.ones(5, 5, cv.CV_8U);
  const anchor = new cv.Point(-1, -1);
  cv.dilate(src, dst, M, anchor, 1, cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());

  await opencv.imwrite(path.join(__dirname, './out.png'), dst);

  src.delete();
  dst.delete();
};

main();