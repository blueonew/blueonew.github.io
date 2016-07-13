//常量-----------tclLauncherUpdateDate 20160606------------
//window.screen.width(屏幕分辨率的宽) 在css中定义顶级div的width和height，这里看是直接写死还是通过window.screen.height动态获得。 ?????
var windowScreenWidth = 1920;
// window.screen.height(屏幕分辨率的高)
var windowScreenHight = 1080;
// 移到页面最后一个元素时，给最左边留出的空白宽度，方便让用户看到已经到一页的最后了
var iframeEndLeft = 79;
//移到页面左边第一个元素时，给最左边留出的空白宽度，方便让用户看到已经到一页的最后了
var iframeStartLeft = 95;
//block边框的宽度为10像素
var blockBorderWidth = 10;
//currentFocusFiled =1,当前所处区域在上标题
var FocusFiled_topTitle = 1;
//currentFocusFiled =2,当前所处区域在下标题
var FocusFiled_BottomTitle = 2;
//currentFocusFiled = 3,当前所处区域在住页面区
var FocusFiled_page = 3;

// 变量-----------------------------------------------------------------
// 当前活动的区域：1，上标题；2，下标题;3，pages,初始在“下标题”
var currentFocusFiled = FocusFiled_BottomTitle;
// 在下标题区域，初始的focus在第一个标题，即跟元素下标一致
 var currentElemInBottomTitleIndex = 0;
// 在上标题区域，初始的focus在第一个标题，即跟元素下标一致
var currentElemInTopTitleIndex = 0;
// 读取下标题区域元素到数组,包含了mainTitle,所以会多一个
var titleList;
// 读取上标题区域元素到数组
var toptitleList;
// 读取iframe元素到数组
var iframeList;
// 读取每个iframe中的第0个div到数组
var iframeListDiv_0 = new Array();
// 读取每个iframe中的第1个div到数组
var iframeListDiv_1 = new Array();
// page中下一个集焦的元素的id
var nextFocusObj;
var currentFocusObj;
//page中集焦元素的坐标值
var nextAbsCoorPoint;
var currentAbsCoorPoint;
// 当前的集焦框
var currentFocusBorderEle;
var nextFocusBorderEle;
// 当前X坐标的位移
var currentCoordinateX = 0;
var nextCoordinateX = 0;

// 按ok键时的集焦对象
var pressOkObject = null;

//当前block标题名称
var currentBlockName="";
//下一个block标题名称
var nexBlockName="";
//标题宽度标尺
var scaleplate_span = null;
//标题不滚动
var scroll_flag=0;
//是否是通过遥控打开(0,不是，1，是)
var openByRemoteFlag = 0;
/*----------------------------方法开始-----------------------------------*/
var exit = 0;

document.onkeydown = keyProcess;
document.onsystemevent = systemEventHandle;

if (tcl.channel.inputSource != 10)
{
    top.lastInputSource = tcl.channel.inputSource;
}

function $(id) {
	return document.getElementById(id);
}

function init() 
{
    document.body.style.display = "block";
    if (top.enableUpdateScreen)
    {
        top.enableUpdateScreen(true);
    }
    top.RemoteConntrolType = "default";//lqt--设置默认的虚拟遥控器场景，为不显示
    sessionStorage.isQuitLauncher = "true";
	if(top.isGingaOn && top.GingaObj.isInit == top.GingaStates.True)
	{
		top.gingaEvtProc(top.GingaStates.Events.GINGA_EVT_PAUSE_FOR_CONTROL_LOST);
	}
    addCacheEventListener();
    if (isCache)
    {
        return;
    }
    top.g_temp="homePage";
    tcl.setting.contextOf5in1   = top.CONTEXT_HOME_PAGE;
    tcl.setting.sendMsgToDBC(1);
    if (tcl.channel.inputSource != 10)
    {
        top.lastInputSource = tcl.channel.inputSource;
    }
    // 增加按键监听
    addKeyDownListener();
    document.body.style.background = "transparent";
}

function uninit()
{
    if (isCache)
    {
        return;
    }
    top.g_temp="";
    if (exit)
    {
        tcl.channel.requestMute(0);
    }
    tcl.setting.scaleVideoWindow(0,0,0,0);
    clearInterval(timeTimer);
    if(sessionStorage.isQuitLauncher == "true")
	{
    	console.log("----------------isQuitLauncher--------------");
		delete sessionStorage.tabListIndex;//删除launcher记忆的tab
	}
}



function onBodyFocus()
{
    if(  top.appOpenFlag != 1)
    {
        console.log("------------onBodyFocus------index------");
        if(currentFocusFiled == FocusFiled_topTitle)
        {
            switchFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);// 新的获得焦点
        }
            else if(currentFocusFiled == FocusFiled_BottomTitle)
        {
        switchFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
        }
        else if(currentFocusFiled == FocusFiled_page)
        {
            switchFocusOnPage(currentFocusObj, currentFocusBorderEle);
        }
	}
}

function onBodyBlur()
{
	if(  top.appOpenFlag != 1)
    {
		console.log("-------------onBodyBlur------index------");
		if(currentFocusFiled == FocusFiled_topTitle)
		{
			switchLoseFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);// 原来的失去焦点
		}
		else if(currentFocusFiled == FocusFiled_BottomTitle)
		{
            if (titleList == undefined)
                return;
			switchLoseFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
		}
		else if(currentFocusFiled == FocusFiled_page)
		{
			switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
		}
	}
}


