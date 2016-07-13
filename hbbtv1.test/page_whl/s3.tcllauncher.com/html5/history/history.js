var tempId = "history_0_0";//当前获得focus的id
var DelID = "delOne";//删除的模式
var divRow = 0;//poster的行
var pageNumber = 0;//当前页数
var barBackLength = 496;
var pageTotalNumber;//历史记录总页数
var enterType = 1;//enter按键响应 类型
var backToDB;//要写入存储文件的数据
var backInfo = "";//从存储文件读出的数据
var key = "history.ini";//存储文件名
var NumofHistory = 0;//历史记录的条数
var historyState = "normal";//poster 的播放或删除状态   normal del choose
var storage = window.localStorage;
var tempName;//记录每次获得焦点海报的名字
var rowExcursion = 0;//每一行的翻页次数
var dayDivDownMove = 0;//div每次移动的下移距离
var historyPageWords = [top.historyPageWords[0],top.historyPageWords[1],top.historyPageWords[2],top.historyPageWords[3],top.historyPageWords[4],top.historyPageWords[5],top.historyPageWords[6],top.historyPageWords[7],top.historyPageWords[8]];


document.onkeydown=keyProcess;
function init()
{
    if (tcl.channel.inputSource != 10)
    {
        tcl.channel.requestInputSource(10);
    }
    setTimeout(function (){
        tcl.channel.requestMute(0);
    },500);
    
    initNotice();// init notice Words
    backInfo = storage.getItem("history");
    if (backInfo == null || backInfo == "" )
    {
        blankNotice();
    }
    else
    {
        document.getElementById("rightNotice").style.display = "block";
        getData();
    }
	
    top.g_temp="homePage";
}

function $( id )
{
	return document.getElementById(id);
}

