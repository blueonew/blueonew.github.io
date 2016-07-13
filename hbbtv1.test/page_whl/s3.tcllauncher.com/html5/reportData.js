
//------------------------------------------------------变量--------------------

//上报周期计时器
var clearTimeOutId;
//上报过期计时器
//上报对象
var reportDataXmlHttp = new XMLHttpRequest();
var clientType = top.getClientType();
var dnum = top.getDnum();
var mac = top.getMac();
var launcher_id = top.getlauncherId();
var app_version = "1.0";
var sys_version = tcl.factory.getProductInfo().swName;
var ip = tcl.setting.networkIP;


function getCurrentTime() 
{
    //2016-02-26 06:24:59
    var currDateTime ;
    var timeStrArr=new Array();
    timeStrArr = tcl.setting.currentDate.split("-");
    currDateTime = timeStrArr[2] + '-' + timeStrArr[1] + '-' + timeStrArr[0];
    currDateTime = currDateTime + ' ' + tcl.setting.currentTime;
    return currDateTime;
}

function formattime(temptime)
{	
    return (temptime>9)?temptime:('0'+temptime); 
}

function getCurrentTimeSecondes() 
{
	return new Date().getTime();
}

function getReportUrl()
{
	var reportUrl;
	if(top.prefixUrl == undefined)
	{	
        reportUrl = "http://europe.tcllauncher.com/api/v2/log/upload4html";	
	}
	else
	{
        reportUrl = top.prefixUrl + "/log/upload4html";	
	}
	reportUrl = addUrlParam(reportUrl,"client_type",clientType);
	reportUrl = addUrlParam(reportUrl,"dnum",dnum);
	reportUrl = addUrlParam(reportUrl,"mac",mac);
	reportUrl = addUrlParam(reportUrl,"launcher_id",launcher_id);
	reportUrl = addUrlParam(reportUrl,"app_version",app_version);
	reportUrl = addUrlParam(reportUrl,"sys_version",sys_version);
	reportUrl = addUrlParam(reportUrl,"ip",ip);
	reportUrl = addUrlParam(reportUrl,"param",new Date().getTime());
	
    return reportUrl;
}

//"http://54.255.146.242/api/v2/log/upload4html?client_type=THOM-EU-MT56-S2&dnum=19831111&mac=0&launcher_id=432h14l32h14&app_version=2&sys_version=0";
function uploadData() 
{
    var data = localStorage.getItem("launcherLog");

    if (!data)
    {
        return;
    }
    var len = data.length;
    if (len<=0)
    {
        return;
    }
    
    if (!tcl.setting.networkStatus())
    {
        if (len>1048576)
        {
            console.log("uploadData over 1M");
            localStorage.removeItem("launcherLog");
        }
        return;
    }
    localStorage.setItem("lastUploadTime", getCurrentTimeSecondes());
	var reportUrl = getReportUrl();

	// 监听响应并进行处理
	reportDataXmlHttp.onreadystatechange = function() {
		if (reportDataXmlHttp.readyState == 4) 
        {
			if (reportDataXmlHttp.status == 200) 
            {
				console.log("uploadData success!");
			} 
            else 
            {
				console.log("uploadData failed!");
			}
		}
	};
	reportDataXmlHttp.open('POST', reportUrl, true);
    console.log("uploadData "+len);
	reportDataXmlHttp.send(data);
    localStorage.removeItem("launcherLog");
}

function addChar(str) 
{
    var len = str.length;
    if (len < 0)
    {
        return;
    }
    var data = localStorage.getItem("launcherLog");
    if (data)
    {
        localStorage.setItem("launcherLog", data+"\n"+str);
        len += data.length;
    }
    else
    {
        localStorage.setItem("launcherLog", str);
    }
    if (len > 1048576)
    {
        if (top.uploadData)
        {
            top.uploadData();
        }
        else
        {
            uploadData();
        }
    }
}

function wakeReportTimeInterval() 
{
    if (top.uploadData)
    {
        //framework uploadData
        return;
    }
    var newTimePeriod = Number(top.uploadPeriod)- Math.abs(Number(getCurrentTimeSecondes()) - Number(localStorage.getItem("lastUploadTime")));
    if (newTimePeriod < 0) 
    {
        uploadData();
    }
    else
    {
        clearInterval(clearTimeOutId);
        clearTimeOutId = setInterval("uploadData()", top.uploadPeriod);
    }
}

function actionOne_videoPlayer_next(sourceFrom, ids, title,vid) 
{
    // 用户视频播放，提供给非首页的调用
    var NowTime = getCurrentTime();
    //sourceFrom
    if(checkStrNullOrEmpty_next(sourceFrom)){sourceFrom="0";}
    //ids
    if(checkStrNullOrEmpty_next(ids)){ids="0";}
    //title
    if(checkStrNullOrEmpty_next(title)){title="0";}
    //vid
    if(checkStrNullOrEmpty_next(vid)){vid="0";}

    var videoPlayerStr = "1\t" + NowTime + "\t0\t0\t" + sourceFrom + "\t"
            + ids + "\t" + title + "\t0\t0\t"+vid;
    addChar(videoPlayerStr);
}

function actionFive_Click_next(sourcefrom, ids, title, url) 
{
    // 用户一级界面/二级界面点击数据，提供给非首页的调用
    var NowTime = getCurrentTime();
    //sourceFrom
    if(checkStrNullOrEmpty_next(sourcefrom)){sourcefrom="0";}
    //ids
    if(checkStrNullOrEmpty_next(ids)){ids="0";}
    //title
    if(checkStrNullOrEmpty_next(title)){title="0";}
    //url
    if(checkStrNullOrEmpty_next(url)){url="0";}

    var ClickStr = "5\t" + NowTime + "\t0\t0\t" + sourcefrom + "\t" + ids
            + "\t" + title + "\t" + url;
    addChar(ClickStr);
}

function checkStrNullOrEmpty_next(str) 
{
    if (!str || str.length == 0) {
        return true;
    }
    if (str.replace(/(^\s*)|(\s*$)/g, "").length == 0) {
        return true;
    }
    return false;
}
//拼装url的参数：url：url   name：参数名        value：参数内容
function addUrlParam(url,name,value)
{
    url += (url.indexOf("?") == -1 ? "?":"&");
    url += name + "=" + value;
    return url;
}