function firstTimeOnloadIndex() {

	if (window.ActiveXObject) {
		try {
			currentElemInBottomTitleIndex = Number(sessionStorage.tabListIndex);
			wakeReportTimeInterval();
		} catch (e) {
			currentElemInBottomTitleIndex = -1;
		}
	} else {
		if (sessionStorage.tabListIndex) {
			currentElemInBottomTitleIndex = Number(sessionStorage.tabListIndex);
			wakeReportTimeInterval();
		} else {
			currentElemInBottomTitleIndex = -1;
		}
	}
}
// 获取对象x坐标
function getAbsCoorPoint(obj) { // js获取对象的绝对坐标 方法1：
	var objCoorX = obj.offsetLeft;
	while (obj = obj.offsetParent) {
		objCoorX += obj.offsetLeft;
	}
	return objCoorX;
}
function readDomList(){
	// 读取设置部分的长度
	toptitleList = $("infoStatusSetting").getElementsByClassName("topButton_Setting");
	// 读取所有的iframe
	iframeList = $("iframeDiv").getElementsByTagName("iframe");
	// 读取下面的标题
	titleList = $("title").getElementsByClassName("titleSpan");
	//获取标题宽度标尺
	scaleplate_span=$("span_scaleplate");
	// 读取每个iframe中的第0个div到数组;读取每个iframe中的第1个div到数组
	for (var iframelistIndex = 0; iframelistIndex < iframeList.length; iframelistIndex++) {
		iframeListDiv_0[iframelistIndex] = iframeList[iframelistIndex].contentWindow.document.getElementsByName("subwindow")[0];
		iframeListDiv_1[iframelistIndex] = iframeList[iframelistIndex].contentWindow.document.getElementsByName("focusBlock")[0];
	}
}
function addKeyDownListener() {
	//读取dom里面的信息
	 readDomList();
	// 判断是不是第一次进入首页
	firstTimeOnloadIndex();
	// 遍历标题获取后台提供的默认的开机焦点位置
	if (currentElemInBottomTitleIndex != -1) {// 由二级目录返回
		// 切换窗口内容
		refleshIframeLeft(currentElemInBottomTitleIndex);
		iframeListDiv_0[currentElemInBottomTitleIndex].style.left = Number(sessionStorage.currentBodyOffset) + 'px';
		getBackBlockId(sessionStorage.blockId);
		// 换页的内容
		switchLoseFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
		currentFocusFiled = FocusFiled_page;// 切换到页面区
	} else {// 第一次访问
		for (var i = 0; i < titleList.length; ++i) {
			if (titleList[i].getAttribute('data-focus') == "1") {
				currentElemInBottomTitleIndex = i;			
				break;
			}
		}
		// 切换窗口内容
		refleshIframeLeft(currentElemInBottomTitleIndex);
		// 换页的内容
		switchFocusOnTitle(titleList[currentElemInBottomTitleIndex]);

		// 刚打开launcher,读取tab顺序数据
		actionFour_tabOrder();
		actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex);
	}
	$("mainFocus").style.visibility = 'visible';	
	//mainfocus标题增加监听
	addTabFocusedListen();
	//鼠标监听
	titleSwithWindow();
}
function keyProcess(evt) 
{
	var keycode = evt.which;
	console.log("---index.js---keycode:"+keycode+",---top.appOpenFlag:"+top.appOpenFlag);
	if(top.appOpenFlag == 1)
    {
		switch(keycode)
		{
			case VK_VIRTUAL_REMOTE:
				//显示或者不显示--lqt
				if(top.virtualRemoteState == 0)
				{
					top.document.getElementById("virtualRemote").contentWindow.showVirtualRemote(top.RemoteConntrolType);
				}
				else
				{
					//隐藏虚拟遥控器
					top.document.getElementById("virtualRemote").contentWindow.hideVirtualRemote();
				}
				break;
				//lqt--虚拟遥控器的上键
			case VK_VIRTUAL_KEYBOARD_UP:
			{
				top.document.getElementById("virtualRemote").contentWindow.keyDownForUp();
				
				break;
			}
			//lqt--虚拟遥控器的下键
			case VK_VIRTUAL_KEYBOARD_DOWN:
			{
				top.document.getElementById("virtualRemote").contentWindow.keyDownForDown();
				
				break;
			}
			//lqt--虚拟遥控器的左键
			case VK_VIRTUAL_KEYBOARD_LEFT:
			{
				top.document.getElementById("virtualRemote").contentWindow.keyDownForLeft();
				
				break;
			}
			//lqt--虚拟遥控器的右键
			case VK_VIRTUAL_KEYBOARD_RIGHT:
			{
				top.document.getElementById("virtualRemote").contentWindow.keyDownForRight(); 
				
				break;
			}
			//lqt--鼠标的左键
			case VK_VIRTUAL_MOUSE_OK:
			{
				var clientX = top.g_setting.getProperty("memory.app.ui.virtualRemote.clientX", "0");
				var clientY = top.g_setting.getProperty("memory.app.ui.virtualRemote.clientY", "0");
				console.log("lqt---timeshift.js---clientX: "+clientX);
				console.log("lqt---timeshift.js---clientY: "+clientY);
				top.document.getElementById("virtualRemote").contentWindow.keyDownMouseClick(clientX,clientY); 
				
				break;
			}
			//lqt--虚拟遥控器的ok键
			case VK_VIRTUAL_KEYBOARD_OK:
			{
				top.document.getElementById("virtualRemote").contentWindow.keyDownForOK(); 
				
				break;
			}
			//lqt--虚拟遥控器的返回键
			case VK_VIRTUAL_KEYBOARD_BACK:
			{
				//如果是显示的话，就隐藏
				if(top.virtualRemoteState == 1)
				{
					//隐藏虚拟遥控器
					top.document.getElementById("virtualRemote").contentWindow.hideVirtualRemote();
				}
				
				break;
			}
		}
    }
	
	
	
	
	switch (keycode) {
	case VK_RIGHT: // 按right var VK_RIGHT = 39;
        if(top.appOpenFlag == 1)
        {
            return;
        }
		switch (currentFocusFiled) {
		case FocusFiled_topTitle:// 上标题
			switchLoseFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);// 原来的失去焦点
			currentElemInTopTitleIndex = (currentElemInTopTitleIndex + 1) % (toptitleList.length);
            if (toptitleList[currentElemInTopTitleIndex].style.display == "none")
                currentElemInTopTitleIndex++;
			switchFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);// 新的获得焦点
			break;
		case FocusFiled_BottomTitle:// 下标题
			// 在换页前，把原来的页恢复原样
			iframeList[currentElemInBottomTitleIndex].classList.remove('active');
			iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
			// 换页前恢复之前的tab标题的显示
			titleList[currentElemInBottomTitleIndex].style.visibility = 'visible';
			// 离开tab页
			actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex);
			// 换页号
			currentElemInBottomTitleIndex = (currentElemInBottomTitleIndex + 1)
					% titleList.length;
			// 进入tab页
			actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex);
			// 换页的内容
			switchFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
			// 切换窗口内容
			refleshIframeLeft(currentElemInBottomTitleIndex);
			break;
		case FocusFiled_page:// page(home,videos,tv,apps)
			var rightNodeIdValue = currentFocusObj.getAttribute('data-right');
			// alert("向右键 的右孩子值 "+rightNodeIdValue);
			if (rightNodeIdValue == "-1") {
				// 跳转页面前恢复原来的页面容器的位置
				iframeList[currentElemInBottomTitleIndex].classList.remove('active');
				iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';

				// 换页前恢复之前的tab标题的显示
				titleList[currentElemInBottomTitleIndex].style.visibility = 'visible';
				// 离开tab页
				actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex);
				// 下标题移动一下
				currentElemInBottomTitleIndex = (currentElemInBottomTitleIndex + 1)% (titleList.length);
				// 进入tab页
				actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex);
				// 向右移动时，需要把接下来的页面的容器的左上角设置为（0，0）
				iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
				// 时上一页失去焦点
				switchLoseFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
				// 切换窗口内容
				refleshIframeLeft(currentElemInBottomTitleIndex);
				// 获得新页面的元素id名称
				rightNodeIdValue = currentFocusObj.getAttribute('data-rightPage');
				// 获得新页面的元素对象
				nextFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(rightNodeIdValue);
				nextFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(nextFocusObj.getAttribute('data-focus_id'));
			} else {
				// 获得新页面的元素对象
				nextFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(rightNodeIdValue);
				nextFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(nextFocusObj.getAttribute('data-focus_id'));
				// 判断是否还在屏幕可见，如果不可见，页面需要左移，使被选中的移动到屏幕可见位置
				nextAbsCoorPoint=getAbsCoorPoint(nextFocusObj);
				if ( (nextAbsCoorPoint + nextFocusObj.offsetWidth + iframeEndLeft) > windowScreenWidth) {// 如果将要集焦的元素在屏幕右边，则需要把它左移到屏幕里来
					if (nextFocusObj.getAttribute('data-right') == "-1") {
						// 增加一个判断，防止移到最后，由于移的过头，右边出现空白
						iframeListDiv_0[currentElemInBottomTitleIndex].style.left = (parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left)
								+ windowScreenWidth
								- nextAbsCoorPoint - nextFocusObj.offsetWidth)
								- iframeEndLeft + 'px';
					} else {
						iframeListDiv_0[currentElemInBottomTitleIndex].style.left = (parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left) 
								+ windowScreenWidth
								- nextAbsCoorPoint - nextFocusObj.offsetWidth)- iframeEndLeft + 'px';
					}
				}
			}

			// 切换焦点
			switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
			switchFocusOnPage(nextFocusObj, nextFocusBorderEle);
			currentFocusObj = nextFocusObj;
			currentFocusBorderEle = nextFocusBorderEle;
			break;
		default:
			break;
		}
		break;
	case VK_UP: // 按 Up var VK_UP = 38;
        if(top.appOpenFlag == 1)
        {
            return;
        }
		switch (currentFocusFiled) {
		case FocusFiled_topTitle:// 上标题区域按向上的键不会有反应
			break;
		case FocusFiled_BottomTitle:// 下标题
			currentFocusFiled = FocusFiled_page;// 进入页面区
			// 当前标题去掉焦点图片
			switchLoseFocusOnTitle(titleList[currentElemInBottomTitleIndex]);// 这种不用切换窗口
			// 要求iframeListe的顺序要和titleList的顺序对应??????????????
			currentFocusObj = iframeListDiv_1[currentElemInBottomTitleIndex];
			// 查找最左下角的元素
			var nextNodeIdValue = currentFocusObj.getAttribute('data-right');			
			while ((getAbsCoorPoint(currentFocusObj) + currentFocusObj.offsetWidth) < 0) {// 最左
				currentFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(nextNodeIdValue);
				nextNodeIdValue = currentFocusObj.getAttribute('data-right');
			}
			nextNodeIdValue = currentFocusObj.getAttribute('data-down');
			while (nextNodeIdValue != 0) {// 最下
				currentFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(nextNodeIdValue);
				// 当前元素集焦框
				nextNodeIdValue = currentFocusObj.getAttribute('data-down');
			}
			currentFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(currentFocusObj
							.getAttribute('data-focus_id'));
			currentAbsCoorPoint = getAbsCoorPoint(currentFocusObj);
			// 使当前元素左边对齐
			// 如果当前的节点时第一个节点，左边需要空iframeEndLeft的边距出来
			if (currentFocusObj.getAttribute('data-left') == "-1") {
				iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
			} 			
			else if( currentAbsCoorPoint < iframeStartLeft) {
				// 如果将要集焦的元素在屏幕左边，则需要把它左移到屏幕里来
				iframeListDiv_0[currentElemInBottomTitleIndex].style.left = parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left)
						- currentAbsCoorPoint - blockBorderWidth + iframeStartLeft + 'px';
			}
			switchFocusOnPage(currentFocusObj, currentFocusBorderEle);
			break;
		case FocusFiled_page:// page(home,videos,tv,apps)
			var upNodeIdValue = currentFocusObj.getAttribute('data-up');
			if (upNodeIdValue == "0") {
				// 切换上标题的内容
				$("infoStatusSetting").style.display = 'block';
				//遮罩
				$("opacityBg").style.display = 'block';
				currentFocusFiled = FocusFiled_topTitle;// 进入上标题区
				currentElemInTopTitleIndex = 0;
                if (toptitleList[currentElemInTopTitleIndex].style.display == "none")
                    currentElemInTopTitleIndex++;
				switchFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);
				switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
			} else {
               // console.log("up in");
				nextFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document
						.getElementById(upNodeIdValue);
				nextFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document
						.getElementById(nextFocusObj
								.getAttribute('data-focus_id'));
				switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
				switchFocusOnPage(nextFocusObj, nextFocusBorderEle);
				currentFocusObj = nextFocusObj;
				currentFocusBorderEle = nextFocusBorderEle;
              //  console.log("up out");
			}
			break;
		default:
			break;
		}
		break;
	case VK_LEFT: // Left var VK_LEFT = 37;
		if(top.appOpenFlag == 1)
        {
            return;
        }
		switch (currentFocusFiled) {
		case FocusFiled_topTitle:// 上标题
			switchLoseFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);// 原来的失去焦点
            while(true)
            {
			currentElemInTopTitleIndex = (currentElemInTopTitleIndex <= 0) ? (toptitleList.length - 1) : (currentElemInTopTitleIndex - 1);
            if (toptitleList[currentElemInTopTitleIndex].style.display == "none")
                currentElemInTopTitleIndex--;
            else
                break;
            }
			switchFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);// 新的获得焦点
			break;
		case FocusFiled_BottomTitle:// 下标题
			// 在换页前，把原来的页恢复原样
			iframeList[currentElemInBottomTitleIndex].classList.remove('active');
			iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
			// 换页前恢复之前的tab标题的显示
			titleList[currentElemInBottomTitleIndex].style.visibility = 'visible';
			// 离开tab页
			actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex);
			// 换页号
			currentElemInBottomTitleIndex 
			= (currentElemInBottomTitleIndex == 0) ? (titleList.length - 1):(currentElemInBottomTitleIndex - 1);
			// 进入tab页
			actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex);
			// 换页内容
			switchFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
			// 切换窗口内容
			refleshIframeLeft(currentElemInBottomTitleIndex);
			break;
		case FocusFiled_page:// page(home,videos,tv,apps)
			var leftNodeIdValue = currentFocusObj.getAttribute('data-left');
			// alert("向左键 的左孩子值 "+leftNodeIdValue);
			if (leftNodeIdValue == "-1") {
				// 在换页前，把原来的页恢复原样
				iframeList[currentElemInBottomTitleIndex].classList.remove('active');
				iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
				// 换页前恢复之前的tab标题的显示
				titleList[currentElemInBottomTitleIndex].style.visibility = 'visible';
				// 离开tab页
				actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex);
				// 下标题移动一下
				currentElemInBottomTitleIndex
				= (currentElemInBottomTitleIndex == 0) ? (titleList.length - 1): (currentElemInBottomTitleIndex - 1);
				// 进入tab页
				actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex);
				switchLoseFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
				// 切换窗口内容
				refleshIframeLeft(currentElemInBottomTitleIndex);
				// 获得新页面的元素id名称
				leftNodeIdValue = currentFocusObj.getAttribute('data-leftPage');
				// 获得新页面的元素对象
				nextFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(leftNodeIdValue);
				nextFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(nextFocusObj.getAttribute('data-focus_id'));
				// 把nextFocusObj显示到屏幕上来，考虑可能有几个屏幕的图片
				nextAbsCoorPoint=getAbsCoorPoint(nextFocusObj);
				// 一共有多少页图片

                var pagesCountNext = parseInt((nextAbsCoorPoint + nextFocusObj.offsetWidth + blockBorderWidth + iframeEndLeft)/windowScreenWidth);
                if (pagesCountNext>0)
                {
                    // -x + 1920 = width
                    iframeListDiv_0[currentElemInBottomTitleIndex].style.left = windowScreenWidth - nextAbsCoorPoint - nextFocusObj.offsetWidth - blockBorderWidth  -iframeEndLeft + 'px';
                }
                else
                {
                    iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
                }
			} else {
				// 获得新页面的元素对象
				nextFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document
						.getElementById(leftNodeIdValue);
				nextFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document
						.getElementById(nextFocusObj
								.getAttribute('data-focus_id'));
				nextAbsCoorPoint=getAbsCoorPoint(nextFocusObj);
				// 如果当前的节点时第一个节点，左边需要空iframeEndLeft的边距出来
				if (nextFocusObj.getAttribute('data-left') == "-1") {
					iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
				} else if (nextAbsCoorPoint < iframeStartLeft) {
					// 如果将要集焦的元素在屏幕左边，则需要把它左移到屏幕里来
					var temp = parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left);
					iframeListDiv_0[currentElemInBottomTitleIndex].style.left 
					= (temp - nextAbsCoorPoint) > 0 ? 0: (temp - nextAbsCoorPoint + iframeStartLeft) + 'px';
				}
			}

			switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
			switchFocusOnPage(nextFocusObj, nextFocusBorderEle);
			currentFocusObj = nextFocusObj;
			currentFocusBorderEle = nextFocusBorderEle;
			break;
		default:
			break;
		}
		break;

	case VK_DOWN:
        if(top.appOpenFlag == 1)
        {
            return;
        }
		switch (currentFocusFiled) {
		case FocusFiled_topTitle:// 上标题区域按向下的键不会有反应
			currentFocusFiled = FocusFiled_page;
			// 取消上标题的集焦
			switchLoseFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);
			//遮罩
			$("opacityBg").style.display = 'none';
			// 上标题区切换显示内容
			$("infoStatus").style.display = 'block';
			$("infoStatusSetting").style.display = 'none';
			// 页面区集焦			
			currentFocusObj = iframeListDiv_1[currentElemInBottomTitleIndex];
			//保留之前的obj
			var preObj = currentFocusObj;
			//当前画布的left值
			var offSet=iframeListDiv_0[currentElemInBottomTitleIndex].style.left.split('px')[0];
			// 查找最左下角的元素
			var nextNodeIdValue = currentFocusObj.getAttribute('data-right');
			while ((windowScreenWidth > (getAbsCoorPoint(currentFocusObj) + currentFocusObj.offsetWidth))&& nextNodeIdValue != -1) {// 屏幕最右元素
				preObj = currentFocusObj;
				currentFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(nextNodeIdValue);
				nextNodeIdValue = currentFocusObj.getAttribute('data-right');
			}			
			if(windowScreenWidth < (getAbsCoorPoint(currentFocusObj) + currentFocusObj.offsetWidth)){
				currentFocusObj = preObj;
			}
			currentFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document
					.getElementById(currentFocusObj.getAttribute('data-focus_id'));
			switchFocusOnPage(currentFocusObj, currentFocusBorderEle);
			break;
		case FocusFiled_BottomTitle:// 下标题，不会有反应
			break;
		case FocusFiled_page:// page(home,videos,tv,apps)
			var downNodeIdValue = currentFocusObj.getAttribute('data-down');
			// alert(" data-down " + downNodeIdValue);
			if (downNodeIdValue == "0") {
				//currentFocusFiled = FocusFiled_BottomTitle;// 进入下标题区
				// 原来页面区的焦点失去
				switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
				// 下标题区获得焦点
				switchFocusOnTitle(titleList[currentElemInBottomTitleIndex]);// 这种不用切换窗口内容
			} else {
               // console.log("down in");
				nextFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document
						.getElementById(downNodeIdValue);
				nextFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document
						.getElementById(nextFocusObj
								.getAttribute('data-focus_id'));
				switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
				switchFocusOnPage(nextFocusObj, nextFocusBorderEle);
				currentFocusObj = nextFocusObj;
				currentFocusBorderEle = nextFocusBorderEle;
			}
			break;
		default:
			break;
		}
		break;
	case VK_ENTER:
    {
		if(top.appOpenFlag == 1)
        {
            return;
        }
		switch (currentFocusFiled) {
		case FocusFiled_page:// 主页			
			sessionStorage.tabListIndex = currentElemInBottomTitleIndex;
			sessionStorage.blockId = pressOkObject.getAttribute('id');
			sessionStorage.currentBodyOffset = parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left);	
            if (pressOkObject) 
            {
				try 
                {
					openByRemoteFlag = 1;
                    pressOkObject.onclick();
				} catch (e) 
                {
					console.log(e.name + ": " + e.message);
					openByRemoteFlag = 0;
				}finally{
					openByRemoteFlag = 0;
				}
			}           
            break;
		case FocusFiled_topTitle:// 上标题区域按向下的键不会有反应		
             onBodyBlur();
			if (pressOkObject) {
				try {
					pressOkObject.onclick();
				} catch (e) {
					console.log(e.name + ": " + e.message);
				}
			}
			break;
		case FocusFiled_BottomTitle:// 还原当前页到初始位置
			iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
			break;
		default:
			break;
			}
		break;
    }
    case VK_EXIT:
    {
        if(top.appOpenFlag == 1)
		{
			var appname = top.g_setting.getProperty("app.ui.currentApp","tbrowser.mmh");
			top.scheduleApp = top.SCHEDULE_HOMEPAGE;
			top.g_ulits.closeApplication(appname);
            return;
		}
    	delete sessionStorage.tabListIndex;//删除launcher记忆的tab
        if (tcl.channel.inputSource != top.lastInputSource)
        {
            if (top.lastInputSource == 0 || top.lastInputSource == 1)
            {
                tcl.channel.inputSource = top.lastInputSource;
            }
            else
            {
                tcl.channel.requestInputSource(top.lastInputSource);
            }
        }
        tcl.setting.sendMsgToDBC(4);
        exit = 1;
        top.jumpPage();
        if(top.g_isDownloading == 0){
            top.g_isDownloading = 1;
            tcl.setting.restartDownloadUpdateFile();
        }
        onBodyBlur();
        break;
    }
    case VK_HOME:
    {
    	var tempCurrentFocusFiled = currentFocusFiled;
    	var tempCurrentElemBottomIndex = currentElemInBottomTitleIndex;
        if(top.appOpenFlag == 1)
        {
            var appname = top.g_setting.getProperty("app.ui.currentApp","tbrowser.mmh");
            top.scheduleApp = top.SCHEDULE_HOMEPAGE;
            top.g_ulits.closeApplication(appname);
            return;
        }
        switch (currentFocusFiled) 
        {
			 case FocusFiled_topTitle:// 上标题
				  // 取消上标题的集焦
				  switchLoseFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);
				  //遮罩
				  $("opacityBg").style.display = 'none';
				  //隐藏状态栏隐藏
				  $("infoStatusSetting").style.display = 'none';
				  // 显示信息栏
				  $("infoStatus").style.display = 'block';
				  // 页面区集焦			
				  currentFocusObj = iframeListDiv_1[currentElemInBottomTitleIndex];
				  currentFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(currentFocusObj.getAttribute('data-focus_id'));
				  
			 case FocusFiled_page:// 页面
				  if(top.appOpenFlag != 1)
				  {
					  downNodeIdValue = currentFocusObj.getAttribute('data-down');
					  // 原来页面区的焦点失去
					  switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
				  }
			 case FocusFiled_BottomTitle:
				  
				  //1、在换页前，把原来的页恢复原样
				  iframeList[currentElemInBottomTitleIndex].classList.remove('active');
				  iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';

				  //2、换页前恢复之前的tab标题的显示
				  titleList[currentElemInBottomTitleIndex].style.visibility = 'visible';
				  //3、数据上报-离开tab页
				  actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex);
				  //4、换页号，计算页号
				  for (var i = 0; i < titleList.length; ++i) 
				  {
					  if (titleList[i].getAttribute('data-focus') == "1") 
					  {
						  currentElemInBottomTitleIndex = i;			
						  break;
					  }
				  }
				  //5、数据上报-进入tab页
				  actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex);
				  //6、切换窗口内容、切换iframe
				  refleshIframeLeft(currentElemInBottomTitleIndex);
				  
				  
                    if(tempCurrentFocusFiled == FocusFiled_BottomTitle&&tempCurrentElemBottomIndex == currentElemInBottomTitleIndex)
                    {
                        delete sessionStorage.tabListIndex;//删除launcher记忆的tab
                        if (tcl.channel.inputSource != top.lastInputSource)
                        {
                            if (top.lastInputSource == 0 || top.lastInputSource == 1)
                            {
                                tcl.channel.inputSource = top.lastInputSource;
                            }
                            else
                            {
                                tcl.channel.requestInputSource(top.lastInputSource);
                            }
                        }
                        tcl.setting.sendMsgToDBC(4);
                        exit = 1;
                        top.jumpPage();
                        if(top.g_isDownloading == 0)
                        {
                            top.g_isDownloading = 1;
                            tcl.setting.restartDownloadUpdateFile();
                        }
                        onBodyBlur();
				  }
				  // 显示标题的焦点
				  switchFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
				  break;
             
			 default:
				  break;
		
		
        }
        break;
    }
	case VK_BACK_SPACE:
	case VK_BACK: {
        if(top.appOpenFlag == 1)
        {
            return;
        }
		switch (currentFocusFiled) {
		case FocusFiled_topTitle:// 上标题
			currentFocusFiled = FocusFiled_page;
			// 取消上标题的集焦
			switchLoseFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);
		    //遮罩
			$("opacityBg").style.display = 'none';
			// 上标题区切换显示内容
			$("infoStatus").style.display = 'block';
			$("infoStatusSetting").style.display = 'none';
			// 页面区集焦			
			currentFocusObj = iframeListDiv_1[currentElemInBottomTitleIndex];
			//保留之前的obj
			var preObj = currentFocusObj;
			//当前画布的left值
			var offSet=iframeListDiv_0[currentElemInBottomTitleIndex].style.left.split('px')[0];
			// 查找最左下角的元素
			var nextNodeIdValue = currentFocusObj.getAttribute('data-right');
			while ((windowScreenWidth > (getAbsCoorPoint(currentFocusObj) + currentFocusObj.offsetWidth))&& nextNodeIdValue != -1) {// 屏幕最右元素
				preObj = currentFocusObj;
				currentFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(nextNodeIdValue);
				nextNodeIdValue = currentFocusObj.getAttribute('data-right');
			}			
			if(windowScreenWidth < (getAbsCoorPoint(currentFocusObj) + currentFocusObj.offsetWidth)){
				currentFocusObj = preObj;
			}
			currentFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document
					.getElementById(currentFocusObj.getAttribute('data-focus_id'));
			switchFocusOnPage(currentFocusObj, currentFocusBorderEle);
			break;
		case FocusFiled_page:// 页面
            if(  top.appOpenFlag != 1)
            {
                 downNodeIdValue = currentFocusObj.getAttribute('data-down');
                // 原来页面区的焦点失去
                switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
                // 下标题区获得焦点
                switchFocusOnTitle(titleList[currentElemInBottomTitleIndex]);// 这种不用切换窗口内容 
            }
			break;
		case FocusFiled_BottomTitle:// 下标题 delete，不会在index.html页面按back键退出？
	            
			  //1、在换页前，把原来的页恢复原样
			  iframeList[currentElemInBottomTitleIndex].classList.remove('active');
			  iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';

			  //2、换页前恢复之前的tab标题的显示
			  titleList[currentElemInBottomTitleIndex].style.visibility = 'visible';
			  //3、数据上报-离开tab页
			  actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex);
			  //4、换页号，计算页号
			  for (var i = 0; i < titleList.length; ++i) 
			  {
				  if (titleList[i].getAttribute('data-focus') == "1") 
				  {
					  currentElemInBottomTitleIndex = i;			
					  break;
				  }
			  }
			  //5、数据上报-进入tab页
			  actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex);
			  //6、切换窗口内容、切换iframe
			  refleshIframeLeft(currentElemInBottomTitleIndex);
			  // 显示标题的焦点
			  switchFocusOnTitle(titleList[currentElemInBottomTitleIndex]);
			  break;
		default:
			break;
		}
		break;
	}
	case VK_MENU:
	case VK_SOURCE:
	case VK_SLEEP:
	case VK_FREEZE:
	case VK_TUNER:
	case VK_PIC:
	case VK_SOUND:
	case VK_MTS:
    {
        onBodyBlur();
        top.keyDownProcess(evt);
        break;
    }    
	case VK_MEDIA:
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
    case VK_VOLUME_DOWN:
    case VK_VOLUME_UP:
    case VK_FRONT_PANEL_LOCKED:
    case VK_OPTION:
    {
        top.keyDownProcess(evt);
        break;
    }
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
            exit = 1;
			if(inputSource <= 1)
			{
				top.$("operatePage").src = "";
				top.$("otherPage").src = "";
				tcl.channel.requestMute(0);
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
    case VK_VIRTUAL_REMOTE://lqt--主页不响应本身的虚拟遥控器
	{
		break;
	}
	default:
		console.log("---keycode--:"+keycode);
		break;
	}
}
function addTabFocusedListen() {
	$("mainFocus").onclick = function(e) {
		if (currentFocusFiled == FocusFiled_BottomTitle) {
			return;
		}
		if (currentFocusFiled == FocusFiled_page) {
			// 原来页面区的焦点失去
			switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
			//iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
		}
		$("mainFocus").classList.add('mainFocusActive');
		// 切换窗口内容
		refleshIframeLeft(currentElemInBottomTitleIndex);
		currentFocusFiled = FocusFiled_BottomTitle;// 切换到下标题区	
	};
}
function titleSwithWindow() {// 鼠标点击标题的事件
	for (var i = 0; i < titleList.length; ++i) {
		(function(n) {
			titleList[n].onclick = function(e) {
				//console.log("panly message currentElemInBottomTitleIndex :" + currentElemInBottomTitleIndex + ";n :" + n);
				if (currentFocusFiled == FocusFiled_BottomTitle) {
					if (currentElemInBottomTitleIndex == n) {return;}
				} else if (currentFocusFiled == FocusFiled_page) {
					// 原来页面区的焦点失去
					switchLoseFocusOnPage(currentFocusObj,currentFocusBorderEle);
				}
				// 在换页前，把原来的页恢复原样
				iframeList[currentElemInBottomTitleIndex].classList.remove('active');
				iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
				// 离开tab页
				//actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex);
				// 换页前恢复之前的tab标题的显示
				titleList[currentElemInBottomTitleIndex].style.visibility = 'visible';
				// 离开tab页
				actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex);
				currentElemInBottomTitleIndex = n;
				// 切换窗口内容
				refleshIframeLeft(n);
				// 换页的内容
				switchFocusOnTitle(titleList[n]);
				// 进入tab页
				actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex);
			};
		})(i);
	}// for
}

