var writeString="";
var realKey="";
var focusField="Frame"
var currentFocusId="Frame";
var popVideoNum=5;
var title= new Array(popVideoNum);
var videoId= new Array(popVideoNum);
var imgURL= new Array(popVideoNum);
var character = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
var characterUpperCase = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"];
var numericKey = ["0","1","2","3","4","5","6","7","8","9"];
var capsLock=0;
var backInfo="";
var xmlhttp=new XMLHttpRequest();
var youtubeKey="AIzaSyDhxJE9_Bs3NF0YNt1OhrDefVvdrfQ8U_8";
var storage = window.localStorage;  
var regionCode;
var searchPageWords = [top.searchPageWords[0],top.searchPageWords[1],top.searchPageWords[2]];
document.onkeydown=keyProcess;

function init()
{
    if (tcl.channel.inputSource != 10)
    {
        tcl.channel.requestInputSource(10);
    }
    setTimeout(function (){tcl.channel.requestMute(0);},500);
	storage.removeItem("searchResult");
	var storageInfo=storage.getItem("searchx");// 判断有否当日YouTube pop video cache
	if(storageInfo!=null)
	{
		refreshDay=storageInfo.split("?")[0];// 日期是以？间隔的
		if(checkRefreshDay(refreshDay) == false )
		{
			setTimeout(function (){getPopVideos();},10);
		}
		else 
		{
			backInfo=storageInfo;
			displayPopVideos(backInfo);
		}
	}
	else 
	{	
		setTimeout(function (){getPopVideos();},10);
	}
	
	$("titleName").innerHTML = searchPageWords[0];
	$("popularSearches").innerHTML = searchPageWords[1];
	$("searchText").innerHTML = searchPageWords[2];
	mouseCallBack.funcOk = respondEnter;
    top.g_temp="homePage";
}

function $( id )
{
	return document.getElementById(id);
}
	
document.onsystemevent = systemEventHandle;	

