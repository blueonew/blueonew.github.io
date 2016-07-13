

var source;
var currentSource;
var currSourceList = 0;
var sourceList =
[
	{name:"TV",   id:"0",  icon:"http://s3.tcllauncher.com/html5/images/TV.png?md5=49b59bfa2a1f52e3231f1c4aff710532",    icon_disable:"http://s3.tcllauncher.com/html5/images/TV_disable.png?md5=9df64cd2aec7a0da1541a9a054d9fece"},
	{name:"TV",   id:"1",  icon:"http://s3.tcllauncher.com/html5/images/TV.png?md5=49b59bfa2a1f52e3231f1c4aff710532",    icon_disable:"http://s3.tcllauncher.com/html5/images/TV_disable.png?md5=9df64cd2aec7a0da1541a9a054d9fece"},
	{name:"AV",  id:"2",  icon:"http://s3.tcllauncher.com/html5/images/av.png?md5=0f924d3575dd723c97956c5a314f70cf", icon_disable:"http://s3.tcllauncher.com/html5/images/av_disable.png?md5=8834307fdf3fe516d69d503aa67cdf6c"},
	{name:"AV1",  id:"3",  icon:"http://s3.tcllauncher.com/html5/images/av.png?md5=0f924d3575dd723c97956c5a314f70cf", icon_disable:"http://s3.tcllauncher.com/html5/images/av_disable.png?md5=8834307fdf3fe516d69d503aa67cdf6c"},
	{name:"AV",   id:"11", icon:"http://s3.tcllauncher.com/html5/images/scart.png?md5=d05a8ed87122724d605fe333488d2140", icon_disable:"http://s3.tcllauncher.com/html5/images/scart_disable.png?md5=6aefdc058936bc89488d47df03769542"},
	{name:"CMP",  id:"4",  icon:"http://s3.tcllauncher.com/html5/images/cmp.png?md5=2f49834a2ff468b06579e0d01998f689", 	 icon_disable:"http://s3.tcllauncher.com/html5/images/cmp_disable.png?md5=48de5dade54995011c1e358f43f79af5"},
	{name:"HDMI1",id:"6",  icon:"http://s3.tcllauncher.com/html5/images/HDM1.png?md5=e61583c22ae5a0432c970d9fc18249c1",  icon_disable:"http://s3.tcllauncher.com/html5/images/HDM1_disable.png?md5=9ee3f2f1ea7b6c85a3f62a03acacaa4a"},
	{name:"HDMI2",id:"7",  icon:"http://s3.tcllauncher.com/html5/images/HDM1.png?md5=e61583c22ae5a0432c970d9fc18249c1",  icon_disable:"http://s3.tcllauncher.com/html5/images/HDM1_disable.png?md5=9ee3f2f1ea7b6c85a3f62a03acacaa4a"},
	{name:"HDMI3",id:"8",  icon:"http://s3.tcllauncher.com/html5/images/HDM1.png?md5=e61583c22ae5a0432c970d9fc18249c1",  icon_disable:"http://s3.tcllauncher.com/html5/images/HDM1_disable.png?md5=9ee3f2f1ea7b6c85a3f62a03acacaa4a"},
	{name:"HDMI4",id:"12", icon:"http://s3.tcllauncher.com/html5/images/HDM1.png?md5=e61583c22ae5a0432c970d9fc18249c1",  icon_disable:"http://s3.tcllauncher.com/html5/images/HDM1_disable.png?md5=9ee3f2f1ea7b6c85a3f62a03acacaa4a"},
	{name:"Media",id:"10", icon:"http://s3.tcllauncher.com/html5/images/USB.png?md5=f46491811162abaf76b1f90a26f69d59",   icon_disable:"http://s3.tcllauncher.com/html5/images/USB_disable.png?md5=a961e3b11f2c7eb403083402bfaa9020"},
    {name:"VGA",id:"5", icon:"http://s3.tcllauncher.com/html5/images/VGA.png?md5=13047b164c61861c7fa5cb12f84b4b9e",   icon_disable:"http://s3.tcllauncher.com/html5/images/VGA_disable.png?md5=e79812d676f4beeeaa6de3ff9cddde09"},
];