var usbToOther = 1;
sessionStorage.pipWindow = 0;
function refleshIframeLeft(CurrentElemInBottomTitleIndex) {
	if(!iframeList[currentElemInBottomTitleIndex].classList.contains('active')){
		iframeList[currentElemInBottomTitleIndex].classList.add('active');
	}
	if (iframeListDiv_0[currentElemInBottomTitleIndex].id == "tvPage") 
    {
        tcl.channel.requestMute(0);
        if (sessionStorage.pipWindow=="0")
        {
            if (tcl.setting.isHDScreen == 1) 
            {
                tcl.setting.scaleVideoWindow(95, 223, 1016, 573);
            } 
            else 
            {
                tcl.setting.scaleVideoWindow(68, 158, 723, 407);
            }
            if (tcl.channel.inputSource != top.lastInputSource)
            {
                if (top.lastInputSource == 0 || top.lastInputSource == 1)
                {
                    tcl.channel.inputSource = top.lastInputSource;
                }
                else
                {
                    tcl.channel.requestInputSource(top.lastInputSource);
                }
            }
            sessionStorage.pipWindow = 1;
        }
        usbToOther = 1;
	}
    else
    { 
        if (usbToOther)
        {
            setTimeout(function(){tcl.channel.requestMute(1);},200);
            usbToOther = 0;
        }
    }

}