function keyProcess(evt)
{
	var keyCode = evt.which;
	var key;// output key
	switch (keyCode)
	{
		case 37:
		case VK_LEFT:
		{
			if (focusField == "keyBoard") {
				moveLeft();
				break;
			}
			else {
				changeFocus("data-left");
				break;
			}
		}
		case 38:
		case VK_UP:
		{
			if (focusField == "keyBoard") {
				moveUp();
				break;
			}
			else {
				focusField = "Frame";
				changeFocus("data-up");
				break;
			}
		}

		case 39:
		case VK_RIGHT:
		{
			if (focusField == "keyBoard") {
				moveRight();
				break;
			}
			else {
				changeFocus("data-right");
				break;
			}
		}

		case 40:
		case VK_DOWN:
		
			if (focusField == "keyBoard") 
			{
				moveDown();
				break;
			}
			else if (backInfo != "")
			{
					focusField = "pop";
					changeFocus("data-down");
			}
			break;

		case 8:
		case VK_BACK:
		{
			if (focusField == "keyBoard") {
				hiddenKeyBoard();
				focusField = "Frame";
				break;
			}
			else {
				xmlhttp.abort();
                if (top.enableUpdateScreen)
                {
                    top.enableUpdateScreen(false);
                }
				window.location = top.getHomepage();
				break;
			}
		}

		case 13:
		case VK_ENTER:
			respondEnter();
			break;
		case VK_HOME:
        {
            if(top.appOpenFlag == 1)
            {
                var appname = top.g_setting.getProperty("app.ui.currentApp","tbrowser.mmh");
                top.scheduleApp = top.SCHEDULE_HOMEPAGE;
                top.g_ulits.closeApplication(appname);
                return;
            }
            else
            {
                xmlhttp.abort();
                if (top.enableUpdateScreen)
                {
                    top.enableUpdateScreen(false);
                }
                window.location = top.getHomepage();
            }
            break;
        }
        case VK_EXIT:
            delete sessionStorage.tabListIndex;//删除launcher记忆的tab
            //tcl.channel.inputSource = top.lastInputSource;
            tcl.setting.sendMsgToDBC(4);
            top.jumpPage(1);
            if(top.g_isDownloading == 0)
            {
                top.g_isDownloading = 1;
                tcl.setting.restartDownloadUpdateFile();
            }
            break;
        case VK_POWER://power
        case VK_NETFLIX:
        case VK_YOUTUBE:
        case VK_INTERNET:
        case VK_PANEL_LONG_OK:
        case VK_PANEL_OK:
        case VK_PANEL_LEFT:
        case VK_PANEL_RIGHT:
        case VK_PANEL_DOWN:
        case VK_PANEL_UP:
		case VK_PANEL3_DOWN://按面板左侧键，-,（三键面板）
		case VK_PANEL3_UP://按面板右侧键，+,（三键面板）
		case VK_PANEL3_OK://按面板菜单键,（三键面板）
		case VK_PANEL3_LONG_OK://长按面板菜单键（三键面板）
        case VK_MUTE:
        case VK_FRONT_PANEL_LOCKED:
            top.keyDownProcess(evt);
            break;
        case VK_VOLUME_DOWN:
        case VK_VOLUME_UP:
        case VK_MENU:
        case VK_SOURCE:
            onBodyblur();
            top.keyDownProcess(evt);
            break;
        case VK_TV:
        {
            if(top.appOpenFlag == 1)
            {
                var appname = top.g_setting.getProperty("app.ui.currentApp","tbrowser.mmh");
                top.scheduleApp = top.SCHEDULE_TV;
                top.g_ulits.closeApplication(appname);
            }
            else if(top.g_factory.sourceLock == 1 && top.g_factory.hotelEnable == 1)
            {
                top.keyDownProcess(evt);
            }
            else
            {
                var inputSource=top.g_channel.inputSource;
                tcl.setting.sendMsgToDBC(4);
                if(inputSource <= 1)
                {
                    top.$("operatePage").src = "";
                    top.$("otherPage").src = "";
                    top.g_previousHtmlPage = "channelPlay.html";
                    top.g_remindWord = "TvHotKey";
                    top.$("main").src = "intermediate.html";
                    top.requestFocus(top.main, 1);
                }
                else
                {
                    top.keyDownProcess(evt);
                }
            }
            break;
        }
        default:
            break;	 
	}

	if (keyCode > 352 && keyCode < 379) {
		if (currentFocusId == "Frame") {
			writeString += character[keyCode - 352];
			realKey += character[keyCode - 352];
			document.getElementById("searchText").innerHTML = "<font class='inputString'>" + writeString + "</font>";
		}
	}

	if (keyCode > 47 && keyCode < 58) {
		if (currentFocusId == "Frame") {
			writeString += numericKey[keyCode - 48];
			realKey += numericKey[keyCode - 48];
			
			if (realKey.length < 51) {
				document.getElementById("searchText").innerHTML = "<font class='inputString'>" + writeString + "</font>";
			}
		}
	}
}

