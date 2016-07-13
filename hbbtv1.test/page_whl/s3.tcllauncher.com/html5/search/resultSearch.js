var perPageNum=50;//每次加载的数量
var totalResults;//三次加载的总条数
var tempPage = "page0"
var lasthasload = 1;
var totalPages;
var pageNum = 0;
var tempDivId=0;//当前focusItem的id
var pageToken;
var nextPageToken=0;//下一页的token
var recordPageToken=0;
var loadTimes=0;//已经加载的次数
var i=0;
var backResults = 0;
var searchUrl="";
var xmlhttp=new XMLHttpRequest();
var key;//搜索关键词
var pageTotalNumber;
var barPosition=0;//页码位置
var pageNumbers;//最大页数
var title= new Array(perPageNum);//poster名字
var videoId= new Array(perPageNum);
var imgURL= new Array(perPageNum);
var storeBackInfo="";
var storageInfo;
var youtubeKey="AIzaSyDhxJE9_Bs3NF0YNt1OhrDefVvdrfQ8U_8";
var timer;
var regionCode;
var refresh=0; // 0 数据全从storage里拿  1 数据通过ajax拿  2 一部分从storage里拿， 另一部分通过ajax拿
var storage = window.sessionStorage;
var loadingTimer = 0;//loading定时器
var loadingCount = 0;//loading图片下标
var loadingImgs					= [ "http://s3.tcllauncher.com/html5/images/Loading-01.png?md5=67cd62839e5eca44db31601e2cf987dd",
									"http://s3.tcllauncher.com/html5/images/Loading-02.png?md5=d4c50bdef0d34a94fb033ef9f930a46e",
									"http://s3.tcllauncher.com/html5/images/Loading-03.png?md5=cd93bdb87e2fa90ec6df47fc9cef1a86",
									"http://s3.tcllauncher.com/html5/images/Loading-04.png?md5=deb084e74d1d0ed6a437327f31333c9c",
									"http://s3.tcllauncher.com/html5/images/Loading-05.png?md5=3dcfc1b2cf37c139e14ab076f32c6bdf",
									"http://s3.tcllauncher.com/html5/images/Loading-06.png?md5=ef683403de836879a06a63e93e2227e9",
									"http://s3.tcllauncher.com/html5/images/Loading-07.png?md5=eaa504ccfab0a3f560c7a27ab28ec8b8",
									"http://s3.tcllauncher.com/html5/images/Loading-08.png?md5=d05761431a1e67bffd4c25143379efc1"];