function focusOnTitleCommon(obj)
{
	$("mainFocus").innerHTML = obj.innerHTML; // 这个标题里面，会含有空格
	// 取原来的标题的left的值，然后再减去130px，定位获得焦点后的标题的left的值
	$("mainFocus").style.left
	=  getAbsCoorPoint(obj) + parseInt(obj.offsetWidth/2) - parseInt($("mainFocus").offsetWidth/2) - parseInt(getAbsCoorPoint($("title"))) + 'px' ;	
	//$("mainFocus").style.background = "url('images/quote/Tab_Focus.png')";	
	obj.style.visibility = 'hidden';	
}
function switchFocusOnTitle(obj) {// 点击标题，标题的焦点产生变化的函数
	// 切换标题样式
	focusOnTitleCommon(obj);
	$("mainFocus").classList.add('mainFocusActive');
	currentFocusFiled = FocusFiled_BottomTitle;// 切换到下标题区
}

function switchLoseFocusOnTitle(obj) {// 点击标题，标题的焦点产生变化的函数
// 切换标题样式
	focusOnTitleCommon(obj);
	$("mainFocus").setAttribute('class','');
}

function trim(str) { // 删除左右两端的空格
	return str.replace(/(^\s*)|(\s*$)/g, "");
}

function switchFocusOnPage(obj, focusObj) {//obj被集焦，显示焦点框图
	pressOkObject = obj;
	focusObj.style.visibility = 'visible';
	// obj.style.border='5px solid #00BBFB';
	// obj.style.transform ='scale(1.07,1.07)';
	// focusObj.style.transform ='scale(1.07,1.07)';
	//changeClassName(obj, "topShow", "bottomShow");
	scrollBlockTitile(obj);
}
function switchLoseFocusOnPage(obj, focusObj) {// obj失去焦点，隐藏焦点框图
	focusObj.style.visibility = 'hidden';
	
	// obj.style.border='5px solid transparent';
	// obj.style.transform ='none';
	// focusObj.style.transform ='none';
	//changeClassName(obj, "bottomShow", "topShow");
	scrollBlockTitileStop(obj);
}