function systemEventHandle(evt)
{
    var msg = evt.which;
	var p1 = evt.modifiers;
    console.log("in system receive event "+msg);
    switch (msg)
    {
        case E_APP_CLOSE:
            console.log("in homepage: the app closed");
            tcl.media.setMediaUnmute();
            if (top.scheduleApp == top.SCHEDULE_NETFLIX)
            {
                top.scheduleApp = 0;
                tcl.channel.requestInputSource(10);
				top.g_setting.setProperty("app.ui.currentApp","vod.netflix");
                top.g_ulits.sendMsgToApplication("vod.netflix", 0xF063);
                top.g_ulits.sendMsgToApplication("vod.netflix", 0xF041);
                return;
            }
            else if(top.scheduleApp == top.SCHEDULE_CEC)
            {
                top.scheduleApp = 0;
                top.appOpenFlag = 0;
                console.log("in HOME-E_APP_CLOSE --top.g_channel.inputSource"+top.g_channel.inputSource+"top.lastInputSource="+top.lastInputSource);
                top.tochangeCEC(top.lastInputSource);
                return;
            }
            else if(top.scheduleApp == top.SCHEDULE_YOUTUBE)
            {
                top.scheduleApp = 0;
                tcl.channel.requestInputSource(10);
                top.g_setting.setProperty("app.ui.currentApp","tbrowser.youtube");
                top.g_ulits.openApplication("tbrowser.youtube","https://www.youtube.com/tv?launch=menu&additionalDataUrl=http%3a%2f%2flocalhost%3a56789%2fapps%2fYouTube%2fdial_data");
                return;
            }
            else if(top.scheduleApp == top.SCHEDULE_INTERNET)
            {
                top.scheduleApp = 0;
                tcl.channel.requestInputSource(10);
                top.g_setting.setProperty("app.ui.currentApp","tbrowser.browser");
                top.g_ulits.openApplication("tbrowser.browser","http://eu.guide.huan.tv/huan123/skin/home2015List.action?skin=D1280_2015&data=GBR_mt56#");
                return;
            }
            //top.g_channel.inputSource=top.lastInputSource;
            
            if(top.scheduleApp == top.SCHEDULE_LOCAL_EPG)
            {
                top.scheduleApp = 0;
                top.$("main").onload=function(){
                    top.appOpenFlag = 0;
                    //top.$("main").style.display="block";
                    top.main.document.body.style.display = "block";
                    top.$("operatePage").style.display="block";
                    top.$("otherPage").style.display="block";
                    top.$("globleShow").style.display="block";
                    top.$("main").onload=function(){};
                }
                if(top.isNAFlag)
		{
			top.$("main").src = "programGuide_NA.html";
		}
		else
		{
                top.$("main").src = "programGuide.html";
		}
                return;
            }
            else if (top.scheduleApp == top.SCHEDULE_SETTING)
            {
                top.scheduleApp = 0;
                top.appOpenFlag = 0;
                openSetting();
                //top.$("main").style.display="block";
                top.main.document.body.style.display = "block";
                top.$("operatePage").style.display="block";
                top.$("otherPage").style.display="block";
                top.$("globleShow").style.display="block";
                return;
            }
            else if (top.scheduleApp == top.SCHEDULE_HOMEPAGE)
            {
                top.scheduleApp = 0;
                top.appOpenFlag = 0;
                if (top.enableUpdateScreen)
                {
                    top.enableUpdateScreen(false);
                }
                window.location = top.getHomepage();
                return;
            }
            else if (top.scheduleApp == top.SCHEDULE_SOURCE)
            {
                top.scheduleApp = 0;
                top.appOpenFlag = 0;
                openSource();
                //top.$("main").style.display="block";
                top.main.document.body.style.display = "block";
                top.$("operatePage").style.display="block";
                top.$("otherPage").style.display="block";
                top.$("globleShow").style.display="block";
                return;
            }
            else if (top.scheduleApp == top.SCHEDULE_STR)
            {
                top.scheduleApp = 0;
                top.appOpenFlag = 0;
                top.toPowerOff();
            }
            if(top.scheduleApp == top.SCHEDULE_TV)
            {
                top.scheduleApp = 0;
                top.$("operatePage").src = "";
                top.$("otherPage").src = "";
                top.g_previousHtmlPage = "channelPlay.html";
                top.g_remindWord = "TvHotKey";
                top.$("main").src = "intermediate.html";
                top.requestFocus(top.main, 1);
            }
            
            top.appOpenFlag = 0;
            tcl.setting.contextOf5in1   = top.CONTEXT_HOME_PAGE;
            top.g_ulits.setKeySet(0x1|0x2|0x4|0x8|0x10|0x20|0x40|0x80|0x100|0x200|0x400|0x800,0,2);
            //top.$("main").style.display="block";
            top.main.document.body.style.display = "block";
            top.$("operatePage").style.display="block";
            top.$("otherPage").style.display="block";
            top.$("globleShow").style.display="block";
            //tcl.channel.requestMute(1);
            break;
        case E_POWER_OFF_TIMER:
        case E_DLNA_DMR_PUSH_MOVIE://dmr push movie
        case E_DLNA_DMR_PUSH_MUSIC://dmr push music
        case E_DLNA_DMR_PUSH_PICTURE://dmr push picture	 
        case E_STR_SCREEN_OFF:
        case E_STR_SCREEN_ON:
            top.systemEventProc(evt);
            break;
        case E_MEDIA_USB_INSERTED:
            //top.systemEventProc(evt);
            break;
        case E_PVR_DISK_UNPLUG:
        case E_MEDIA_USB_REMOVE:
        case E_MEDIA_USB_REMOVE_OTHER:
            break;
        case E_NETWORK_CONNECT_TEST_SUCCESS:
        case E_NETWORK_CONNECT_TEST_FAIL:
        case E_WIRE_CONNECT_SUCCESS:
        case E_WIRELESS_CONNECT_SUCCESS:
        case E_WIRE_CONNECT_FAILURE:
        case E_WIRELESS_CONNECT_FAILURE:
        case E_TERMINAL_MANAGER_START:
        case E_TV_FAULT_DIAGNOSIS_CONNECT_ON:
        case E_TV_FAULT_DIAGNOSIS_CONNECT_OFF:
        case E_BOOKING_PLAY_START://booking play start开机时节目预定的时间已过，但是依然要提醒用户做一些切台等操作
        case E_BOOKING_RECORD_START://booking record start开机时录制预定已经过期，但是依然要提醒用户切台录制
        case E_BOOKING_AHEAD_PLAY_START://booking ahead play start,正常情况下切台提醒，一分钟前提醒
        case E_BOOKING_AHEAD_RECORD_START://booking ahead record start正常情况下录制提醒,，一分钟前提醒	
        case E_VOICE_COLLECT_ENTRIES:
        case E_VOICE_CONTROL:
            top.systemEventProc(evt);
            break;
        default:
            break;
    }
}

