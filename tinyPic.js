const tinify = require('tinify');
const fs = require('fs');

const recursiveLimit = 10;

tinify.key = fs.readFileSync('./.tinifyKey', 'utf8');
tinify.validate(err => {
  if (err) {
    // 颜色日志输出：https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color
    console.log('\x1b[31m', '#  - API key validate fail, please check it.');
  } else {
    const compressionsThisMonth = tinify.compressionCount;
    const remainCount = 500 - compressionsThisMonth;
    if (remainCount === 0) {
      console.log('\x1b[31m', '#  - counts of compression are all used this month.');
    }
    console.log('\x1b[34m', `#  - this month you can use ${remainCount} times`);

    fs.readdir('./files', (err, files) => {
      if (err) {
        console.log('\x1b[31m', '#  - read files error.');
      } else if (files.length === 0) {
        console.log('\x1b[31m', '#  - files is empty.');
      } else {
        console.log('\x1b[34m', '#  - files is compressing, please wait.');
        files.forEach(fileName => {
          fs.readFile(`./files/${fileName}`, (err, buf) => {
            if (err) {
              console.log('\x1b[31m', `#  - ${fileName} read error. ${err.message}`);
            } else {
              recursiveCompress(fileName, buf, recursiveLimit);
            }
          });
        });
      }
    });
  }
});

const recursiveCompress = (fileName, preBuf, count) => {
  tinify.fromBuffer(preBuf).toBuffer((err, buf) => {
    if (err) {
      console.log('\x1b[31m', `#  - ${fileName} compress error. ${err.message}`);
    } else if ((1 - buf.length/preBuf.length) > 0.001) {
      count--;
      recursiveCompress(fileName, buf, count);
    } else {
      fs.writeFile(`./compressed/${fileName}`, buf, err => {
        if (err) {
          console.log('\x1b[31m', `#  - ${fileName} write error. ${err.message}`);
        } else {
          console.log('\x1b[35m', `#  - ${fileName} compress done.`);
        }
      });
    }
  })
}