function changeClassName(obj, addClassname, deleteClassname) {// 改变class的属性值，改变层级关系(z-index)用到
	delClassName(obj, deleteClassname);
	addClassName(obj, addClassname);
}
function addClassName(obj, addClassname) {// 增加一个className
	if(!obj.classList.contains(addClassname)){
		obj.classList.add(addClassname);
	}
}
function delClassName(obj, deleteClassname) {// 减少一个className
	if(obj.classList.contains(deleteClassname)){
		obj.classList.remove(deleteClassname);
	}
}

function switchFocusOnTopTitle(obj) {// 点击标题，标题的焦点产生变化的函数
	pressOkObject = obj;
	// obj.style.border='5px solid #00BBFB';
	addClassName(obj, "btn");
}
function switchLoseFocusOnTopTitle(obj) {// 点击标题，标题的焦点产生变化的函数
	// obj.style.border='none';
	delClassName(obj, "btn");
}

function swithcWindow(url) {
	window.location = (url);
}
function getBackBlockId(id){//二级返回集焦到blockId
	if(id){		
		currentFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(id);
		//var focusBorderValue = currentFocusObj.getAttribute('data-focus_id');
		currentFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(currentFocusObj.getAttribute('data-focus_id'));
		//当前OK对象
		switchFocusOnPage(currentFocusObj,currentFocusBorderEle);
	}
}