function jumpToPlayer(secRes,licence_id,vid,title,pic_url,tplid,tab_id,resolution,client_type,launcher_id,dnum,language,zone)
{
	if(top.checkNetStatus()==false)
	{
		top.$("operatePage").src="";
        top.preTempPage = "homePage";
		top.$("otherPage").src="connectNetworkRemind.html";
        top.requestFocus(top.otherPage, 0);
        top.setFrameFocusPage("otherPage");
		top.$("otherPage").style.display = "block";		
        return;
	}
	//var baseUrl = "http://54.255.146.242/api/v2/layout/gethtmlsec?";
	var baseUrl ="player.html?";
	var targetUrl = 
		baseUrl+"secRes="+secRes+"&tplid="+tplid+"&tab_id="+tab_id+"&resolution="+resolution+"&client_type="
		+client_type+"&launcher_id="+launcher_id+"&dnum="+dnum+"&language="+language+"&zone="
		+zone+"&licence_id="+licence_id+"&vid="+vid+"&title="+title+"&pic_url="+pic_url;
	console.log("launcher--generalFun.js---jumpToPlayer---targetUrl: " + targetUrl);
    if (0)
    {
        window.location = (targetUrl);
    }
    else
    {
        setTimeout(function () {
            //tcl.channel.requestMute(0);
        },1000);
        
        top.appOpenFlag = 1;
        top.g_setting.contextOf5in1   = top.CONTEXT_PANEL_OPERATION;
        
        top.g_ulits.setKeySet(0x1|0x2|0x4|0x8|0x10|0x20|0x40|0x80|0x100|0x200|0x800,2,0);
        //top.$("main").style.display="none";
        top.main.document.body.style.display = "none";
        top.$("operatePage").style.display="none";
        top.$("otherPage").style.display="none";
        //tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.youtube");
        top.g_ulits.openApplication("tbrowser.youtube","https://www.youtube.com/tv?launch=menu&additionalDataUrl=http%3a%2f%2flocalhost%3a56789%2fapps%2fYouTube%2fdial_data&v="+vid);
    }
}

function getPopFocus(itemPic, obj)//pop poster 获得焦点  zoomIn and addFoucs frame
{
	//var coverId=obj.getAttribute("id");
	//var cover=document.getElementById(coverId);
	obj.style.left = obj.offsetLeft - 11 + "px";
	obj.style.top = obj.offsetTop - 11 + "px";
	obj.style.backgroundSize = "352px 352px";
	obj.style.height = "352px";
	obj.style.width = "352px";
	itemPic.style.display = "block";
	scrollTitile(obj);

}

