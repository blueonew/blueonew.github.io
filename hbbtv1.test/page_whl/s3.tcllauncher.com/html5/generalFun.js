//20160608
//向二级跳转的基础网址。---当二级界面地址时，更改此url
var baseUrl ;

var condition = 0;//1：正式服务器    0、自测 

function getUrl(flag)
{
//	baseUrl = "http://54.255.146.242/api/v2/layout/gethtmlsec?";
	baseUrl = "./";
	if(condition == 0)
	{
		if(flag == "history")//历史
		{
			baseUrl = baseUrl + "history/history.html?";
		}
		else if(flag == "search")//搜索
		{
			baseUrl = baseUrl + "search/search.html?";
		}
		else if(flag == "player")//播放
		{
			baseUrl = baseUrl + "playler/player.html?";
		}
		else if(flag == "channel")//分类
		{
			 baseUrl = baseUrl + "channelVideo/channelVideo.html?";
		}
	}
	
	return baseUrl;
}


//1、跳转到  二级页面， 参数：目标URL  如：历史、搜索、分类
function jumpToSubpage(targetUrl)
{
	if(top.checkNetStatus()==false)//top.checkNetStatus()==false
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
	
	console.log("launcher--generalFun.js---jumpToSubpage---targetUrl: " + targetUrl);
	
    tcl.channel.requestInputSource(10);
    sessionStorage.isQuitLauncher = "false";
	window.parent.location = (targetUrl);
}


//2、跳转到 “影片播放” 页面， 参数：许可ID 、 视频ID 、 视频名字      如：影片
function jumpToPlayVideo(targetUrl)
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
	
	var licence_id=getParameter4General(targetUrl,"licence_id");
    var vid=getParameter4General(targetUrl,"vid");
    var title=getParameter4General(targetUrl,"title");
    var pic_url=getParameter4General(targetUrl,"pic_url");
	
    if (pic_url.indexOf("://")<0)
    {
        pic_url = location.href.substring(0, location.href.lastIndexOf("/")+1) + pic_url;
    }
    console.log("launcher--generalFun.js---jumpToPlayVideo---targetUrl: " + targetUrl);
    console.log("launcher---licence_id: " + licence_id+"vid: "+vid+"title: "+title+"pic_url : "+pic_url);
	
    storeHistoryData(licence_id,vid,title,pic_url);
    if (licence_id == 43)//SBS视频
    {
    	
        tcl.channel.requestInputSource(10);
        sessionStorage.isQuitLauncher = "false";
        window.parent.location = (targetUrl);
    }
    else//YouTube视频
    {
        top.g_setting.scaleVideoWindow(0,0,0,0);
        sessionStorage.pipWindow = 0;
        setTimeout(function () {
            tcl.channel.requestMute(0);
        },1000);
        
        top.appOpenFlag = 1;
        top.g_setting.contextOf5in1 = top.CONTEXT_PANEL_OPERATION;
        
        top.g_ulits.setKeySet(0x1|0x2|0x4|0x8|0x10|0x20|0x40|0x80|0x100|0x200|0x800,2,0);
        //top.$("main").style.display="none";
        top.main.document.body.style.display = "none";
        top.$("operatePage").style.display="none";
        top.$("otherPage").style.display="none";
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.youtube");
        top.g_ulits.openApplication("tbrowser.youtube","https://www.youtube.com/tv?launch=menu&additionalDataUrl=http%3a%2f%2flocalhost%3a56789%2fapps%2fYouTube%2fdial_data&v="+vid);
    }
}


//二、Videos.html 中涉及到的操作函数：1、跳转到launcher的二级页面---分类

//3、跳转到 “分类” 二级页面， 参数：待定
function jumpToClassify(secRes,channelKey,tplid,tab_id,resolution,client_type,launcher_id,dnum,language,zone,i18n_title,ids)
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
	else
	{
		baseUrl = getUrl(secRes);
	}
	
	var targetUrl = baseUrl+"secRes="+secRes+"&channelKey="+channelKey+"&tplid="+tplid+"&tab_id="+tab_id+"&resolution="+resolution+"&client_type="
		+client_type+"&launcher_id="+launcher_id+"&dnum="+dnum+"&language="+language+"&zone="+zone+"&i18n_title="+i18n_title+"&ids="+ids;
	

	console.log("launcher--generalFun.js---jumpToClassify---targetUrl: " + targetUrl);
	tcl.channel.requestInputSource(10);
	sessionStorage.isQuitLauncher = "false";
	window.parent.location = (targetUrl);
}






//三、tvNew.html 中涉及到的操作函数：1、进入channelPlay播放电视  2、进入指定信源的channelPlay，播放电视。

//4、跳转到channelPlay.html 页面，播放电视 ，参数：无
function jumpToChannelPlay()
{
    if(top.g_isDownloading == 0){
        top.g_isDownloading = 1;
        top.g_setting.restartDownloadUpdateFile();
    }
    tcl.setting.sendMsgToDBC(4);
	delete sessionStorage.tabListIndex;//删除launcher记忆的tab
	top.jumpPage();
}