function scrollBlockTitileStop(obj)//缩略显示videoname
{
	console.log("scrollBlockTitileStop  + scroll_flag :"+ scroll_flag);
	if (scroll_flag == 1) {
		try{
		var targetObj= obj.getElementsByClassName("elem_block_title")[0];
	    }catch(e){console.log("e.message "+ e.message);scroll_flag=0;return;}
        if(!targetObj) {console.log("there has no span ");scroll_flag=0;return;}

		targetObj.innerHTML = currentBlockName;
		scroll_flag =0;		
	}
}

function scrollBlockTitile(obj)//滚动显示videoname
{
	console.log("scrollBlockTitile start  scroll_flag :" + scroll_flag);
	try{
 		var targetObj = obj.getElementsByClassName("elem_block_title")[0];
    }catch(e){
        console.log("e.message "+ e.message);
        scroll_flag=0;
        return;
    }
    if(!targetObj) {
        console.log("there has no span ");
        scroll_flag=0;
        return;
    }
    var tempString = targetObj.innerHTML;	
	if(tempString.indexOf("</marquee>") != -1){
		console.log("scrollBlockTitile targetObj.innerHTML include  </marquee>:" + tempString);
		scroll_flag=1;
		return;
	}
	if(checkStrNullOrEmpty_next(tempString)){
		console.log("scrollBlockTitile targetObj.innerHTML is checkStrNullOrEmpty_next:" + tempString);
		scroll_flag=0;
		return;
	}
	currentBlockName = scaleplate_span.innerHTML = tempString;
	if(parseInt(scaleplate_span.offsetWidth)>parseInt(targetObj.offsetWidth))
    {
		console.log("scrollBlockTitile entered :");
		targetObj.innerHTML = '<marquee behavior="scroll" align="middle" direction="left" scrollamount="10" >' + currentBlockName + '</marquee>';
		scroll_flag=1;
    }
	console.log("scrollBlockTitile end  scroll_flag :" + scroll_flag);
}

