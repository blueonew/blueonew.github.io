function checkStrNullOrEmpty(str) {
	if (!str || str.length == 0) {
		return true;
	}
	if (str.replace(/(^\s*)|(\s*$)/g, "").length == 0) {
		return true;
	}
	return false;
}
function actionOne_videoPlayer(sourceFrom, ids, title,vid) {
	// 用户视频播放
	var NowTime = parent.getCurrentTime();
	//sourceFrom
	if(checkStrNullOrEmpty(sourceFrom)){sourceFrom="0";}
	//ids
	if(checkStrNullOrEmpty(ids)){ids="0";}
	//title
	if(checkStrNullOrEmpty(title)){title="0";}
	//vid
	if(checkStrNullOrEmpty(vid)){vid="0";}
	
	var videoPlayerStr = "1\t" + NowTime + "\t0\t0\t" + sourceFrom + "\t"
			+ ids + "\t" + title + "\t0\t0\t"+vid;
	parent.addChar(videoPlayerStr);
}

function actionFive_Click(sourcefrom, ids, title, url) {
	// 用户一级界面/二级界面点击数据
	var NowTime = parent.getCurrentTime();
	//sourceFrom
	if(checkStrNullOrEmpty(sourcefrom)){sourcefrom="0";}
	//ids
	if(checkStrNullOrEmpty(ids)){ids="0";}
	//title
	if(checkStrNullOrEmpty(title)){title="0";}
	//url
	if(checkStrNullOrEmpty(url)){url="0";}
	var ClickStr = "5\t" + NowTime + "\t0\t0\t" + sourcefrom + "\t" + ids
			+ "\t" + title + "\t" + url;
	parent.addChar(ClickStr);
}
