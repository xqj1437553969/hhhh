let fs = require("fs");
const getFileNameList = path => {
	let fileList = [];
	let dirList = fs.readdirSync(path);
	dirList.forEach(item => {
		if (item.indexOf('html') > -1) {
	        fileList.push(item.split('.')[0]);
		}
	});
  	return fileList; //返回当前src文件夹下的所有html文件名组成的数组
};
module.exports = {
    HTMLDirs:getFileNameList('./src'),
    cssPublicPath:"../",
    imgOutputPath:"images/",
//  cssOutputPath:"./css/styles.css",
    devServerOutputPath:"../dist",
}