function actionThree_tabDuritionTime_IN(currentElemInBottomTitleIndex) {
	// 专题/Tab时长数据
	var currentTabObj = titleList[currentElemInBottomTitleIndex];
	var NowTime = getCurrentTime();
	var sourcefrom = "";
	var ids = "";

	sourcefrom = currentTabObj.getAttribute('data-sourcefrom');
	if (checkStrNullOrEmpty_next(sourcefrom)) {
		sourcefrom = "0";
	}
	ids = currentTabObj.getAttribute('data-ids');
	if (checkStrNullOrEmpty_next(ids)) {
		ids = "0";
	}
	var tabDuritionTimeStr = "3\t" + NowTime + "\t0\t1\t" + sourcefrom + "\t"
			+ ids;
	addChar(tabDuritionTimeStr);
}
function actionThree_tabDuritionTime_OUT(currentElemInBottomTitleIndex) {
	// 专题/Tab时长数据
	var currentTabObj = titleList[currentElemInBottomTitleIndex];
	var NowTime = getCurrentTime();
	var sourcefrom = "";
	var ids = "";
	sourcefrom = currentTabObj.getAttribute('data-sourcefrom');
	if (checkStrNullOrEmpty_next(sourcefrom)) {
		sourcefrom = "0";
	}
	ids = currentTabObj.getAttribute('data-ids');
	if (checkStrNullOrEmpty_next(ids)) {
		ids = "0";
	}

	var tabDuritionTimeStr = "3\t" + NowTime + "\t0\t2\t" + sourcefrom + "\t"
			+ ids;
	addChar(tabDuritionTimeStr);
}
function actionFour_tabOrder() {
	// 只考虑行为是“移动”的,用户Tab显示/隐藏顺序数据
	var NowTime = getCurrentTime();
	// 获取tmp_id
	var tmp_id = "";

	tmp_id = $("commonDataSource").getAttribute('data-tmp_id');
	if (checkStrNullOrEmpty_next(tmp_id)) {
		tmp_id = "0";
	}
	// 获取tab_ids
	var Tab_ids = "";
	Tab_ids = titleList[0].getAttribute('data-id');
	if (checkStrNullOrEmpty_next(Tab_ids)) {
		Tab_ids = "0";
	}
	var temp_Tab_ids;
	for (var i = 1; i < titleList.length - 1; i++) {
		temp_Tab_ids = titleList[i].getAttribute('data-id');
		if (checkStrNullOrEmpty_next(temp_Tab_ids)) {
			temp_Tab_ids = "0";
		}
		Tab_ids += "_" + temp_Tab_ids;

	}
	var tabOrderStr = "4\t" + NowTime + "\t0\t0\t0\t" + tmp_id + "_0_0_0\t" + Tab_ids + "\t0";
	addChar(tabOrderStr);
}
//上报数据的函数结束---------------------------------------------------------end------------------------------------------------------------------
function FocusId(id , page )
{		
	if(openByRemoteFlag){
		openByRemoteFlag = 0;
		return;
	}
	if(currentFocusFiled == FocusFiled_page)
	{
		nextFocusObj=iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(id);
		nextFocusBorderEle=iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(nextFocusObj.getAttribute('data-focus_id'));
		currentFocusBorderEle=iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(currentFocusObj.getAttribute('data-focus_id'));
		switchLoseFocusOnPage(currentFocusObj, currentFocusBorderEle);
        if(top.checkNetStatus() == true)//top.checkNetStatus()==false
        {
            switchFocusOnPage(nextFocusObj, nextFocusBorderEle);
        }
		currentFocusObj = nextFocusObj;
		currentFocusBorderEle = nextFocusBorderEle;
		var nextAbsCoorPoint_n = getAbsCoorPoint(nextFocusObj);
		if ( (nextAbsCoorPoint_n+ nextFocusObj.offsetWidth + iframeEndLeft) > windowScreenWidth) 
		{// 如果将要集焦的元素在屏幕右边，则需要把它左移到屏幕里来
					if (nextFocusObj.getAttribute('data-right') == "-1") {
						// 增加一个判断，防止移到最后，由于移的过头，右边出现空白
						iframeListDiv_0[currentElemInBottomTitleIndex].style.left = (parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left)
								+ windowScreenWidth
								- nextAbsCoorPoint_n - nextFocusObj.offsetWidth)
								- iframeEndLeft + 'px';
					} else {
						iframeListDiv_0[currentElemInBottomTitleIndex].style.left = (parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left) 
								+ windowScreenWidth
								- nextAbsCoorPoint_n - nextFocusObj.offsetWidth) - iframeEndLeft  + 'px';
					}
				}
			else if (nextAbsCoorPoint_n < iframeStartLeft) {
					// 如果将要集焦的元素在屏幕左边，则需要把它左移到屏幕里来
					var temp = parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left);
					iframeListDiv_0[currentElemInBottomTitleIndex].style.left
					= (temp - nextAbsCoorPoint_n) > 0 ? 0: (temp - nextAbsCoorPoint_n + iframeStartLeft) + 'px';
				}
	}
	else if(currentFocusFiled == FocusFiled_BottomTitle)
	{
		currentFocusFiled = FocusFiled_page;// 进入页面区
			// 当前标题去掉焦点图片
		//switchLoseFocusOnTitle(titleList[currentElemInBottomTitleIndex]);// 这种不用切换窗口
		  $("mainFocus").classList.remove('mainFocusActive');
			// 查找最左下角的元素
			 currentFocusObj = iframeList[currentElemInBottomTitleIndex].contentWindow.document.getElementById(id);
			currentFocusBorderEle = iframeList[currentElemInBottomTitleIndex].contentWindow.document
					.getElementById(currentFocusObj
							.getAttribute('data-focus_id'));
    		//当前节点坐标
			nextAbsCoorPoint_n = getAbsCoorPoint(currentFocusObj);
			// 如果当前的节点时第一个节点，左边需要空iframeEndLeft的边距出来
			if (currentFocusObj.getAttribute('data-left') == "-1") {
				iframeListDiv_0[currentElemInBottomTitleIndex].style.left = '0px';
			}else if (nextAbsCoorPoint_n < iframeStartLeft) {// 如果将要集焦的元素在屏幕左边，则需要把它左移到屏幕里来
				iframeListDiv_0[currentElemInBottomTitleIndex].style.left = parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left)
						- nextAbsCoorPoint_n - blockBorderWidth + iframeStartLeft + 'px';
			}else if ( (nextAbsCoorPoint_n+ currentFocusObj.offsetWidth + iframeEndLeft) > windowScreenWidth) 
			{//增加了选择最左边元素的情况
				if (currentFocusObj.getAttribute('data-right') == "-1") {
					// 增加一个判断，防止移到最后，由于移的过头，右边出现空白
					iframeListDiv_0[currentElemInBottomTitleIndex].style.left = (parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left)
							+ windowScreenWidth
							- nextAbsCoorPoint_n - currentFocusObj.offsetWidth)
							- iframeEndLeft + 'px';
				} else {
					iframeListDiv_0[currentElemInBottomTitleIndex].style.left = (parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left) 
							+ windowScreenWidth
							- nextAbsCoorPoint_n - currentFocusObj.offsetWidth) - iframeEndLeft  + 'px';
				}
			}
			switchFocusOnPage(currentFocusObj, currentFocusBorderEle);						
	}
    if( page != "tv")
    {
        sessionStorage.tabListIndex = currentElemInBottomTitleIndex;//鼠标点击记录焦点事件
        sessionStorage.blockId = pressOkObject.getAttribute('id');
        sessionStorage.currentBodyOffset = parseInt(iframeListDiv_0[currentElemInBottomTitleIndex].style.left);	    
    }
    
}

function addCacheEventListener()
{
	applicationCache.addEventListener("cached",cached,true);
	applicationCache.addEventListener("updateready",updateready, true);
	applicationCache.addEventListener("noupdate",noupdate , true);
	applicationCache.addEventListener("error", error, true);
	
    applicationCache.addEventListener("checking",checking, true);
    applicationCache.addEventListener("downloading",downloading , true);
    applicationCache.addEventListener("progress",progress, true);
}

var cached = function()
{
	console.log("---------------index.js------cached-----------------");
	top.cached = true;
};

var updateready = function()
{
	console.log("---------------index.js------updateready-----------------");
	top.updateready = true;
};

var noupdate = function()
{
	console.log("---------------index.js------noupdate-----------------");
	top.noupdate = true;
};

var error = function()
{
	console.log("---------------index.js------error-----------------");
	top.error = true;
};


var checking = function()
{
	console.log("---------------index.js------checking-----------------");
	top.checking = true;
};

var downloading = function()
{
	console.log("---------------index.js------downloading-----------------");
	top.downloading = true;
};

var progress = function()
{
//	console.log("---------------index.js------progress-----------------");
	top.progress = true;
};



function changeFocus( clickItem )// change topItem focus by click
{ 
	if( toptitleList[currentElemInTopTitleIndex].id != clickItem )
	{
		switchLoseFocusOnTopTitle(toptitleList[currentElemInTopTitleIndex]);// 原来的失去焦点
		while(true)
		{
			currentElemInTopTitleIndex = (currentElemInTopTitleIndex <= 0) ? (toptitleList.length - 1) : (currentElemInTopTitleIndex - 1);
			if (toptitleList[currentElemInTopTitleIndex].id == clickItem )
			{
				break;
			}
		}
	}
    onBodyBlur();
}