//按键事件
document.onsystemevent = systemEventHandle;
function keyProcess(evt)
{
    var keycode = evt.which;
    var row=computeRow(tempId);
    var columns=computeColumns(tempId);
    switch(keycode)
    {
        case 38: //up
        case VK_UP:
            moveUp();
            break;
        case 40: //down
        case VK_DOWN:
            moveDown();
            break;
        case 37: //left
        case VK_LEFT:
            moveLeft();
            break;
        case 39: //right
        case VK_RIGHT:
            moveRight();
            break;
        case VK_OPTION://menu
			optionResponse();
            break;
        case 13://enter
        case VK_ENTER:
            enterResponse();
            break;
        case 8://back
        case VK_BACK:
            backResponse();
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
        case VK_MUTE:
        case VK_FRONT_PANEL_LOCKED:
            top.keyDownProcess(evt);
            break;
        case VK_VOLUME_DOWN:
        case VK_VOLUME_UP:
        case VK_MENU:
        //case VK_SOURCE:
            getblur();
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
            onBodyBlur();
            break;
        }
        default:
            break;
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

function getData()// load info from localstorage
{
    if (storage.getItem("history") != null)
    {
        backInfo = eval("(" + backInfo + ")");
        if (backInfo.historyItem == null ||  backInfo.historyItem == undefined )
        {
            blankNotice();
        }
        else
        {
            pageTotalNumber=getPageTotalNumber();
            loadHistroy(backInfo);
        }
    }
    else
    {
        blankNotice();
    }
}

function sameDay(videoWatchmonth,videoWatchDay,videoWatchYear,divRow)//检查两个日期是否是一致的
{
    var nextVideoWatchYear=backInfo.historyItem[divRow].year;
    var	nextVideoWatchmonth=backInfo.historyItem[divRow].month;
    var	nextVideoWatchDay=backInfo.historyItem[divRow].day;
    if(nextVideoWatchYear==videoWatchYear&&nextVideoWatchDay==videoWatchDay&&nextVideoWatchmonth==videoWatchmonth)
    {
        return true;
    }

    else
    {
        return false;
    }

}


/*function changePageBar(direction)//移动右边的页码条
 {
 var pageBar = document.getElementById("pageBar");
 var pageBarBackground = document.getElementById("pageBarBackground");
 pageNumber += direction;
 pageBar.style.top = pageBarBackground.offsetTop + ((barBackLength * pageNumber) / (pageTotalNumber)) + "px";
 }*/

function transDate(videoWatchmonth, videoWatchDay, videoWatchYear)//转换日期
{
    var currentDay = new Date();
    var currentYear = new Date();
    var currentMonth = new Date();
    var result = "general";
    if ((Number(videoWatchmonth) - 1) == currentMonth.getMonth() && videoWatchDay == currentDay.getDate() && videoWatchYear == currentYear.getFullYear())
    {
        result = historyPageWords[6];
        return result;
    }
    else if ((Number(videoWatchmonth) - 1) == currentMonth.getMonth() && (Number(videoWatchDay) + 1) == currentDay.getDate() && videoWatchYear == currentYear.getFullYear())
    {
        result = historyPageWords[5];
        return result;
    }
    else return result;

}

function delPage()// display 删除方式页面
{
    var delPage = document.getElementById("delPageBackgroudn");
    delPage.style.display = "block";
    delPage.style.background = "#888";
    delPage.style.opacity = "0.6";
    delPage.style.zIndex = "100";
    delType();
    
    
    DelID = "delOne";
    var preOption = document.getElementById(DelID);//del button
    preOption.setAttribute("class", "delOneCss_focus");
    
    preOption.innerHTML = '<font color="#ffffff" >'+historyPageWords[3]+'</font>';
    var rightNotice = document.getElementById("rightNotice");
    rightNotice.style.display = "none";
	document.getElementById("buttonImg").style.display = "none";
    historyState = "choose";//切换按键函数

}

function cancelDelPage()//取消删除页面状态
{
    var delPage = document.getElementById("delPageBackgroudn");
    delPage.style.display = "none";
    var Option = document.getElementById(DelID);
    if(DelID=="delALL")
    {
    	Option.setAttribute("class", "delALLCss");
    }
    else
    {
    	Option.setAttribute("class", "delOneCss");
    }
    cancelDelType();

}

function delType()//显示删除选项页面
{
    var delType = document.getElementById("delOptions");
    delType.style.display = "block";
    delType.style.zIndex = "1001";
}

function cancelDelType()//取消删除选项页面
{
    var delType = document.getElementById("delOptions");
    delType.style.display = "none";
}



function delAllData(state)//删除所有数据
{
    var parent = document.getElementById("history");
    while (parent.hasChildNodes())//循环删除所有子节点
    {
        parent.removeChild(parent.firstChild);
    }
    backInfo = null;//数据存成空
    cancelDelPage();
    if( state == 1)
    {
        delAllNotice();
    }
    // var pageBar = document.getElementById("pageBar");//页码条消失
    //  pageBar.style.display = "none";
    // var pageBar = document.getElementById("pageBarBackground");
    var timeAxis = document.getElementById("timeAxis");
    //pageBar.style.display = "none";
    timeAxis.style.display = "none";
    backToDB = backInfo;
    storage.removeItem("history");
    historyState = "normal";

}

function delAllNotice()
{
    if( document.getElementById("blankNotice").style.display != "block")
    {
        var delType = document.getElementById("delNotice");
        delType.style.display = "block";
        var delNoticeWords = $("delNoticeWords");
        var noticeWordsWidth =delNoticeWords.offsetWidth;
        if( noticeWordsWidth >610)
        {
            delNoticeWords.innerHTML = '<marquee width="600px" align="middle" height="100px" direction="left" scrollamount="10" top="800px">'+historyPageWords[8]+'</marquee>';
        }
        window.setTimeout(changeNoticeType,15000);
    }

}

function changeNoticeType()
{
    var delType = document.getElementById("delNotice");
    delType.style.display = "none";
    blankNotice();
}


function delOneData() //删除单个数据
{
    cancelDelPage();
    var parent = document.getElementsByClassName("delImgItem");
    var imgNum = parent.length - 1;
    while (imgNum >= 0)//显示图片右上角x图标
    {
        parent[imgNum].style.display = "inline";
        imgNum--;
    }
}

function loadHistroy(backInfo)//加载历史数据
{
    var splitInfo;//每一条历史记录的信息
    var videoId;
    var videoName;
    var videoSource;//来源
    var videoWatchYear;
    var videoWatchmonth;
    var videoWatchDay;
    var videoPic;
    var videoPercent;
    var itemLeftMove = 10; //item 每次移动的左移距离
    var divColumn = 0;
    while (backInfo.historyItem[NumofHistory] != undefined)
    {
        if( backInfo.historyItem[NumofHistory].totaltime == 0 || backInfo.historyItem[NumofHistory].title == undefined )
        {
            delErrMovie(NumofHistory);
            continue;
        }
        var sameDayJudge = sameDay(videoWatchmonth, videoWatchDay, videoWatchYear, NumofHistory);
        videoWatchYear = backInfo.historyItem[NumofHistory].year;
        videoWatchmonth = backInfo.historyItem[NumofHistory].month;
        videoWatchDay = backInfo.historyItem[NumofHistory].day;
        videoSource = backInfo.historyItem[NumofHistory].source;
        videoId = backInfo.historyItem[NumofHistory].vid;
        videoName = backInfo.historyItem[NumofHistory].title;
        videoPic = backInfo.historyItem[NumofHistory].url;
        var totaltime = backInfo.historyItem[NumofHistory].totaltime;
        var playtime = backInfo.historyItem[NumofHistory].playtime;
        videoPercent = playtime / totaltime;
        var divId = videoWatchYear + "." + videoWatchmonth + "." + videoWatchDay;
        var parent;
        var overdue = checkOutTime(videoWatchmonth, videoWatchDay, videoWatchYear);//检查日期是否超过30天
        if (overdue == 1 )
        {
		var delNum = backInfo.historyItem.length- NumofHistory
		backInfo.historyItem.splice(NumofHistory, delNum);
		backInfo = JSON.stringify(backInfo);
		storage.setItem("history", backInfo);
		backInfo = eval("(" + backInfo + ")");
        break;
        }
        if (NumofHistory == 0 || sameDayJudge == false)//判断是否新起一行
        {
            parent = document.getElementById("history");//播放日期显示
            var dayDiv = document.createElement("div");
            dayDiv.setAttribute("id", divId);
            dayDiv.style.position = "absolute";
            dayDiv.style.top = dayDivDownMove + "px"
            parent.appendChild(dayDiv);

            parent = document.getElementById(divId);
            var span = document.createElement("span");
            span.setAttribute("class", "date")
            parent.appendChild(span);
            var displayTime = videoWatchDay + "." + videoWatchmonth + "." + videoWatchYear;
            span.innerHTML = displayTime;
            if (divRow < 2)
            {
                var transDateResult = transDate(videoWatchmonth, videoWatchDay, videoWatchYear);
                if (transDateResult != "general")
                {
                    span.innerHTML = transDateResult;
                }
            }
            parent = document.getElementById(divId);//时间线
            var sliderDiv = document.createElement("div");
            sliderDiv.setAttribute("class", "sliderDiv");
            parent.appendChild(sliderDiv);


            var img = document.createElement("img");
            img.setAttribute("src", "http://s3.tcllauncher.com/html5/images/TimelinePoint.png?md5=dcb7f79cf5c83901d981803f4f5f9111");
            sliderDiv.appendChild(img);

            parent = document.getElementById(divId);//每行海报父元素
            var picDiv = document.createElement("div");
            picDiv.setAttribute("id", divId + "history");
            picDiv.setAttribute("class", "historyLocation");
            parent.appendChild(picDiv);

            var picDivAll = document.createElement("div");
            picDivAll.setAttribute("id", divRow + "history");
            picDivAll.setAttribute("class", "historyAll");
            picDiv.appendChild(picDivAll);

            itemLeftMove = 1;
            dayDivDownMove += 430;
            divRow++;
            divColumn = 0;
        }
        parent = document.getElementById((divRow - 1) + "history");
        var itemDiv = document.createElement("div");
        var id = "history" + "_" + (divRow - 1) + "_" + (divColumn++);
        itemDiv.setAttribute("id", id);
        itemDiv.setAttribute("tabindex", "0");
        itemDiv.setAttribute("class", "itemDiv");
        itemDiv.dataset.vId = videoId;
        itemDiv.dataset.vPic = videoPic;
        itemDiv.dataset.vName = videoName;
        itemDiv.dataset.vSource = videoSource;
        itemDiv.onclick = function ()
        {
		getblur();
		tempId = this.id;
		getfocus();
		if (historyState == "normal")
		{
			playVideo();
		}
		else if(historyState == "del") //在 delone 状态，enter为删除
		{
			delMovies();
		}		
        }
        itemDiv.style.left = itemLeftMove + "px";
        itemLeftMove += 350;
        parent.appendChild(itemDiv);

        var divReal = document.createElement("div")//海报图片
        divReal.setAttribute("class", "defaultPic");
        divReal.style.backgroundImage = 'url(http://s3.tcllauncher.com/html5/images/video-Default.png?md5=6ca6fb51722a4c79f613dcdbe20cf9c5)';
        itemDiv.appendChild(divReal);

        var div = document.createElement("div")//海报图片
        div.setAttribute("class", "posterPic");
        div.style.backgroundImage = 'url(' + videoPic + ')';
        itemDiv.appendChild(div);

        img = document.createElement("img");//海报右上角删除图标
        img.setAttribute("src", "http://s3.tcllauncher.com/html5/images/delete.png?md5=9f6af6b2ccc652fb834b788f646c6774");
        img.setAttribute("class", "delImgItem");
        itemDiv.appendChild(img);

        var span = document.createElement("span");//标题
        span.setAttribute("class", "videoTitle");
        span.setAttribute("id", id + "_videoTitle");
        itemDiv.appendChild(span);
        span.innerHTML = videoName;

        /*  img = document.createElement("img");//进度条背景
         img.setAttribute("id", "progressBarBackground");
         img.setAttribute("src", "http://s3.tcllauncher.com/html5/images/progressbarBackground.png?md5=36c51d7129a7320f721ce5c608adb0d2");
         itemDiv.appendChild(img);

         img = document.createElement("img");//进度条
         img.setAttribute("id", "progressBar");
         img.setAttribute("src", "http://s3.tcllauncher.com/html5/images/progressbar.png?md5=6f2a9f2caa1b9117f8af4aad0d402b61");
         itemDiv.appendChild(img);
         if (isNaN(playtime) || isNaN(totaltime)) {
         img.style.width = "0px";
         }
         else {
         img.style.width = videoPercent * (img.offsetWidth) + "px";
         }*/
        NumofHistory++;
    }
    if(backInfo.historyItem != null || backInfo.historyItem != "")
    {
        getfocus();//最初元素获得焦点
        // if (divRow < 3)//判断总页数
        // {
        //  var pageBar = document.getElementById("pageBar");
        //   pageBar.style.display = "none";
        //  var pageBar = document.getElementById("pageBarBackground");
        //  pageBar.style.display = "none";
        //  }
    }
}


function delMovies()//删除history item 并移动其他item
{
    delInDB();//在存储数据中删除
    var delMovies = document.getElementById(tempId);
    var row = computeRow(tempId);
    var columns = computeColumns(tempId);
    if (delMovies.parentNode.childNodes.length != 1)//当天还有其他记录时候
    {
        var tempItem = document.getElementById(tempId);
        var parent = tempItem.parentNode;
        var childNum = parent.childNodes;
        childNum = childNum.length;
        var movetimes = (Number(childNum)) - (Number(columns)) - 1;
        var times = 1;
        delMovies.parentNode.removeChild(delMovies);
        if (movetimes == 0)//del item 为最后一个
        {
            tempId = "history_" + row + "_" + (Number(columns) - 1);
            if ((columns % 4) == 0)//delitem 为该页最后一个
            {
                var historyDiv = document.getElementById(row + "history");
                historyDiv.style.left = historyDiv.offsetLeft + 1401 + "px"
                rowExcursion--;
            }
        }
        while (movetimes > 0)//依次移动后面的item
        {
            movetimes--;
            var moveItemId = "history_" + row + "_" + (Number(columns) + Number(times));
            var lastItemId = "history_" + row + "_" + (Number(columns) + Number(times) - 1);
            times++;
            var currentItem = document.getElementById(moveItemId);
            currentItem.setAttribute("id", lastItemId);
            currentItem.style.left = currentItem.offsetLeft - 350 + "px";
        }
        getfocus();
    }

    else if (delMovies.parentNode.childNodes.length == 1)//当天无其他记录
    {
        var dateDiv = delMovies.parentNode.parentNode.parentNode;
        var parentDiv = dateDiv.parentNode;
        var childDiv = parentDiv.childNodes;
        var i = 0;
        var movePage = 0;
        while (childDiv[i] != dateDiv)//找到改行的相对位置
        {
            i++;
        }
        if (i <= 3) {
            //  document.getElementById("pageBarBackground").style.display = "none";
            //   document.getElementById("pageBar").style.display = "none";
        }
        if (document.getElementById(tempId).getBoundingClientRect().top < 300)//判断翻页情况
        {
            movePage = 1;
        }
        dateDiv.parentNode.removeChild(dateDiv);
        i++;
        for (; i <= childDiv.length; i++)//移动每一行
        {
            var rowParent = document.getElementById(i + "history");
            var rowChilds = rowParent.childNodes;
            var rowchildNum = rowChilds.length;
            while (rowchildNum > 0) {
                rowChilds[rowchildNum - 1].setAttribute("id", "history_" + (i - 1) + "_" + (rowchildNum - 1));
                rowchildNum--;
            }
            rowParent.setAttribute("id", (i - 1) + "history");
            childDiv[i - 1].style.top = childDiv[i - 1].offsetTop - 430 + "px";
        }
        if (document.getElementById("history_" + row + "_0") != undefined)//判断不为尾行
        {
            pageTotalNumber = Math.ceil((document.getElementById("history").childNodes.length - 1) / 2) - 1;
            tempId = "history_" + row + "_0";
            getfocus();
        }
        else if (document.getElementById("history_" + (Number(row) - 1) + "_0") != undefined)//判断为尾行
        {
            if (pageTotalNumber != Math.ceil((document.getElementById("history").childNodes.length - 1) / 2) - 1)//判断页码是否需要减小
            {
                pageNumber--;
            }
            pageTotalNumber = Math.ceil((document.getElementById("history").childNodes.length - 1) / 2) - 1;
            tempId = "history_" + (Number(row) - 1) + "_0";
            getfocus();

            if (movePage && document.getElementById("history_" + (Number(row) + 1) + "_0") == null)//翻一页
            {
                var historyDiv = document.getElementById("history");
                historyDiv.style.top = historyDiv.offsetTop + 430 + "px";
            }
            else if (i > 2)//翻半页
            {
                var historyDiv = document.getElementById("history");
                historyDiv.style.top = historyDiv.offsetTop + 430 + "px";
            }
        }
    }
}

function delInDB()//在数据库中删除video info
{
    var tempObj  = document.getElementById(tempId);
    var playVideoId = tempObj.dataset.vId;
    var itemSquenceB = 0;
    backInfo = storage.getItem("history");
    backInfo = eval("(" + backInfo + ")");
    while (backInfo.historyItem[itemSquenceB] != undefined)
    {
        if (backInfo.historyItem[itemSquenceB].vid == playVideoId)
        {
            break;
        }
        itemSquenceB++;
    }
    NumofHistory--;
    backInfo.historyItem.splice(itemSquenceB, 1);
    if (backInfo.historyItem == "")
    {
        blankNotice();
        backInfo = null;
        storage.removeItem("history");
    }
    else
    {
        backInfo = JSON.stringify(backInfo);
        storage.setItem("history", backInfo);
        backInfo = eval("(" + backInfo + ")");
    }
}

function checkOutTime(videoWatchmonth, videoWatchDay, videoWatchYear)//检查观看日期是否超过30天
{
    var currentDay = new Date();
    var currentYear = new Date();
    var currentMonth = new Date();
    videoWatchmonth -= 1;
    startDay = new Date(videoWatchYear, videoWatchmonth, videoWatchDay);
    endDay = new Date(currentYear.getFullYear(), currentYear.getMonth(), currentDay.getDate());
    var days = parseInt((endDay - startDay) / 1000 / 60 / 60 / 24)
    var overdue = 0;
    if (days > 30)
    {
        overdue = 1;
    }

    return overdue;

}

function playVideo()//播放影片
{
    var tempObj  = document.getElementById(tempId);
    
    
    var playVideoSor = tempObj.dataset.vSource;//licence_id
    var playVideoId = tempObj.dataset.vId;//影片ID
    var playMovieName = tempObj.dataset.vName;//影片名
    var playVideoPic = tempObj.dataset.vPic;//图片名
    
    getHistoryData(playVideoSor,playVideoId,playMovieName,playVideoPic);
    
    
    jumpToPlayer("player", playVideoSor, playVideoId, playMovieName, playVideoPic);
    console.log("--------------------actionFive_Click_next-----------------");
    var ids=getIds();
    console.log("--------------------actionFive_Click_next--11111---------------"+ids);
    actionFive_Click_next('2', ids, playMovieName, playVideoId);
    actionOne_videoPlayer_next('2', ids, playMovieName, playVideoId);
    console.log("--------------------actionFive_Click_next--11111---------------");

}

function jumpToPlayer(secRes, licence_id, vid, title, pic_url)
{
    if (top.checkNetStatus() == false) 
    {
        top.$("operatePage").src = "";
        top.preTempPage = "homePage";
        top.$("otherPage").src = "connectNetworkRemind.html";
        top.requestFocus(top.otherPage, 0);
        top.setFrameFocusPage("otherPage");
        top.$("otherPage").style.display = "block";
        return;
    }
    
    console.log("-licence_id-"+licence_id);
    
    if(licence_id =="41")//youtube
    {
    	console.log("----youtube------");
        setTimeout(function () { //tcl.channel.requestMute(0);
        },1000);

        top.appOpenFlag = 1;
        top.g_setting.contextOf5in1   = top.CONTEXT_PANEL_OPERATION;
        top.g_ulits.setKeySet(0x1|0x2|0x4|0x8|0x10|0x20|0x40|0x80|0x100|0x200|0x800,2,0);
        
        top.main.document.body.style.display = "none";
        top.$("operatePage").style.display="none";
        top.$("otherPage").style.display="none";
        
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.youtube");
        top.g_ulits.openApplication("tbrowser.youtube","https://www.youtube.com/tv?launch=menu&additionalDataUrl=http%3a%2f%2flocalhost%3a56789%2fapps%2fYouTube%2fdial_data&v="+vid);
    }
    else if(licence_id == "42")//golive
    {
    	
    	if(top.checkNetStatus()==false)
    	{
    		top.$("operatePage").src="";
            top.preTempPage = "homePage";
    		top.$("otherPage").src="connectNetworkRemind.html";
            top.requestFocus(top.otherPage, 0);
            top.setFrameFocusPage("otherPage");
    		top.$("otherPage").style.display = "block";
            parent.onBodyBlur();
            return;
    	}

    	top.g_setting.scaleVideoWindow(0,0,0,0);
        sessionStorage.pipWindow = 0;
        //if (appName == "mmh")
        {
            setTimeout(function () {
                tcl.channel.requestMute(0);
            },1000);
        }
    	
    	top.appOpenFlag = 1;
    	top.g_setting.contextOf5in1   = top.CONTEXT_PANEL_OPERATION;
    	top.g_ulits.setKeySet(0x1|0x2|0x4|0x8|0x10|0x20|0x40|0x80|0x100|0x200|0x800,2,0);
        
    	top.main.document.body.style.display = "none";
    	top.$("operatePage").style.display="none";
    	top.$("otherPage").style.display="none";
    	
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.golive");
        top.g_ulits.openApplication("tbrowser.golive","http://tv.gole.tv/index.php?"+vid);
    	
    }
    else if(licence_id == "43")//sbs
    {
    	var baseUrl ="player.html?";
        var targetUrl = baseUrl + "&licence_id=" + licence_id + "&vid=" + vid + "&title=" + title + "&pic_url=" + pic_url;

        window.location = (targetUrl);
        console.log("launcher--history.js---jumpToPlayer---targetUrl: " + targetUrl);
    }
}

function displayDllipsisTitle(TitleId)//缩略显示videoname
{
    var MovieName = document.getElementById(tempId);
    var child = MovieName.childNodes;
    var childSequence = child.length - 1;
    var tempBackInfo;
    var playVideoId;
    for (; childSequence > 0; childSequence--)
    {
        var className = child[childSequence].getAttribute("class");
        if (className == "videoTitle") break;
    }
    var name = child[childSequence].innerHTML;
    child[childSequence].innerHTML = tempName;
}

function scrollTitile(tempId)//滚动显示videoname
{
    var MovieName = document.getElementById(tempId);
    var child = MovieName.childNodes;
    var childSequence = child.length - 1;
    var tempBackInfo;
    var playVideoId;
    for (; childSequence > 0; childSequence--)
    {
        var className = child[childSequence].getAttribute("class");
        if (className == "videoTitle") break;
    }
    var alreadyScroll = child[childSequence].innerHTML.indexOf("marquee");
    if( alreadyScroll == -1)//judge the title whether is scrolling;
    {
        var name = child[childSequence].innerHTML;
        tempName = name;
        if (name.length > 15 )
        {
            child[childSequence].innerHTML = '<marquee width="300px" behavior="scroll" align="middle" height="120px" direction="left" scrollamount="10" >' + name + '</marquee>';;
        }
    }
}

function getfocus()// 获得焦点:添加焦点框，文字滚动
{
    if( NumofHistory != 0 && top.appOpenFlag != 1)
    {
        addFocusFrame();
        scrollTitile(tempId);    
    } 
}

function getblur()// 失去焦点:remove焦点框，文字还原
{
    if(top.appOpenFlag != 1)
    {
        var img = document.getElementById("focusFrame" + tempId);
        if (img)
        {
            img.parentNode.removeChild(img);
            displayDllipsisTitle(tempId);
        }
    }
}

function addFocusFrame()//添加焦点框
{
    if (document.getElementById(("focusFrame" + tempId)) == undefined)
    {
        var picParent = document.getElementById(tempId);
        var img = document.createElement("div");
        img.setAttribute("id", "focusFrame" + tempId);
        img.setAttribute("class", "itemPic");
	try
	{
		picParent.appendChild(img);
	}
        catch (e)
	{
		delAllData(0);
	}
    }
}

function moveUp()
{
    if(historyState == "del" || historyState == "normal")
    {
        var row = computeRow(tempId);
        var columns = computeColumns(tempId);
        if (row != 0) //翻页
        {
            getblur();
            if (document.getElementById(tempId).getBoundingClientRect().top < 300)//获得当前焦点位置判断翻页情况
            {
                var historyDiv = document.getElementById("history");
                /*if (row == 1)
                {
                    historyDiv.style.top = historyDiv.offsetTop + 430 + "px";
                }
                else*/
                {
                    historyDiv.style.top = historyDiv.offsetTop + 430 + "px";
                }
                var direction = -1;
                //  changePageBar(direction);
            }

            if (rowExcursion != 0)//把当前行调整至原位
            {
                var historyDiv = document.getElementById(row + "history");
                historyDiv.style.left = historyDiv.offsetLeft + (Number(rowExcursion) * 1401) + "px"
                rowExcursion = 0;
            }
            tempId = "history_" + (Number(row) - 1) + "_0";//get next item
            getfocus();
        }

    }

}

function moveDown()
{
    if(historyState == "del" || historyState == "normal")
    {
        row = computeRow(tempId);
        columns = computeColumns(tempId);
        if (document.getElementById("history_" + (Number(row) + 1) + "_0") != undefined)//判断下一排是否还有item
        {
            getblur();
            //if (document.getElementById(tempId).getBoundingClientRect().top > 600)//获得当前焦点位置判断翻页情况
            {
                var historyDiv = document.getElementById("history");
                historyDiv.style.top = historyDiv.offsetTop - 430 + "px";
                var direction = 1;
                //   changePageBar(direction);
            }

            if (rowExcursion != 0)//把当前行调整至原位
            {
                var historyDiv = document.getElementById(row + "history");
                historyDiv.style.left = historyDiv.offsetLeft + (Number(rowExcursion) * 1401) + "px"
                rowExcursion = 0;
            }
            tempId = "history_" + (Number(row) + 1) + "_0";	//get next item
            if((Number(row) + 1)%6 == 0)
            {
                loadHistroy(backInfo);
            }
            getfocus();
        }
    }
}

function moveLeft()
{
    if(historyState == "choose")
    {
        delMoveLeft();
    }
    else
    {
        row = computeRow(tempId);
        columns = computeColumns(tempId);
        getblur();
        if (columns > 0)//判断左边item
        {
            tempId = "history_" + row + "_" + (Number(columns) - 1);
            if ((Number(columns)) % 4 == 0)//左右翻页判断
            {
                var historyDiv = document.getElementById(row + "history");
                historyDiv.style.left = historyDiv.offsetLeft + 1401 + "px"
                rowExcursion--;
            }
        }
        else
        {
            var displacement = 0;
            while (document.getElementById("history_" + row + "_" + displacement) != undefined)
            {
                displacement++;
            }
            displacement--;
            tempId = "history_" + row + "_" + (displacement);
            rowExcursion = Math.floor((displacement) / 4)
            var historyDiv = document.getElementById(row + "history");
            historyDiv.style.left = historyDiv.offsetLeft - (Number(rowExcursion) * 1401) + "px"
        }
        getfocus();
    }
}

function moveRight()
{
    if(historyState == "choose")
    {
        delMoveRight();
    }
    else
    {
        row = computeRow(tempId);
        columns = computeColumns(tempId);
        if (document.getElementById("history_" + (row) + "_" + (Number(columns) + 1)) != undefined)//判断右边的item，无需换行
        {
            getblur();
            tempId = "history_" + row + "_" + (Number(columns) + 1);
            if ((Number(columns) + 1) % 4 == 0)//左右翻页
            {
                var historyDiv = document.getElementById(row + "history");
                historyDiv.style.left = historyDiv.offsetLeft - 1401 + "px"
                rowExcursion++;
            }
            getfocus();
        }
        else  //右无item，需要回到左边第一个item
        {
            getblur();
            if (rowExcursion != 0)//当前行归至原位
            {
                var historyDiv = document.getElementById(row + "history");
                historyDiv.style.left = historyDiv.offsetLeft + (Number(rowExcursion) * 1401) + "px"
                rowExcursion = 0;
            }
            tempId = "history_" + (Number(row)) + "_0";//get next item*/
            getfocus();
        }
    }
}

function optionResponse()// respond the option key
{
    if(document.getElementById("blankNotice").style.display == "none" && document.getElementById("delNotice").style.display == "none")
	{    
		if(document.getElementById("delPageBackgroudn").style.display == "block")
		{
			var parent = document.getElementsByClassName("delImgItem");
			var imgNum = parent.length - 1;
			while (imgNum >= 0)
			{
				parent[imgNum].style.display = "none";
				imgNum--;
			}
			historyState = "normal";
			var rightNotice = document.getElementById("rightNotice");
			rightNotice.style.display = "block";
			document.getElementById("buttonImg").style.display = "inline";
			cancelDelPage();
            getfocus();
		}
		else
		{ 
            getblur();
			delPage();
            
		}
	}
}


function enterResponse()//响应ok键
{
    if (historyState == "normal") 
    {
        playVideo();
    }
    else if(historyState == "del") //在 delone 状态，enter为删除
    {
        delMovies();
    }
    else// choose state
    {
        historyState = "del";
        if (DelID == "delALL")
        {
            delAllData(1);
            var Option = document.getElementById(DelID);
            Option.style.backgroundImage = "url('http://s3.tcllauncher.com/html5/images/unCheckedButton.png?md5=01a81ce104f0ceeba71f744e300a8fe9')";
            //Option.innerHTML='<font color="#aaaaaa" >Delete one</font>';
        }
        else
        {
            delOneData();
        }
         getfocus();
    }

}

function backResponse()//响应返回键
{
    if (historyState == "normal" || document.getElementById("blankNotice").style.display == "block")
    {
        if (top.enableUpdateScreen)
        {
            top.enableUpdateScreen(false);
        }
        window.location = top.getHomepage();
    }

    else//删除状态下 返回normal状态
    {
        var parent = document.getElementsByClassName("delImgItem");
        var imgNum = parent.length - 1;
        while (imgNum >= 0)
        {
            parent[imgNum].style.display = "none";
            imgNum--;
        }
         if( historyState == "choose")
        {
            getfocus();
        }
        historyState = "normal";
        var delPage = document.getElementById("rightNotice");
        delPage.style.display = "block";
        document.getElementById("buttonImg").style.display = "inline";
        cancelDelPage();
       
    }
}

function computeRow(id)//计算item行
{
    var row = id.split("_")[1];
    row = row.split("_")[0];
    return row;
}

function computeColumns(id)//计算item列
{
    var columns = id.split("_")[2];
    columns = columns.split("_")[0];
    return columns;
}

function delMoveLeft()
{
    if (DelID == "delOne")
    {
        delLostFocus(historyPageWords[3]);
        DelID = "delALL";
        delGetFocus(historyPageWords[4]);
    }
    else
    {
        delLostFocus(historyPageWords[4]);
        DelID = "delOne";
        delGetFocus(historyPageWords[3]);
    }
}

function delMoveRight()
{
    if (DelID == "delALL")
    {
        delLostFocus(historyPageWords[4]);
        DelID = "delOne";
        delGetFocus(historyPageWords[3]);
    }
    else
    {
        delLostFocus(historyPageWords[3]);
        DelID = "delALL";
        delGetFocus(historyPageWords[4]);
    }
}

function delLostFocus(display)//删除方式button 失去焦点
{
    var Option = document.getElementById(DelID);
    if(DelID=="delALL")
    {
    	Option.setAttribute("class", "delALLCss");
    }
    else
    {
    	Option.setAttribute("class", "delOneCss");
    }
    
    // Option.style.backgroundImage = "url('http://s3.tcllauncher.com/html5/images/unCheckedButton.png?md5=01a81ce104f0ceeba71f744e300a8fe9')";
    Option.innerHTML = '<font color="#aaaaaa" >' + display + '</font>';
}

function delGetFocus(display)//删除方式button 获得焦点
{
    var preOption = document.getElementById(DelID);
    
    if(DelID=="delALL")
    {
    	 preOption.setAttribute("class", "delALLCss_focus");
    }
    else
    {
    	preOption.setAttribute("class", "delOneCss_focus");
    }
    
    preOption.innerHTML = '<font color="#ffffff" >' + display + '</font>';
}

function getIds() //获取ids
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

function getPageTotalNumber()// get the total Number of history video
{
    var num=0;
    while(backInfo.historyItem[num])
    {
        num++;
    }
    return num;
}

function delErrMovie(num)// delete the movies of error information
{
    backInfo.historyItem.splice(num, 1);
    backInfo = JSON.stringify(backInfo);
    storage.setItem("history", backInfo);
    backInfo = eval("(" + backInfo + ")");

    if(backInfo.historyItem == null || backInfo.historyItem == "")
    {
        blankNotice(); 
    }

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

    for(k=0;k<json.historyItem.length;k++)
    {
        if(json.historyItem[k].vid==id)
        {
            json.historyItem.splice(k,1)
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



function mouseOnclick ( delType )//鼠标点击删除类型
{
	 if (delType == "delOne")
    {
        delLostFocus("Delete all");
        DelID = "delOne";
        delGetFocus("Delete one");
    }
    else if (delType == "delALL")
    {
        delLostFocus("Delete one");
        DelID = "delALL";
        delGetFocus("Delete all");
    }
	enterResponse();
}


function initNotice()
{
    var afterPicObj = $("afterPic");
    var beforePicObj = $("beforePic");
    var PicObj = $("buttonImg");
    var noticeWords = $("noticeWords");
    $("pageTitle").innerHTML = historyPageWords[0];
	noticeWords.innerHTML = historyPageWords[7];
	beforePicObj.innerHTML = historyPageWords[1];
	afterPicObj.innerHTML = historyPageWords[2];
	$("delNoticeWords").innerHTML = historyPageWords[8];
	$("delOne").innerHTML = historyPageWords[3];
	$("delALL").innerHTML = historyPageWords[4];
	//$("buttonImg").src = 'http://s3.tcllauncher.com/html5/images/icon-setting.png?md5=21a0511b83a13b13d01091e5d703d42d';  
    
}


function blankNotice()
{
    var PicObj = $("buttonImg");
     var beforePicObj = $("beforePic");
    document.getElementById("blankNotice").style.display = "block";
    document.getElementById("rightNotice").style.display = "none";
    document.getElementById("buttonImg").style.display = "none";
    //document.getElementById("pageBarBackground").style.display = "none";
    //document.getElementById("pageBar").style.display = "none";
    document.getElementById("timeAxis").style.display = "none";
    
    var noticeWords = $("noticeWords");
    var WordsLocation = ( noticeWords.offsetWidth ) / 2;
    WordsLocation =  960 -  WordsLocation  ;
    noticeWords.style.left = WordsLocation +"px";
    
    var afterPicLocation = $("afterPic").offsetWidth;
    PicObj.style.right =  afterPicLocation +10 + "px"
    beforePicObj.style.right = afterPicLocation+80 + "px"
    
}