//5、切换信源，并跳转到channelPlay.html 页面，播放电视 ， 参数：信源ID
function jumpToSouce(sourceId)
{
    if(top.g_isDownloading == 0){
        top.g_isDownloading = 1;
        top.g_setting.restartDownloadUpdateFile();
    }
	if(sourceId == 10)
	{
		jumpToMedia();
		return;
	}
	if((top.g_factory.sourceLock)&&(top.g_factory.hotelEnable))
	{
		if((top.g_channel.inputSource > 1 && sourceId != top.g_channel.inputSource)|| (top.g_channel.inputSource <= 1 && sourceId > 1))
		{
			top.$("operatePage").src = "";
			top.$("otherPage").src = "password.html?sourceLock:homepage&"+sourceId;
			top.$("otherPage").style.display = "block";
			top.requestFocus(top.otherPage, 0);
			top.setFrameFocusPage("otherPage");
		}
		else
		{
			top.g_channel.inputSource = sourceId;
            top.g_isShowInfoBar = 1;
			top.jumpPage();
		}

	}
	else
	{
		top.g_channel.inputSource = sourceId;
        top.g_isShowInfoBar = 1;
		top.jumpPage();
	}
    tcl.setting.sendMsgToDBC(4);
	delete sessionStorage.tabListIndex;//删除launcher记忆的tab

}




//四、apps.html 中涉及到的操作函数

//6、进入到对应的app
function jumpToApp(appName)
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
	//top.$("main").style.display="none";
    top.main.document.body.style.display = "none";
	top.$("operatePage").style.display="none";
	top.$("otherPage").style.display="none";
    if (appName == "youtube")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.youtube");
        top.g_ulits.openApplication("tbrowser.youtube","https://www.youtube.com/tv?launch=menu&additionalDataUrl=http%3a%2f%2flocalhost%3a56789%2fapps%2fYouTube%2fdial_data");
    }
    else if (appName == "mmh")
    {
    	top.RemoteConntrolType = "HbbTV";//lqt- 设置虚拟遥控器的场景类型
        tcl.channel.requestInputSource(10);
        /*
        if (top.g_channel.inputSource == 10)
        {
            top.g_channel.inputSource = top.lastInputSource;
        }
        */
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.mmh");
        top.g_ulits.openApplication("tbrowser.mmh","https://5ee0c98f1dcfd0ea1049c70a166bb78b.002d734450b3be6f5d0cb4939aa0a4bc.com");
    }
    else if (appName == "netflix")
    {
    	top.RemoteConntrolType = "Netflix";//lqt- 设置虚拟遥控器的场景类型
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","vod.netflix");
        top.g_ulits.sendMsgToApplication("vod.netflix",0xF042);
    }
    else if (appName == "ipla")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/270?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "golive")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.golive");
        top.g_ulits.openApplication("tbrowser.golive","http://tv.gole.tv/?clientType="+tcl.factory.getClientTypeKey()+"&language="+tcl.setting.menuLanguageCode+"&client_mac="+tcl.setting.networkMAC);
    }
    else if (appName == "browser")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.browser");
        top.g_ulits.openApplication("tbrowser.browser","http://eu.guide.huan.tv/huan123/skin/home2015List.action?skin=D1280_2015&data=GBR_mt56#");
    }
    else if (appName == "chili")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","https://netrange.chili.tv/");
    }
    else if (appName == "Chili-eu")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/510?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "viewster")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://www.viewster.tv/viewster_v3/telesystem.html");
    }
    else if (appName == "Viewster-eu")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/171?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "crash")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://crash.app.nrmmh.tv/live/");
    }
    else if (appName == "sbs")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://s3.tcllauncher.com/html5/SBS/indexTcl.html");
    }
    else if (appName == "foxxum")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://5495564812.fxm6263467844.com/");
    }
    else if (appName == "foxxum-la")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://9723638891.fxm6263467844.com/");
    }
    else if (appName == "orf")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","orf");
        top.g_ulits.openApplication("orf","http://orfhbbtv.orf.apa.net/orf/tvthek/index.html?rb=false&portal=false");
    }
    else if (appName == "deezer")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.mmh");
        top.g_ulits.openApplication("tbrowser.mmh","http://tv.deezer.com/smarttv/oaquaexeex4fu2waereeseicheiGhopa9wei6aes/netrange/index.xhtml");
    }
    else if (appName == "deezerf")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://1067564395.a.fxmconnect.com/?app=deezer");
    }
    else if (appName == "deezer-eu")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.mmh");
        top.g_ulits.openApplication("tbrowser.mmh","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/55?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "dailymotion")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://1067564395.a.fxmconnect.com/?app=dailymotion");
    }
    else if (appName == "Dailymotion-eu")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://iptv-app.dailymotion.com/dm-front-vestel/dojoroot/app/pages/vestel/index.j"+"sp?lang=en");
    }
    else if (appName == "cinetrailer")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://1067564395.a.fxmconnect.com/?app=cinetrailer");
    }
    else if (appName == "Cinetrailer-eu")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.mmh");
        top.g_ulits.openApplication("tbrowser.mmh","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/222?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "hellokids")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://1067564395.a.fxmconnect.com/?app=hellokids");
    }
    else if (appName == "icflix")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://native.icflix.com/cotjnlort7gnfAsWFelr/tcl/index.html");
    }
    else if (appName == "lanacion")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://smart.lanacion.com/");
    }
    else if (appName == "EpicTV")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/58?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "ToonGoggles")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/161?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "amazon")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.amazon");
        top.g_ulits.openApplication("tbrowser.amazon","https://atv-ext-eu.amazon.com/blast-app-hosting/html5/index.html?deviceTypeID=A3T3XXY42KZQNP&geoLocation=de");
    }
    else if (appName == "Crackle")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://crackleott.s3.amazonaws.com/tcl/prod/index.html");
    }
    else if (appName == "Euronews")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/62?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "iConcerts")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/87?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "Banaxi")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/201?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "Euroleague")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/61?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "Howdini")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/81?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "Babbidiboo")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://brasil.fxmconnect.com/babidiboo/app/");
    }
    else if (appName == "dbu")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/229?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "Deutscher-Kanu-Verband")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/232?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "Goodwood-Festival-of-Speed")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/75?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "Inside-Sailing")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/91?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "lfl")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/101?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else if (appName == "Mongoose-Jam")
    {
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.common");
        top.g_ulits.openApplication("tbrowser.common","http://backend.drupal7.netrangemmh.com/netrange/v1/open_url/113?prkey=MzM1I2RlYjU0ZmZiNDFlMDg1ZmQ3ZjY5YTc1YjYzNTljOTg5");
    }
    else
    {
    	var targetUrl = appName.replace("client_type","clienttype");
        targetUrl = targetUrl.replace("mac","client_mac");
        tcl.channel.requestInputSource(10);
        top.g_setting.setProperty("app.ui.currentApp","tbrowser.golive");
        top.g_ulits.openApplication("tbrowser.golive","http://tv.gole.tv/index.php?"+targetUrl);
       
        
        var title=getParameter4General2(appName,"title");
        var pic_url=getParameter4General2(appName,"pic_url");
        
        storeHistoryData('42',targetUrl,title,pic_url);//42:golive视频   
    }
}

