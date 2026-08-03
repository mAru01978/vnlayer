const fs = require("fs");
const path = "data/story.json";
const buf = fs.readFileSync(path);
if (buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf) {
  fs.writeFileSync(path, buf.subarray(3));
  console.log("BOM removed from", path);
} else {
  console.log("No BOM found, nothing to do");
}