function init()
{
    if (parent.isCache)
    {
        return;
    }
	//得到Source数组
	currSourceList = getSources();
	
	//得到显示信源的div
	var tvPageDivs = document.getElementById("tvPage").getElementsByClassName("elem");
	var tvPageFocusDivs = document.getElementById("tvPage").getElementsByClassName("elem_border");
	//为每个位置增加点击函数、图片、信源名字
	for(var i = 0 ;i<currSourceList.length;i++)
	{
		var source = currSourceList[i];
		tvPageDivs[i+1].sourceId = source.getId();
		tvPageDivs[i+1].onclick = function()
		{
			jumpToSouce(this.sourceId);
  		};

		tvPageFocusDivs[i+1].sourceId = source.getId();
		tvPageFocusDivs[i+1].onclick = function()
		{
			jumpToSouce(this.sourceId);
		};
		tvPageDivs[i+1].getElementsByTagName("img")[0].src = ""+source.getIcon();
		tvPageDivs[i+1].getElementsByTagName("span")[0].innerHTML = ""+source.getName();
        var downPosition = i+1+3;
        var rightPosition = i+1+1;
        if (downPosition>9)
        {
            downPosition = 0;
        }
		else if (downPosition>currSourceList.length)
        {
            downPosition = currSourceList.length;
        }
        if (rightPosition>currSourceList.length)
        {
            tvPageDivs[i+1].setAttribute("data-right","-1");
        }
        if (downPosition==0)
        {
            tvPageDivs[i+1].setAttribute("data-down","0");
        }
        else
        {
            tvPageDivs[i+1].setAttribute("data-down","tv_0"+downPosition);
        }
	}
    showCurrentChannelInfo(); 
}

function updateSource()
{
    if (currSourceList == 0)
    {
        return;
    }
	
	//得到显示信源的div
	var tvPageDivs = document.getElementById("tvPage").getElementsByClassName("elem");
	//为每个位置增加点击函数、图片、信源名字
	for(var i = 0 ;i<currSourceList.length;i++)
	{
		var source = currSourceList[i];

		tvPageDivs[i+1].getElementsByTagName("img")[0].src = ""+source.getIcon();	
	}
}