function lostPopFocus(itemPic, obj)// 失去焦点 zoomOur and lost Foucs frame
{
	//var coverId=obj.getAttribute("id");
	//var cover=document.getElementById(coverId);
	obj.style.left = obj.offsetLeft + 11 + "px";
	obj.style.top = obj.offsetTop + 11 + "px";
	obj.style.backgroundSize = "330px 330px";
	obj.style.height = "330px";
	obj.style.width = "330px";
	itemPic.style.display = "none";
	displayDllipsisTitle(obj);
}

function getSearchFocus( itemPic)
{
	itemPic.style.display="block";
}

function lostSearchFocus(itemPic)
{
	itemPic.style.display="none";
}

function changeFocus(direction)
{
	//1、得到此item:currentFocusItem
	var currentFocusItem = document.getElementById(currentFocusId);
	if(currentFocusItem.getAttribute(direction)!=-1)//判断移动方向是否还有元素
	{
		//2、得到此item对应的焦点:currentFocusPic
		var currentFocusPicId = currentFocusItem.getAttribute("data-focusId");
		var currentFocusPic=document.getElementById(currentFocusPicId);
		
		if(currentFocusId=="Frame"||currentFocusId=="Button")
		{
			lostSearchFocus(currentFocusPic);
		}
		else
		{
			lostPopFocus(currentFocusPic,currentFocusItem);
		}
		var nextFocusId = currentFocusItem.getAttribute(direction);
		var nextFocusItem = document.getElementById(nextFocusId);
		var nextFocusPicId = nextFocusItem.getAttribute("data-focusId");
		var nextFocusPic=document.getElementById(nextFocusPicId);
		if(nextFocusId=="Frame"||nextFocusId=="Button")
		{
			getSearchFocus(nextFocusPic);
		}
		else
		{
			getPopFocus(nextFocusPic,nextFocusItem);
		}
		currentFocusId = nextFocusId;
	}
}
function inputstate()//鼠标点击获取搜索关键字
{
	if(currentFocusId=="Frame"&&focusField!="keyBoard")
	{
		showKeyBoard();
		focusField="keyBoard"
		writeString=""
		realKey=""
		document.getElementById("searchText").innerHTML=writeString;
	}
}
	
//请求热门热门视频
function getPopVideos()
{		
	if(top.checkNetStatus()!=false)//判断网络
	{
		xmlhttp.onreadystatechange=function()
		{
			if (xmlhttp.readyState == 4 )
			{ 
				if( xmlhttp.status == 200 )
				{
					backInfo=xmlhttp.responseText;
					var dateString =getDate();
					storage.setItem("searchx", dateString+"?"+backInfo); 
					displayPopVideos(backInfo);
				}	
			}
		}
		regionCode = getRegionCode();
		var url="https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&order=viewCount&safeSearch=strict&type=video&regionCode="+regionCode+"&key="+youtubeKey;
		xmlhttp.open("GET",url,true);
		xmlhttp.send();
	}
}