var resultSearchPageWords = [top.resultSearchPageWords[0],top.resultSearchPageWords[1],top.resultSearchPageWords[2],top.resultSearchPageWords[3],top.resultSearchPageWords[4]];
								
								
document.onkeydown = keyProcess;
function init()//加载内容启动loading图标
{
    if (tcl.channel.inputSource != 10)
    {
        tcl.channel.requestInputSource(10);
    }
	key= getKey();
  	showResult(0,key,1);
	var storageInfo=storage.getItem("search_info_"+key);// 判断有否当日YouTube  video cache of that key
	if(storageInfo!=null)
	{
		storeBackInfo=storage.getItem("search_content_"+key);// 判断有否当日YouTube  video cache of that key
		storeBackInfo= JSON.parse(storeBackInfo);
		backInfo = storeBackInfo;
		var refreshDay=storageInfo.split("&")[0];// 日期是以？间隔的
		perPageNum = storageInfo.split("&")[1];
		pageToken = storageInfo.split("&")[2];
		totalResults  = storageInfo.split("&")[3];
		if(checkRefreshDay(refreshDay) == false  )// 不是当天的记录
		{
			refresh=1;
			loading();
           		setTimeout(function (){loadSearch(loadTimes);},10);
			setOuttime();
		}
		else if(perPageNum == totalResults)//是当天记录，且加载完全
		{
			if(sessionStorage.getItem("search_location_"+key) != null && sessionStorage.getItem("location_"+key) != "" )
			{
				var locationInfo = sessionStorage.getItem("search_location_" + key);
				var starPage0 = Number(locationInfo.split("&")[2]);
				var starPage1 = Number(locationInfo.split("&")[3]);
				var starPage2 = Number(locationInfo.split("&")[4]);
				var starPage3 = Number(locationInfo.split("&")[5]);
				storeVideoInfo( 0 , 150)
				createDiv(backInfo, starPage0, starPage0+9);
				createDiv(backInfo, starPage1, starPage1+9);
				createDiv(backInfo, starPage2, starPage2+9);
				createDiv(backInfo, starPage3, starPage3+9);
				tempDivId = Number(locationInfo.split("&")[0]);
				tempPage = locationInfo.split("&")[1];
				barPosition++;
				document.getElementById("pageBarBackground").style.display = "block";
				document.getElementById("pageBar").style.display = "block";
				document.getElementById(tempPage).style.display = "block";

				scrollTitile(tempDivId);
				zoomIn();
				//changePagination(tempDivId);
				changePageBar();
				storage.removeItem("location_" + key);
			}
		}

		else//是当天记录但是没有加载完全
		{
			var locationInfo = sessionStorage.getItem("search_location_" + key);
			if(perPageNum <= 50)
			{
				loadTimes = 1;
				refresh = 2;
				setTimeout(function (){loadSearch(++loadTimes);},10);

			}
			else if( perPageNum <= 100 && perPageNum > 50)
			{
				loadTimes = 2;
				refresh = 2;
				setTimeout(function (){loadSearch(++loadTimes);},10);
			}
			else
			{
				loadTimes = 2;
				refresh = 0;
			}
			var starPage0 = Number(locationInfo.split("&")[2]);
			var starPage1 = Number(locationInfo.split("&")[3]);
			var starPage2 = Number(locationInfo.split("&")[4]);
			var starPage3 = Number(locationInfo.split("&")[5]);
			storeVideoInfo( 0 , perPageNum);
			createDiv(backInfo, starPage0, starPage0+9);
			createDiv(backInfo, starPage1, starPage1+9);
			createDiv(backInfo, starPage2, starPage2+9);
			createDiv(backInfo, starPage3, starPage3+9);
			tempDivId = Number(locationInfo.split("&")[0]);
			tempPage = locationInfo.split("&")[1];
			barPosition++;
			document.getElementById("pageBarBackground").style.display = "block";
			document.getElementById("pageBar").style.display = "block";
			document.getElementById(tempPage).style.display = "block";
			scrollTitile(tempDivId);
			zoomIn();
			//changePagination(tempDivId);
			changePageBar();
			storage.removeItem("location_" + key);
		}
	}
	else
	{
		refresh=1;
		setTimeout(function (){loadSearch(loadTimes);},10);
		loading();
		setOuttime()
	}
    top.g_temp="homePage";
}
function loadSearch(loadTimes)
{
    if( document.getElementById("errorNotice").style.display == "block")
    {
        return;
    }
	var backInfo;//video information from youtube
	xmlhttp.onreadystatechange=function()
	{
		if (xmlhttp.readyState == 4)
		{
			if (xmlhttp.status == 200)
			{
				backInfo = xmlhttp.responseText;
				backInfo= JSON.parse(backInfo);
				if( backInfo.pageInfo.totalResults == 0)
				{
					errorNotice();
				}
				else 
				{
					if(loadTimes == 0)
					{
						storeBackInfo = backInfo;
						storeVideoInfo( backResults , (loadTimes+1)*50 );
						createDiv(backInfo, 0, 9);
						createDiv(backInfo, 10, 19);
						createDiv(backInfo, 20, 29);
						createDiv(backInfo, 30, 39);
						document.getElementById("page0").style.display = "block";
						scrollTitile(tempDivId);
						zoomIn();
						pageToken = backInfo.nextPageToken;
						loadTimes++;
					}

					if(loadTimes > 1)
					{
						pageToken = backInfo.nextPageToken;
						var i = 0;
						while(backInfo.items[i])
						{
							storeBackInfo.items.push(backInfo.items[i]);
							i++;
						}
						backInfo = storeBackInfo;
						storeVideoInfo( backResults,(loadTimes)*50 );
					}

					clearTimeout(loadingTimer);
					clearTimeout(timer);
					document.getElementById("loadingPic").style.display = "none";
					
					if( totalResults > 10 )
					{
						document.getElementById("pageBarBackground").style.display = "block";
						document.getElementById("pageBar").style.display = "block";
						changePageBar();
					}
					if(loadTimes <3)
					{
						if( pageToken != null)
						{
							loadSearch(++loadTimes);
						}
						
						

					}
				}
				
			}

			else if( xmlhttp.status != 0 && loadTimes == 0)
			{
				errorNotice();
			}
		}
	}
	regionCode = getRegionCode();
	if(loadTimes==0)
	{
		var url="https://www.googleapis.com/youtube/v3/search?maxResults=50&part=snippet&q="+key+"&type=video&regionCode="+regionCode+"&order=relevance&key="+youtubeKey;
	}

	else
	{
		var url="https://www.googleapis.com/youtube/v3/search?maxResults=50&part=snippet&q="+key+"&pageToken="+pageToken+"&type=video&regionCode="+regionCode+"&order=relevance&key="+youtubeKey;
	}
	console.log(url);
	console.log(url);
	xmlhttp.open("GET",url,true);
	xmlhttp.send();
}