//得到 当前电视所 支持的信源
function getSources()
{
	var showSourceList = new Array();
	var setting = tcl.setting;
	

    if((top.supportATVSource == 1) || (top.supportDTVSource == 1)||(setting.getProperty("ro.sita.model.LiveTV.TV","FALSE") == "TRUE"))//if (setting.getProperty("ro.sita.model.LiveTV.TV","FALSE") == "TRUE")
    {
    	 var currentChannel = tcl.channel.getCurrentChannelInfo();
    	 if(currentChannel.number != 0)
    	 {
    	 	currentSource = getSourceBySourceId(currentChannel.serviceType?1:0);
    	 }
    	 else
    	 {
        	currentSource = getSourceBySourceId(1);
         }
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
		showSourceList.push(source);
    }

    if (top.supportSCARTSource == 1||setting.getProperty("ro.sita.model.LiveTV.SCART","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(11);
        if (0/*tcl.setting.getProperty("ro.sita.model.MODEL_REGION_NAME_CFG.REGION_NAME", "EU") == "AU"*/)
        {
            var tmp = getSourceBySourceId(2);
            source = new Source(currentSource.name,currentSource.id,tmp.icon,tmp.icon_disable);
        }
        else
        {
            source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
        }
		showSourceList.push(source);
    }
    else if(top.supportAV1Source == 1||setting.getProperty("ro.sita.model.LiveTV.AV","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(2);
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
        showSourceList.push(source);
    }
    else if(top.supportAV2Source == 1||setting.getProperty("ro.sita.model.LiveTV.AV2","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(3);
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
        showSourceList.push(source);
    }

    if (top.supportYPBPRSource == 1||setting.getProperty("ro.sita.model.LiveTV.YPBPR","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(4);
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
        showSourceList.push(source);
    }
    if (top.supportHDMI1Source == 1||setting.getProperty("ro.sita.model.LiveTV.HDMI1","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(6);
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
		showSourceList.push(source);
    }
    if (top.supportHDMI2Source == 1||setting.getProperty("ro.sita.model.LiveTV.HDMI2","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(7);
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
		showSourceList.push(source);
    }
    if (top.supportHDMI3Source == 1||setting.getProperty("ro.sita.model.LiveTV.HDMI3","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(8);
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
        showSourceList.push(source);
    }
    if (top.supportHDMI4Source == 1||setting.getProperty("ro.sita.model.LiveTV.HDMI4","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(12);
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
        showSourceList.push(source);
    }
    if (top.supportVGASource == 1||setting.getProperty("ro.sita.model.LiveTV.VGA","FALSE") == "TRUE")
    {
        currentSource = getSourceBySourceId(5);
        source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
        showSourceList.push(source);
    }
    
    //默认Media信源是显示的
    currentSource = getSourceBySourceId(10);
    source = new Source(currentSource.name,currentSource.id,currentSource.icon,currentSource.icon_disable);
    showSourceList.push(source);
	
	return showSourceList;
}


function getSourceBySourceId(SourceId)
{
	for(var i = 0;i<sourceList.length;i++)
	{
		if(SourceId == sourceList[i].id)
		{
            if (SourceId != "0" && SourceId != "1")
            {
                var index = tcl.channel.inputSourceDeviceName(SourceId);
				if(index != 0)
				{
					sourceList[i].name = top.sysInputSet[index];
				}
            }
			return sourceList[i];
		}
	}
}


function Source(name,id,icon,icon_disable)
{
	this.name = name;
	this.id   = id;
	this.icon = icon;
    this.icon_disable = icon_disable;
	
	this.getName = function()
	{
		return this.name;
	};
	this.getId = function()
	{
		return this.id;
	};
	this.getIcon = function()
	{
        if (tcl.setting.isSourceInsert(this.id))
        {
            return this.icon;
        }
        else if (this.id == 10 && tcl.media.deviceStatus())
        {
            return this.icon;
        }
        else if (this.id != 10 && this.id == tcl.channel.inputSource)
        {
            return this.icon;
        }
        else
        {
            return this.icon_disable;
        }
	};
}

function showCurrentChannelInfo()
{
	var signalStatus = tcl.channel.currentSignalStatus;
	
	if(tcl.channel.inputSource==1)
	{
		var screenMode = tcl.channel.currentScreenSaverMode;
		if(!signalStatus && top.inputLock == 0)
		{
			document.getElementById("currentProgramRemind").innerHTML = top.screenSavers[1];
			document.getElementById("currentProgramRemind").style.display = "block";
		}
		else if (screenMode == 3 || screenMode==1)
		{
			document.getElementById("currentProgramRemind").innerHTML = top.screenSavers[2];
			document.getElementById("currentProgramRemind").style.display = "block";
		}
		else if (screenMode == 6)
		{
			document.getElementById("currentProgramRemind").innerHTML = top.screenSavers[4];
			document.getElementById("currentProgramRemind").style.display = "block";
		}
		else
		{
			document.getElementById("currentProgramRemind").style.display = "none";
		}
		
	}
	else
	{
		if(!signalStatus && top.inputLock == 0 )
		{
			document.getElementById("currentProgramRemind").innerHTML = top.screenSavers[1];
			document.getElementById("currentProgramRemind").style.display = "block";
		}
		else
		{
			document.getElementById("currentProgramRemind").style.display = "none";
		}
	}
    
    var tvPageDivs = document.getElementById("tvPage").getElementsByClassName("elem");
	for(var i = 0 ;i<currSourceList.length;i++)
	{
		var source = currSourceList[i];
		tvPageDivs[i+1].getElementsByTagName("img")[0].src = ""+source.getIcon();
	}
}