function displayPopVideos(backInfo)// display the pop video
{
	var splitInfo = backInfo;
	var i = 1;
	document.getElementById("popResult").style.display = "block";//显示 popResult 元素
	for (; i <= popVideoNum; i++)//parsed info
	{
		videoId[i] = splitInfo.split('"videoId": "')[1];
		videoId[i] = videoId[i].split('"')[0];
		title[i] = splitInfo.split('"title": "')[1];
		title[i] = title[i].split('",')[0];
		imgURL[i] = splitInfo.split('"high":')[1];
		imgURL[i] = imgURL[i].split('https://')[1];
		imgURL[i] = imgURL[i].split('"')[0];
		splitInfo = splitInfo.split(imgURL[i])[1];
		imgURL[i] = "https://" + imgURL[i];
		document.getElementById("pop" + i).style.backgroundImage = "url(" + imgURL[i] + ")";
		document.getElementById("pop" + i).style.backgroundSize = "330px 330px";
		//document.getElementById("pop" + i).style.backgroundPosition = "0px -55px";
		document.getElementById("pop" + i).onclick = function () {
			click(this.id , this.getAttribute('data-focusid'));
			var videoLocation = this.id.substring(3,this.id.length);
			getHistoryData("41",videoId[videoLocation],title[videoLocation], imgURL[videoLocation]);
			jumpToPlayer("player", "41", videoId[videoLocation], title[videoLocation], imgURL[videoLocation], '865', '4440', '1080P', 'THOM-EU-MT56-S2', '432h14l32h14', '19831111', 'en', 'hk');
			var ids=getIds();
			actionFive_Click_next('7', ids, title[videoLocation], videoId[videoLocation]);
			actionOne_videoPlayer_next('7', ids, title[videoLocation], videoId[videoLocation]);
		}
		document.getElementById("title" + i).innerHTML = title[i];

	}

}

function scrollTitile(obj)
{
	var titleName = obj.getAttribute("id");
	titleName = titleName.substring(3, titleName.length);
	var TitleId = "title" + titleName;
	document.getElementById(TitleId).style.top="310px";
	document.getElementById(TitleId).innerHTML = '<marquee width="310px" align="middle" height="100px" direction="left" scrollamount="10" >' + title[titleName] + '</marquee>';
}

function displayDllipsisTitle(obj)
{
	var titleName = obj.getAttribute("id");
	titleName = titleName.substring(3, titleName.length);
	var TitleId = "title" + titleName;
	document.getElementById(TitleId).style.top="290px";
	document.getElementById(TitleId).innerHTML = '<span>' + title[titleName] + '</span>';
}


function respondEnter()
{
	if (focusField == "pop") 
	{
		var num = currentFocusId.substring(3, currentFocusId.length);// get current Focus item index of info
		getHistoryData("41",videoId[num],title[num], imgURL[num]);
		jumpToPlayer("player", "41", videoId[num], title[num], imgURL[num], '865', '4440', '1080P', 'THOM-EU-MT56-S2', '432h14l32h14', '19831111', 'en', 'hk');
		var ids=getIds();
		actionFive_Click_next('7', ids, title[num], videoId[num]);	
		actionOne_videoPlayer_next('7', ids, title[num], videoId[num]);
	}
	else if (currentFocusId == "Button" && focusField == "Frame") 
	{
		xmlhttp.abort();
		jumpTOsearchResult();
	}
	else if (currentFocusId == "Frame" && focusField != "keyBoard")
	{
		showKeyBoard();
		focusField = "keyBoard"
	}
	else if (currentFocusId == "Frame" && focusField == "keyBoard")
	{
		key = toOkGetChar();
		if (key == "back" && key.length > 0)
		{
			writeString = writeString.substring(0, (writeString.length - 1));
			realKey = realKey.substring(0, (realKey.length - 1));
		}
		else if (key == "!one") 
		{
			if (positionH == 3) 
			{
				hiddenKeyBoard();
				focusField = "Frame";
			}
		}
		else if (key == "shift" || key == "symPage1" || key == "symPage2" || key == "changeChar" || key == "changeLang" || key == "setting")
		{
			return;
		}
		else 
		{
			if (key == " ") 
			{
				writeString += "&nbsp"
				realKey += " "	
			}
			else
			{
				writeString += key;
				realKey += key;
			}
		}
		if (realKey.length < 51) 
		{
			document.getElementById("searchText").innerHTML = "<font class='inputString'>" + writeString + "</font>";
		}
	}
}

function search()
{
	var currentFocusItem = document.getElementById(currentFocusId);
	var currentFocusPicId = currentFocusItem.getAttribute("data-focusId");
	var currentFocusPic=document.getElementById(currentFocusPicId);
	if(currentFocusId=="Frame"||currentFocusId=="Button")
	{
		lostSearchFocus(currentFocusPic);
	}
	else
	{
		lostPopFocus(currentFocusPic,currentFocusItem);
	}
	var FocusPic = document.getElementById("focusPicSearchButton");
	var FocusItem = document.getElementById("Button");
	getSearchFocus(FocusPic);
	jumpTOsearchResult();
}

