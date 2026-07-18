const fs = require('fs');
const path = 'data/story.json';
const buf = fs.readFileSync(path);
if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
  fs.writeFileSync(path, buf.subarray(3));
  console.log('BOM removed from', path);
} else {
  console.log('No BOM found, nothing to do');
}