function changeFocus(nextId)
{
	displayDllipsisTitle(tempDivId);
	scrollTitile(nextId);
	zoomOut();
	tempDivId = nextId;
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
            tcl.channel.requestMute(0);
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

/*function changePagination()
{
	if(lasthasload == 1)
	{
		totalPages = backResults;
		showResult(totalPages,key)
	}
	document.getElementById("pageNumber").innerHTML=(Math.floor(tempDivId/10)+1)+"/"+(Math.ceil(totalPages/10));
}*/
function showResult(totalResult,key,error)
{//显示searchKey 以及总的条数
	var showKeyWords=key;
	if(key.length>30)
	{
		showKeyWords=key.substring(0,25)+"..."
	}
    if( error == 0)
    {
        
        document.getElementById("researchResult").innerHTML = resultSearchPageWords[3]+ '"' +showKeyWords+'"'+resultSearchPageWords[4];
        
    }
    else
    {
        //document.getElementById("researchResult").innerHTML='Totally find ' +  '<font color="#c50100">'+ totalResult +'</font>' + ' videos about "' +showKeyWords+'"';
        document.getElementById("researchResult").innerHTML=resultSearchPageWords[0]+ '"' +showKeyWords+'"'+resultSearchPageWords[1];
    }    
}

function createDiv(backInfo , startDiv , endDiv)
{
	var iniStart=startDiv;
	var splitInfo ;
	var preVideoId;
	var preTitle;
	var preImgURL;
	var prePageToken;
	var resultNumber;
	var leftDistance;
	var parent = document.getElementById("contentDiv");
	var div = document.createElement("div");
	var pageId="page" + pageNum++;
	div.setAttribute("id",pageId);
	div.setAttribute("class","page");
	parent.appendChild(div);
	var rowNumber = 0;
	for (;startDiv <= endDiv;startDiv++)
	{
		if( startDiv%5 == 0 )
		{
			var parent = document.getElementById(pageId);
			var div = document.createElement("div");
			var divId="row"+(pageNum-1)+"_"+rowNumber++;
			div.setAttribute("id",divId);
			div.setAttribute("class","row");
			parent.appendChild(div);
			leftDistance=0;
		}
		//create poster
		var parentId="row"+(pageNum-1)+"_"+(rowNumber-1);
		var parent = document.getElementById(parentId);
		var div = document.createElement("div");
		div.setAttribute("class","defaultPoster");
		div.style.backgroundImage = 'url(http://s3.tcllauncher.com/html5/images/video-Default.png?md5=6ca6fb51722a4c79f613dcdbe20cf9c5)';
		div.style.left=leftDistance+"px";
		if( startDiv >= totalResults)
		{
			div.style.display = "none";
		}
		parent.appendChild(div);
		
		
		var parentId="row"+(pageNum-1)+"_"+(rowNumber-1);
		var parent = document.getElementById(parentId);
		var div = document.createElement("div");
		if(startDiv >= totalResults )
		{
			div.style.display = "none";
		}
		div.setAttribute("id",startDiv);
		div.style.position = "absolute";
		div.setAttribute("class","poster");
		div.setAttribute("tabindex",0);
		div.setAttribute("hidefocus","true");
		div.onclick=function()
		{
			changeFocus(this.id);
           		zoomIn();
			getHistoryData("41",videoId[this.id],title[this.id],imgURL[this.id]);
			jumpToPlayer("player","41",videoId[this.id],title[this.id],imgURL[this.id],'865','4440','100P','THOM-EU-MT56-S2','432h14l32h14','19831111','en','hk');
			var ids=getIds();
			actionFive_Click_next('7', ids, title[this.id], videoId[this.id]);
			actionOne_videoPlayer_next('7', ids, title[this.id], videoId[this.id]);
		}
		div.style.backgroundImage = "url("+imgURL[startDiv]+")";
		div.style.left=leftDistance+"px";
		leftDistance+=350;
		div.innerHTML='<div id="videoTitle'+startDiv+'"<span class="videoTitle">'+title[startDiv]+'</span></div>';
		if( startDiv >= totalResults)
		{
			div.style.display = "none";
		}
		parent.appendChild(div);

		//create focusFrame
		parent = document.getElementById(startDiv);
		div = document.createElement("div");
		div.setAttribute("class","focusFrameSearch");
		div.setAttribute("id","back"+startDiv);
		parent.appendChild(div);

	}

}

// two type of displaying the title dllipsis and rolling
function displayDllipsisTitle(id)
{
    if (document.getElementById(id))
    {
        var adiv=document.getElementById(id).getElementsByTagName('div')
        var TitleId=adiv[0].getAttribute('id');
        document.getElementById(TitleId).style.top="290px";
        document.getElementById(TitleId).innerHTML='<span>'+title[id]+'</span>';
    }
}

function scrollTitile(id)
{
	var adiv=document.getElementById(id).getElementsByTagName('div')
	var TitleId=adiv[0].getAttribute('id');
	document.getElementById(TitleId).style.top="310px";
	if(title[id].length > 22)
	{
		document.getElementById(TitleId).innerHTML='<marquee width="310px" align="middle" height="100px" direction="left" scrollamount="10" top="800px">'+title[id]+'</marquee>';
	}
}

//monitor the key up down left and right
document.onsystemevent = systemEventHandle;
function keyProcess(evt)
{
	var keyCode = evt.which;
	switch(keyCode)
	{
        case 38://up
        case VK_UP:
			moveUp();
			break;

        case 40:// down
        case VK_DOWN:
			moveDown();
			break;

        case 37://left
        case VK_LEFT:
			moveLeft();
			break;

        case 39://right
        case VK_RIGHT:
			moveRight()
			break;

        case 8:
        case VK_BACK:
			//clearTimeout(timer);
			//clearTimeout(loadingTimer);
			//xmlhttp.abort();
			storage.removeItem("location_"+key);
            var searchUrl =  sessionStorage.getItem("searchAddress");
            window.location = (searchUrl);
			break;

        case 13:
        case VK_ENTER:
			if( document.getElementById("errorNotice").style.display  == "none" &&  document.getElementById("loadingPic").style.display == "none")
			{
				getHistoryData("41",videoId[tempDivId],title[tempDivId],imgURL[tempDivId]);
				jumpToPlayer("player","41",videoId[tempDivId],title[tempDivId],imgURL[tempDivId],'865','4440','1080P','THOM-EU-MT56-S2','432h14l32h14','19831111','en','hk');
				store();
				var ids=getIds();
				actionFive_Click_next('7', ids, title[tempDivId], videoId[tempDivId]);
				actionOne_videoPlayer_next('7', ids, title[tempDivId], videoId[tempDivId]);
			}
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
                storage.removeItem("location_"+key);
                window.location = top.getHomepage();
            }
            break;
        }
		case VK_EXIT:
			delete sessionStorage.tabListIndex;//删除launcher记忆的tab
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
            onBodyblur();
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

            if(top.scheduleApp == top.SCHEDULE_LOCAL_EPG)
            {
                top.scheduleApp = 0;
                top.$("main").onload=function(){
                    top.appOpenFlag = 0;
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
                top.main.document.body.style.display = "block";
                top.$("operatePage").style.display="block";
                top.$("otherPage").style.display="block";
                top.$("globleShow").style.display="block";
                return;
            }
            else if (top.scheduleApp == top.SCHEDULE_HOMEPAGE)
            {
                top.scheduleApp = 0;
                storage.removeItem("location_"+key);
                top.appOpenFlag = 0;
                window.location = top.getHomepage();
                return;
            }
            else if (top.scheduleApp == top.SCHEDULE_SOURCE)
            {
                top.scheduleApp = 0;
                top.appOpenFlag = 0;
                openSource();
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
            top.main.document.body.style.display = "block";
            top.$("operatePage").style.display="block";
            top.$("otherPage").style.display="block";
            top.$("globleShow").style.display="block";
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
            top.systemEventProc(evt);
            break;
        case E_VOICE_COLLECT_ENTRIES:
        case E_VOICE_CONTROL:
            top.systemEventProc(evt);
            break;
		default:
			break;
	}
}

//zoom in or out the the pic of div ,needs id parameter
function zoomIn()
{
	var item=document.getElementById(tempDivId);
	var itemLeft=document.getElementById(tempDivId).offsetLeft
	var itemTop=document.getElementById(tempDivId).offsetTop
	if(item.style.width !="352px")
	{
		item.style.left=itemLeft-11+"px";
		item.style.top=itemTop-11+"px";
		item.style.backgroundSize = "352px 352px";
		item.style.width="352px";
		item.style.height="352px";
		addRedFrame(tempDivId);
	}
}

function zoomOut()
{
	var item=document.getElementById(tempDivId);
    if (item)
    {
        var itemLeft=document.getElementById(tempDivId).offsetLeft
        var itemTop=document.getElementById(tempDivId).offsetTop
        if(item.style.width !="330px")
        {
            item.style.left=itemLeft+11+"px";
            item.style.top=itemTop+11+"px";
            item.style.backgroundSize = "330px 330px";
            item.style.width="330px";
            item.style.height="330px";
            delRedFrame(tempDivId);
        }
    }
}

// add or del the focus frame (red) ,the basic function the zoom the backimages ,the basic parameter is the div id
function addRedFrame(id)
{
	document.getElementById("back"+id).style.display="block";
}

function delRedFrame(id)
{
	document.getElementById("back"+id).style.display="none";
}

//direction is the the vaule of pageup or pagedown, need the parameter of pagebar and background pic
function changePageBar()
{
	if(lasthasload == 1)
	{
		totalPages = backResults;
	}
	var barBackGround=document.getElementById("pageBarBackground");
	var bar=document.getElementById("pageBar");
	if(Math.ceil(totalPages/10) > 1)
	{
		var barLocation = barBackGround.offsetTop+((Math.floor(tempDivId/10))*(barBackGround.offsetHeight-bar.offsetHeight))/(Math.ceil(totalPages/10)-1);
		if( barLocation < 281 )
		{
			barLocation =281;
		}
		if( barLocation > 777 )
		{
			barLocation =777;
		}
		bar.style.top=barLocation+"px";
	}
	else// pageNumbers less two ，the pageBar will not display
	{
		barBackGround.style.display = "none";
		bar.style.display = "none";
	}
}

//get the transfer value from the url (have return value)
function getKey()
{
	var thisURL=document.URL;
	var start = thisURL.indexOf("searchKey");
	var end = thisURL.indexOf("&",start);
	if(end == -1)
	{
		end = thisURL.length;
	}
	researchKey = thisURL.substring(start+10,end);
	researchKey = unescape(researchKey);
	return researchKey;
}

function loading()
{// loading图标

	document.getElementById("loadingPic").style.display="block";
	document.getElementById("loading").src = loadingImgs[loadingCount%8];
	loadingCount++;
	loadingTimer=setTimeout("loading()",300);
}
function moveUp()
{
	if(tempDivId % 10 < 5)
	{
		var nextId = Number(tempDivId) - 5;
		if (document.getElementById(nextId) != undefined &&document.getElementById(nextId).style.display != "none")
		{
			var nextPage = (Number(tempPage.substring(4, tempPage.length))-1);
			if( nextPage < 0)
			{
				nextPage = 4 + nextPage;
			}
			else nextPage = nextPage % 4;
			nextPage = "page"+nextPage;

			changeFocus(nextId);
			tempDivId=nextId;
			document.getElementById(tempPage).style.display = "none";
			tempPage=nextPage;
			document.getElementById(nextPage).style.display = "block";
			zoomIn();
			changePageBar();
			//changePagination(nextId);
		}
	}
	else
	{
		var nextId = Number(tempDivId) - 5;
		changeFocus(nextId);
		loadPage( -1 );
		tempDivId=nextId;
		zoomIn();
		//changePagination(nextId);
		changePageBar();
	}
}


function moveDown()
{
	if( tempDivId % 10 >4 )
	{
		var nextId = Number(tempDivId) + 5;
		while (document.getElementById(nextId).style.display == "none" && (nextId + 1) % 10 != 0)
		{
			nextId--;
		}
		if ((nextId + 1) % 10 != 0)
		{
			var nextPage = "page" + (Number(tempPage.substring(4, tempPage.length))+1)%4;
			changeFocus(nextId);
			tempDivId=nextId;
			document.getElementById(tempPage).style.display = "none";
			tempPage=nextPage;
			document.getElementById(nextPage).style.display = "block";
			zoomIn();
		}
		//changePagination(nextId);
		changePageBar();

	}
	else if(document.getElementById(Number(tempDivId) + 5).style.display != "none")
	{
		loadPage( 1 );
		var nextId = Number(tempDivId) + 5;
		while (document.getElementById(nextId).style.display == "none" )
		{
			nextId--;
			if( (nextId + 1) % 10 < 5)
			{
				nextId = tempDivId;
				break;
			}
		}
		if( nextId != tempDivId )
		{
			changeFocus(nextId);
			tempDivId=nextId;
			zoomIn();
		}
		//changePagination(nextId);
		changePageBar();
	}
}

function moveLeft()
{
	if(tempDivId < totalResults && tempDivId >= 0)
	{
		if(tempDivId%5 == 0)
		{
			var displacement;
			for(displacement = 4;displacement > 0;displacement--)
			{
				if(document.getElementById((Number(tempDivId)+displacement)).style.display != "none")
				{
					break;
				}
			}
			var nextId=Number(tempDivId) + displacement;
		}
		else
		{
			var nextId=Number(tempDivId)-1;
		}
		if( nextId != tempDivId)
		{
			changeFocus(nextId);
			tempDivId=nextId;
			zoomIn();
		}
	}
}

function moveRight()
{
	if(tempDivId<totalResults)
	{
		var direction=1;
		if((Number(tempDivId)+1)%5 == 0 || document.getElementById(Number(tempDivId)+1).style.display == "none")
		{
			var nextId=Number(tempDivId) - ( Number(tempDivId)%5  );//得到当前行首的位置
		}
		else
		{
			var nextId=Number(tempDivId)+1;
		}
		if( nextId != tempDivId)
		{
			changeFocus(nextId);
			tempDivId=nextId;
			zoomIn();
		}
	}
}

function setOuttime()
{
	timer = setTimeout(function()
	{
		if(xmlhttp.status !=200)
		{
			xmlhttp.abort();
			errorNotice();
		}
	}, 15000);
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


function loadPage( direction )
{
	var pageNum;
	if( direction == 1 )
	{
		pageNum=(Number(tempPage.substring(4, tempPage.length))+2)%4;
	}
	else
	{
		pageNum = (Number(tempPage.substring(4, tempPage.length))-2)
		if( pageNum < 0)
		{
			pageNum = 4 + pageNum;
		}
		else pageNum = pageNum % 4;
	}

	var loadingPage = "page" + pageNum;
	var rowNum = 0;

	for(;rowNum<2;rowNum++)
	{
		if( direction == -1 && tempDivId < 20 ) break;
		var i=0;
		var pageRow = document.getElementById("row"+pageNum+"_"+rowNum);
		var child = pageRow.childNodes[i+i+1];
		var starId = tempDivId;
		while(Number(starId)%5 !=0)
		{
			starId--;
		}
		while(child != undefined && i < 5)
		{
			if(direction == 1)
			{
				var divId = Number(starId) + ( i + 20 + rowNum * 5 );
			}
			else
			{
				var divId = Number(starId)-20 + ( i + rowNum * 5 );
			}

			if(rowNum == 0 && divId >= backResults && direction == 1 && lasthasload == 1 && i == 0)
			{
				lasthasload = loadingPage;
			}

			else if( rowNum == 0 && divId < backResults && lasthasload == loadingPage && direction == 1 && i == 0)
			{
				lasthasload = 1;
			}

			if( divId < backResults)
			{

				child.id=divId;
				child.style.backgroundImage = "url("+imgURL[divId]+")";
				child.childNodes[0].id = "videoTitle"+divId;
				child.childNodes[0].innerHTML = title[divId];
				child.childNodes[1].id = "back"+divId;
				child.style.display = "block";
				pageRow.childNodes[i+i].style.display = "block";

			}
			else
			{
				child.id=divId;
				child.style.display = "none";
				pageRow.childNodes[i+i].style.display = "none";
			}
			i++;
			child = pageRow.childNodes[i+i+1];
		}
	}
}
function storeVideoInfo( num , loadNum )
{
	totalResults = storeBackInfo.pageInfo.totalResults;

	if(totalResults >= 150)
	{
		totalResults = 150;
	}
	showResult(totalPages,key,1);
	//document.getElementById("pageNumber").innerHTML=(Math.floor(tempDivId/10)+1)+"/"+(Math.ceil(backResults/10));
	if( totalResults < loadNum )
	{
		loadNum = totalResults;
	}
	while( num < loadNum )
	{
		try
		{
			videoId[num]=storeBackInfo.items[num].id.videoId;
		}catch(e)
		{
			totalResults = num-1;
			break;
		}
		title[num]=storeBackInfo.items[num].snippet.title;
		imgURL[num]=storeBackInfo.items[num].snippet.thumbnails.high.url;
		num++;
		backResults++;
	}
}

function store()
{
    if(0)
    {
        var star0 = getFirstItem("page0");
        var star1 = getFirstItem("page1");
        var star2 = getFirstItem("page2");
        var star3 = getFirstItem("page3");
        var location = tempDivId + "&" + tempPage + "&" + star0 + "&" + star1 + "&" + star2 + "&" + star3;
	
        try
        {
            var contentInfo = getDate() + "&" + backResults + "&" + pageToken + "&" + totalResults;
            var storeContent = JSON.stringify(storeBackInfo);
            if (storeContent.length < 200000) 
            {
                sessionStorage.setItem("search_location_" + key, location);//存储位置信息
                sessionStorage.setItem("search_info_" + key, contentInfo);//存储判断是否还需请求YouTube的信息
                sessionStorage.setItem("search_content_" + key, storeContent);//存储youtube 内容
            }
        } catch (e) 
        {
            if (e == QUOTA_EXCEEDED_ERR)
            {
                console.log(" session is full  ")
            }
        }
        
    }
}

function getFirstItem( pageNum )
{
	var page= document.getElementById( pageNum );
	var startId = page.childNodes[0].childNodes[1];
	startId = startId.getAttribute( "id" );
	return startId;
}

function getRegionCode()
{
	var regionCode = top.getTimeZone();
	if( regionCode == undefined)
		regionCode = 'FR';
	return regionCode;
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

function errorNotice()
{
     var noticeWords = document.getElementById("noticeWords");
	showResult( 0 ,key, 0);
	clearTimeout(loadingTimer);
	clearTimeout(timer);
	document.getElementById("errorNotice").style.display = "block";
	noticeWords.innerHTML = resultSearchPageWords[2];
	document.getElementById("loadingPic").style.display = "none";
    var WordsLocation = ( noticeWords.offsetWidth ) / 2;
    WordsLocation =  960 -  WordsLocation  ;
    noticeWords.style.left = WordsLocation +"px";
    
	//document.getElementById("pageNumber").innerHTML = "0/0";
	//document.getElementById("pageNumber").style.left="1720px";
}


function onBodyblur()
{
    if(top.appOpenFlag != 1)
    {
        displayDllipsisTitle(tempDivId);
        zoomOut(); 
    }
}

function onBodyFocus()
{
    if(top.appOpenFlag != 1)
    {
        console.log("-----xl-----------------focus"+tempDivId);
        scrollTitile(tempDivId)
        zoomIn();
    }
}