function getDate()
{
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth();
	var day = date.getDate();
	var toDay= month+"-"+day+"-"+year;
	return toDay;
}

function checkRefreshDay(lastDate)
{
	var toDay= getDate();
	if(toDay == lastDate ) return true;
	else return false;
}
function escapeString(key)
{
	var urlString = escape(key)
	//urlString=urlString.replace(urlString,"+","%2B");
	return urlString;
}

function getIds()
{
    var ids = ""
    var idsURL = document.URL;
    var start = idsURL.indexOf("&ids=");
    var end = idsURL.indexOf("&",start+1);
    if(end == -1)
	{
		end = idsURL.length;
	}
    ids=idsURL.substring(start+5,end);
    return ids;
}

function getRegionCode()
{
//	var regionCode = top.getTimeZone();
	if( regionCode == undefined)
		regionCode = 'FR';
	return regionCode;
}

function click(nextFocusId,itemPic)
{
	var currentFocusItem = document.getElementById(currentFocusId);
	var currentFocusPicId = currentFocusItem.getAttribute("data-focusId");
	var currentFocusPic=document.getElementById(currentFocusPicId);
	if(currentFocusId=="Frame"||currentFocusId=="Button")
		{
			lostSearchFocus(currentFocusPic);
		}
		else
		{
			lostPopFocus(currentFocusPic,currentFocusItem);
		}
	
	var nextFocus = document.getElementById(nextFocusId);
	var nextFocusPic=document.getElementById(itemPic);
	getPopFocus(nextFocusPic, nextFocus);
	currentFocusId = nextFocusId;
}

function jumpTOsearchResult()
{
	var url= decodeURIComponent(location.href);
	
	var para = getParameter("secRes",url);
	var secRes = para.split("=")[1]; 
	
	para = getParameter("tplid",url);
	var tplid = para.split("=")[1]; 
	
	para = getParameter("tab_id",url);
	var tab_id = para.split("=")[1]; 
	
	para = getParameter("resolution",url);
	var resolution = para.split("=")[1];
	
	para = getParameter("client_type",url);
	var client_type = para.split("=")[1];
	
	para = getParameter("launcher_id",url);
	var launcher_id = para.split("=")[1]; 
	
	para = getParameter("dnum",url);
	var dnum = para.split("=")[1]; 
	
	para = getParameter("language",url);
	var language = para.split("=")[1];
	
	para = getParameter("zone",url);
	var zone = para.split("=")[1]; 
	
	window.location.href = targetUrl + searchKey;
	var searchKey = escapeString(realKey);
	//var baseUrl = "./gethtmlsec?";
	var baseUrl ="searchresult.html?";
	var targetUrl = 
		baseUrl+"secRes="+secRes+"&tplid="+tplid+"&tab_id="+tab_id+"&resolution="+resolution+"&client_type="
		+client_type+"&launcher_id="+launcher_id+"&dnum="+dnum+"&language="+language+"&zone="
		+zone+"&searchKey="+searchKey;
	console.log("search-----jumpTosearchResult---targetUrl: " + targetUrl);
	window.location = (targetUrl);
	console.log("------------------------------searchKey------------"+searchKey);
    sessionStorage.removeItem("searchAddress");
    sessionStorage.setItem("searchAddress" , url);
		
}


function getParameter(paraStr, url){   
    var result = "";     //获取URL中全部参数列表数据
    var str = "&" + url.split("?")[1];   
    var paraName = paraStr + "=";    //判断要获取的参数是否存在
    if(str.indexOf("&"+paraName)!=-1)
    {        
        //如果要获取的参数到结尾是否还包含“&”        
        if(str.substring(str.indexOf(paraName),str.length).indexOf("&")!=-1)
        {
            //得到要获取的参数到结尾的字符串          
            var TmpStr=str.substring(str.indexOf(paraName),str.length);            //截取从参数开始到最近的“&”出现位置间的字符            
            result=TmpStr.substr(TmpStr.indexOf(paraName),TmpStr.indexOf("&")-TmpStr.indexOf(paraName));           
        }         
        else        
        {              
            result=str.substring(str.indexOf(paraName),str.length);         
        }   
			  
    }      
    else
    {        
        result="无此参数";      
    }      
    return (result.replace("&",""));
}