function jumpLocalApps(name)
{
    //delete sessionStorage.tabListIndex;
    if (name == "miracast")
    {
        top.jumpToOperatePage("networkSetting/miracast.html");
    }
    else if (name == "emanual")
    {
    	top.preTempPage = "homePage";
        top.jumpToOperatePage("eManual/eManualFirst.html?0");
    }
    else if (name == "nscreen")
    {
        top.jumpToOperatePage("nScreenStart.html");
    }
}


//5、上导航栏内容

//7、跳转到 “媒体中心” 页面  参数：无
function jumpToMedia()
{
	var usbLock = top.g_factory.usbLock;
	var hotelEnable = top.g_factory.hotelEnable;
	delete sessionStorage.tabListIndex;//删除launcher记忆的tab
	if((usbLock) && (hotelEnable))
	{
		top.$('main').src = "password.html?usbLock";
		top.main.focus();
	}
	else
	{
		top.isFromOptionIntoUsb=0;
		top.$('main').src = "deviceList.html";
		top.main.focus();
	}
}

//8、跳转到 “设置” 页面  参数：无
function jumpToSetting()
{
	top.jumpToOperatePage("index.html");
}


//9、跳转到 “网络设置” 页面 参数：无
function jumpToNetwork()
{
	top.g_nextHtmlPage = "networkSetting.html";
	top.jumpToOperatePage("index.html");
}


//解析URL中参数的函数
function getParameter4General(url,navName)
{
	var n=url.indexOf("?");
	var urlStr=url.substring(n+1,url.length);
	var result=urlStr.split('&');

	for(var i=0;i<result.length;i++)
	{

		var keyValue=result[i].toString();
		if(keyValue.indexOf(navName)==0)
		{
			var n2=keyValue.indexOf('=');
			var strr=keyValue.substring(n2+1,keyValue.length);
			return strr;
		}
	}
}


function getParameter4General2(url,navName)
{
	var urlStr=url;
	var result=urlStr.split('&');
	
	for(var i=0;i<result.length;i++)
	{
	
	    var keyValue=result[i].toString();
	  	if(keyValue.indexOf(navName)==0)
	  	{
	  		var n2=keyValue.indexOf('=');
	  		var strr=keyValue.substring(n2+1,keyValue.length);
	  		return strr;
	  	}
	} 
}


// store the play video to history 
var json;
function storeHistoryData(licenceId,vid,titleValue,urlImageValue)
{  
    var historyData;
    if(supportLocalStorage())
    {
        json=JSON.parse(localStorage.getItem("history"));
    }
    else
    {
        console.log("不支持localStorage");
    }

    var myDate = new Date();
    var year=myDate.getFullYear();;
    var month=RunTime(myDate.getMonth()+1,2);
    var day=RunTime(myDate.getDate(),2);
    
    historyData =
	{	
    	"year": year,
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
        try
        {
            localStorage.setItem("history",strHis);
        }
        catch(e)
        {
            if(e==QUOTA_EXCEEDED_ERR)
            {
                console.log('Storage capacity');
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

//delete repeat data
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