function systemEventHandle(evt)
{
    var msg = evt.which;
	var p1 = evt.modifiers;
    console.log("in homepage receive event "+msg);
    switch (msg)
    {
        case E_APP_CLOSE:
            console.log("in homepage: the app closed");
            //tcl.media.setMediaUnmute();
            if(top.virtualRemoteState == 1)
			{
				top.document.getElementById("virtualRemote").contentWindow.hideVirtualRemote();//隐藏虚拟遥控器--lqt
			}
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
            else if (top.scheduleApp == top.SCHEDULE_DIAL)
            {
                top.scheduleApp = 0;
                top.g_ulits.sendMsgToApplication("T-DIAL",E_APP_PROCESS_READY);
                return;
            }
            else if (top.scheduleApp != top.SCHEDULE_TV)
            {
                if (top.lastInputSource == 0 || top.lastInputSource == 1)
                {
                    setTimeout(function(){
                        top.g_channel.inputSource=top.lastInputSource;
                        if (top.scheduleApp != top.SCHEDULE_TV)
                        {
                            tcl.channel.requestMute(1);
                        }
                    },100);
                }
                else
                {
                    tcl.channel.requestInputSource(top.lastInputSource);
                }
            }
            
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
            else if(top.scheduleApp == top.SCHEDULE_SWITCHSRC)
            {
                top.scheduleApp = 0;
                top.appOpenFlag = 0;
                top.toswitchSource(top.lastInputSource);
                return;
            }
            else if(top.scheduleApp == top.SCHEDULE_MEDIA)
            {
                top.scheduleApp = 0;
                top.appOpenFlag = 0;
                var usbLock = top.g_factory.usbLock;
                var hotelEnable = top.g_factory.hotelEnable;
                if(top.g_temp=="homePage")
                {
                    delete sessionStorage.tabListIndex;//删除launcher记忆的tab
                }
                if((usbLock) && (hotelEnable))
                {
                    top.$('main').src = "password.html?usbLock";
                    top.main.focus();
                }  
                else
                {
                    top.$('main').src = "deviceList.html";
                }
                return;
            }

            if(top.scheduleApp == top.SCHEDULE_TV)
            {
                var inputSource=top.g_channel.inputSource;
                //console.log("in inde  inputSource ="+ inputSource);
                top.$("operatePage").src = "";
                top.$("otherPage").src = "";
                top.g_previousHtmlPage = "channelPlay.html";
                top.g_remindWord = "TvHotKey";
                top.$("main").src = "intermediate.html";
                top.requestFocus(top.main, 1);
            }
            if(tcl.setting.isHDScreen==1)
            {
                tcl.setting.scaleVideoWindow(0,0,0,0);
            }
            else
            {
                tcl.setting.scaleVideoWindow(0,0,0,0);
            }
            
            top.appOpenFlag = 0;
            tcl.setting.contextOf5in1   = top.CONTEXT_HOME_PAGE;
            top.g_ulits.setKeySet(0x1|0x2|0x4|0x8|0x10|0x20|0x40|0x80|0x100|0x200|0x400|0x800,0,2);
            //top.$("main").style.display="block";
            top.main.document.body.style.display = "block";
            top.$("operatePage").style.display="block";
            top.$("otherPage").style.display="block";
            top.$("globleShow").style.display="block";
            if (top.scheduleApp != top.SCHEDULE_TV)
            {
                tcl.channel.requestMute(1);
            }
            else
            {
                top.scheduleApp = 0;
            }
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
            onBodyBlur();
            updateUSB();
            for (var i = 0; i < iframeList.length; i++)
            {
                if (iframeListDiv_0[i].id == "tvPage")
                {
                    iframeList[i].contentWindow.updateSource();
                    break;
                }
            }
            top.systemEventProc(evt);
            break;
        case E_MEDIA_USB_REMOVE:
        case E_MEDIA_USB_REMOVE_OTHER:
            for (var i = 0; i < iframeList.length; i++)
            {
                if (iframeListDiv_0[i].id == "tvPage")
                {
                    iframeList[i].contentWindow.updateSource();
                    break;
                }
            }
            updateUSB();
            break;
        case E_NETWORK_CONNECT_TEST_SUCCESS:
        case E_NETWORK_CONNECT_TEST_FAIL:
        case E_WIRE_CONNECT_SUCCESS:
        case E_WIRELESS_CONNECT_SUCCESS:
        case E_WIRE_CONNECT_FAILURE:
        case E_WIRELESS_CONNECT_FAILURE:
            updateNetwork();
            top.systemEventProc(evt);
            break;
        case E_APP_PROCESS_INITIALIZATION:
            top.systemEventProc(evt);
            break;
        case E_TERMINAL_MANAGER_START:
        case E_TV_FAULT_DIAGNOSIS_CONNECT_ON:
        case E_TV_FAULT_DIAGNOSIS_CONNECT_OFF:
            top.systemEventProc(evt);
            break;
        case E_SRC_CHANGE_SET_INPUT_SOURCE:
            for (var i = 0; i < iframeList.length; i++)
            {
                if (iframeListDiv_0[i].id == "tvPage")
                {
                    iframeList[i].contentWindow.updateSource();
                    break;
                }
            }
			top.systemEventProc(evt);
            break;
        case E_SS_NO_CI_MODULE:
        case E_SS_INVALID_SERVICE://invalid service
        case E_SS_SCRAMBLED_PROGRAM:// screamble
        case E_SS_AUDIO_ONLY://audio only
        case E_SS_DATA_ONLY://data only
        case E_SIGNAL_UNLOCK://unlock signal
        case E_PVR_NO_SIGNAL:
        case E_SIGNAL_LOCK://lock signal
        case E_DTV_SS_RUNNING_STATUS_NOT_RUNNING:
        case E_SS_COMMON_VIDEO:
        case E_SS_CH_BLOCK:
        case E_SS_PARENTAL_BLOCK:
        case E_DTV_SS_INPUT_BLOCK:
        {
            for (var i = 0; i < iframeList.length; i++)
            {
                if (iframeListDiv_0[i].id == "tvPage")
                {
                    iframeList[i].contentWindow.showCurrentChannelInfo();
                    break;
                }
            }
            if(top.appOpenFlag==0 && top.isGingaOn && top.GingaObj.isInit == top.GingaStates.True)
            {
                top.systemEventProc(evt);
            }
            break;
        }
        case E_DTV_SERVICE_PLAY:
        case E_CHANNEL_PLAY_END:
        case E_TV_EXCHANGE_END:
        case E_DTV_EPG_PF_FINISH:
        {
            for (var i = 0; i < iframeList.length; i++)
            {
                if (iframeListDiv_0[i].id == "tvPage")
                {
                    iframeList[i].contentWindow.showCurrentChannelInfo();
                    break;
                }
            }
            if(top.appOpenFlag==0)
            {
                top.systemEventProc(evt);
            }
            break;
        }
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

function openSource()
{
    top.$("operatePage").onload = function(){
        top.resetFramePacking3DMode();
        top.$("operatePage").onload = function(){};
    }
    top.$('operatePage').src = "inputSource.html";
    top.requestFocus(top.operatePage, 0);
    if(top.g_isDownloading == 0){
        top.g_isDownloading = 1;
        tcl.setting.restartDownloadUpdateFile();
    }
}

function openSetting()
{
    top.$("operatePage").onload = function(){
        top.resetFramePacking3DMode();
        top.$("operatePage").onload = function(){};
    }
    top.$('operatePage').src = "index.html";
    top.requestFocus(top.operatePage, 0);
    if(top.g_isDownloading == 0){
        top.g_isDownloading = 1;
        tcl.setting.restartDownloadUpdateFile();
    }
}