//get history
var json;
function supportLocalStorage()
{
	try{
	
		if(!!window.localStorage)return window.localStorage;
	}
	catch(e)
	{
		return undefined;
	}
}
 //delete last one
 function delLastOne()
  { 
      var n=json.historyItem.length;
	  if(n>25000)
	  {
	    json.historyItem.splice(n-1,1);
	  }
	  return json;
  }

//delete again data
function delSecond(id)
{

	for(var k=0;k<json.historyItem.length;k++)
	{
		if(json.historyItem[k].vid==id)
		{
			json.historyItem.splice(k,1);
		}
	}
	return json;
}
function getHistoryData(licenceId,vid,titleValue,urlImageValue)
{   // get localStorage history 
      //localStorage.clear();
	var historyData;
	if(supportLocalStorage())
	{
		json=JSON.parse(localStorage.getItem("history"));
	}
	else
	{
		console.log("不支持localStorage");
	}
	//get  now  history data
	var myDate = new Date(); 
	var year=myDate.getFullYear();;
	var month=RunTime(myDate.getMonth()+1,2);
	var day=RunTime(myDate.getDate(),2);
	var source = "YouTube";
	if(licenceId == "41")//if youtube
	{
        source = "YouTube";
	}
	else if(licenceId == "42")
	{
        source = "goLive";
	}
    else if(licenceId == "43")
	{
        source = "sbs";
	}
    
    historyData={"year": year,
    "month": month,
    "day": day,
    "source": licenceId,
    "vid":vid,
    "title": titleValue,
    "url": urlImageValue,
    "totaltime": "5",
    "playtime": "3"
    };
	//delete push
	if(json)
	{
		json=delSecond(vid);
		json= delLastOne();
		json.historyItem.unshift(historyData);
	}
	else
	{
		json={ "historyItem": []};
		json.historyItem.push(historyData);
	}
	var strHis=JSON.stringify(json);
	if(supportLocalStorage())
	{
	     try{
		    localStorage.setItem("history",strHis);
			console.log(strHis);
		}catch(e)
		{
		   if(e==QUOTA_EXCEEDED_ERR)
		   {     
		        console.log('Storage capacity');
		        /*json=JSON.parse(strHis);
				 var n=json.historyItem.length;
	           json.historyItem.splice(n-1,1);
				strHis=JSON.stringify(json);
				localStorage.setItem("history",strHis);*/
		   }
		}
	}
	else
	{
		console.log("不支持localStorage");
	}
} 
function RunTime(num, n)
{
    var len = num.toString().length;
    while(len<n)
    {
        num = "0" + num;
        len++;	
    }
    return num;
}


function onBodyblur()
{
     if( top.appOpenFlag != 1)//起开应用的时候就不进行焦点的消失
     {
        var currentFocusItem = document.getElementById(currentFocusId);
        var currentFocusPicId = currentFocusItem.getAttribute("data-focusId");
        var currentFocusPic=document.getElementById(currentFocusPicId);
        if(currentFocusId=="Frame"||currentFocusId=="Button")
        {
            lostSearchFocus(currentFocusPic);
        }
        else
        {
            lostPopFocus(currentFocusPic,currentFocusItem);
        }
    }
}

function onBodyFocus()
{   
    if(  top.appOpenFlag != 1)
    {
        var currentFocusItem = document.getElementById(currentFocusId);
        var currentFocusPicId = currentFocusItem.getAttribute("data-focusId");
        var currentFocusPic=document.getElementById(currentFocusPicId);
        if(currentFocusId=="Frame"||currentFocusId=="Button")
        {
            getSearchFocus(currentFocusPic);
        }
        else
        {
            getPopFocus(currentFocusPic,currentFocusItem);
        }
        
        }
}