//20160624
/*sports function*/

var slist;
var glist;
var dlist;
var dlistx;
var schedules;
var sposition = 1;
var gposition = 1;
var tposition = 0;
var steppixel = 322;
var pageOffset = 0;
var baroffset = 0;
var page = 0; //0 score 1 schedule 2 team 3 teamschedule 4 final
var path = "http://sports.tcllauncher.com/sports-api/v1/";
document.onkeydown = keyHandle;
top.g_temp="homePage";

function keyHandle(evt)
{
    var keycode = evt.which;
    console.log("sports "+keycode);
    switch(keycode)
    {
        case VK_LEFT:
            if (page==0)
            {
                changeGroup(-1);
            }
            else if (page==1)
            {
                changeSchedule(-1);
            }
            else if (page==2)
            {
                updateTeamFocus(-1);
            }
            break;
        case VK_RIGHT:
            if (page==0)
            {
                changeGroup(1);
            }
            else if (page==1)
            {
                changeSchedule(1);
            }
            else if (page==2)
            {
                updateTeamFocus(1);
            }
            break;
        case VK_UP:
            if (page==2)
            {
                updateTeamFocus(-6);
            }
            else if (page==3)
            {
                updatePage(-1);
            }
            break;
        case VK_DOWN:
            if (page==2)
            {
                updateTeamFocus(6);
            }
            else if (page==3)
            {
                updatePage(1);
            }
            break;
        case VK_ENTER:
            if (page==2)
            {
                window.location = "schedulebyteam.html?" + document.getElementsByClassName("team")[tposition].getAttribute("team");
            }
            break;
        case VK_BACK:
            if (page==0 || page==1 || page==4)
            {
                if (top.enableUpdateScreen)
                {
                    top.enableUpdateScreen(false);
                }
                window.location = top.getHomepage();
            }
            else if (page==2)
            {
                window.location = "schedule.html";
            }
            else if (page==3)
            {
                window.location = "teams.html";
            }
            break;
        case VK_EXIT:
        case VK_HOME:
            if (top.enableUpdateScreen)
            {
                top.enableUpdateScreen(false);
            }
            window.location = top.getHomepage();
            break;
        case VK_OPTION:
            if (page==1)
            {
                window.location = "teams.html";
            }
            break;
        case VK_POWER://power
        case VK_NETFLIX:
        case VK_YOUTUBE:
        case VK_INTERNET:
        case VK_PANEL_LONG_OK:
        case VK_PANEL_OK:
		case VK_PANEL3_DOWN://按面板左侧键，-,（三键面板）
		case VK_PANEL3_UP://按面板右侧键，+,（三键面板）
		case VK_PANEL3_OK://按面板菜单键,（三键面板）
		case VK_PANEL3_LONG_OK://长按面板菜单键（三键面板）
        case VK_PANEL_LEFT:
        case VK_PANEL_RIGHT:
        case VK_PANEL_DOWN:
        case VK_PANEL_UP:
        case VK_MUTE:
        case VK_VOLUME_DOWN:
        case VK_VOLUME_UP:
        case VK_MENU:
        case VK_SOURCE:
            top.keyDownProcess(evt);
            break;
        default:
            break;
    }
    return false;
}

function changeSchedule(offset)
{
    if (dlist)
    {
        sposition = sposition + offset;
        if (sposition>=dlist.length)
        {
            sposition = dlist.length - 1;
        }
        else if (sposition<0)
        {
            sposition = 0;
        }
        showdate(sposition);
    }
}

function changeGroup(offset)
{
    if (glist)
    {
        gposition = gposition + offset;
        if (gposition>=glist.length)
        {
            gposition = glist.length - 1;
        }
        else if (gposition<0)
        {
            gposition = 0;
        }
        showGroup(gposition);
    }
}

function getTreams()
{
    page = 2;
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"team?country="+zone()+"&sign=1",true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var cc = JSON.parse(xhr.responseText);
            var data = cc.data;
            if (data)
            {
                console.log("sports getTreams "+data.length);
                showTeams(data);
            }
        }
    }
    xhr.send();
}

function showTeams(data)
{
    var obj = document.getElementById("teams");
    for(var i=0; i<data.length; i++)
    {
        var team = document.createElement("div");
        team.className = "team";
        var name = document.createElement("div");
        name.innerHTML = data[i].team;
        team.appendChild(name);
        
        var teampng = document.createElement("img");
        teampng.src = data[i].teampng;
        team.appendChild(teampng);
        team.style.left = (i%6)*280 + "px";
        team.style.top = parseInt(i/6)*280 + "px";
        team.setAttribute("team", data[i].team);
        obj.appendChild(team);
    }
    if (data.length>18)
    {
        document.getElementById("progressbarbg").style.display = "block";
    }
}

function updateTeamFocus(offset)
{
    if (offset == 1)
    {
        if (tposition%6 == 5)
        {
            tposition -= 5;
        }
        else
        {
            tposition++;
        }
        
    }
    else if (offset == -1)
    {
        if (tposition%6 == 0)
        {
            tposition += 5;
        }
        else
        {
            tposition--;
        }
    }
    else if (offset == 6)
    {
        if ((tposition+offset)<document.getElementsByClassName("team").length)
        {
            tposition += offset;
        }
        if (tposition>17)
        {
            pageOffset = -280;
            document.getElementById("progressbar").style.top = "496px";
        }
        else
        {
            pageOffset = 0;
            document.getElementById("progressbar").style.top = "0px";
        }
    }
    else if (offset == -6)
    {
        if ((tposition+offset)>=0)
        {
            tposition += offset;
        }
        if (tposition>17)
        {
            pageOffset = -280;
            document.getElementById("progressbar").style.top = "496px";
        }
        else
        {
            pageOffset = 0;
            document.getElementById("progressbar").style.top = "0px";
        }
    }
    document.getElementById("teams").style.top = pageOffset + "px";
    document.getElementsByClassName("teamfocus")[0].style.left = 63 + 280*(tposition%6) +"px";
    document.getElementsByClassName("teamfocus")[0].style.top = 46 + pageOffset + 280*Math.floor(tposition/6) + "px";
}

function getScheduleByTeam()
{
    page = 3;
    var team = document.location.search.substring(1);
    document.getElementById("title").innerHTML = decodeURI(team);
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"searchbyteam?country="+zone()+"&sign=1&team="+team,true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var cc = JSON.parse(xhr.responseText);
            data = cc.data;
            if (data)
            {
                console.log("sports getScheduleByTeam "+data.length);
                showTeamSchedule(data);
            }
        }
    }
    xhr.send();
}

function showTeamSchedule(data)
{
    //
    if (data)
    {
        console.log("showTeamSchedule "+data.length);
        
        for (var i=0; i<data.length; i++)
        {
            var obj = document.createElement("div");
            obj.className = "teammatch";
            
            var date = document.createElement("div");
            date.className = "teamdate";
            date.innerHTML = data[i].date;
            obj.appendChild(date);
            
            var place = document.createElement("div");
            place.className = "teamplace";
            place.innerHTML = data[i].place;
            obj.appendChild(place);
            
            var time = document.createElement("div");
            time.className = "teamtime";
            time.innerHTML = data[i].time;
            obj.appendChild(time);
            
            var team1 = document.createElement("div");
            team1.className = "teamteam1";
            team1.innerHTML = data[i].team1;
            obj.appendChild(team1);
            
            var team2 = document.createElement("div");
            team2.className = "teamteam2";
            team2.innerHTML = data[i].team2;
            obj.appendChild(team2);
            
            var property = document.createElement("div");
            property.className = "teamproperty";
            property.innerHTML = data[i].property;
            obj.appendChild(property);
            
            var team1icon = document.createElement("img");
            team1icon.className = "teamteam1icon";
            team1icon.src = data[i].team1png;
            obj.appendChild(team1icon);
            
            var team2icon = document.createElement("img");
            team2icon.className = "teamteam2icon";
            team2icon.src = data[i].team2png;
            obj.appendChild(team2icon);
            
            var vs = document.createElement("div");
            vs.className = "teamvs";
            if (data[i].team1score)
            {
                vs.innerHTML = "";
                vs.style.backgroundImage = "url(http://s3.tcllauncher.com/html5/images/line.png?md5=f987660ebf61599e6d93e36946cc950e)";
            }
            else
            {
                vs.innerHTML = "VS";
                vs.style.backgroundImage = "";
            }
            obj.appendChild(vs);
            
            var sc1 = document.createElement("div");
            sc1.className = "teamscore1";
            sc1.innerHTML = data[i].team1score?data[i].team1score:"";
            obj.appendChild(sc1);
            
            var sc2 = document.createElement("div");
            sc2.className = "teamscore2";
            sc2.innerHTML = data[i].team2score?data[i].team1score:"";
            obj.appendChild(sc2);
            
            document.getElementById("teamschedules").appendChild(obj);
            obj.style.top = (i)*steppixel+"px";
            var fenggexian = document.createElement("div");
            fenggexian.className = "fenggexian";
            fenggexian.style.top = (i+1)*steppixel+"px";
            document.getElementById("teamschedules").appendChild(fenggexian);
        }
        if (data.length>3)
        {
            document.getElementById("progressbarbg").style.display = "block";
        }
    }
}

function getSchedule()
{
    page = 1;
    if (zone()!="gb")
    {
        getScheduleEx();
    }
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"listAlldate?country="+zone()+"&sign=1",true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var cc = JSON.parse(xhr.responseText);
            dlist = cc.data;
            if (dlist)
            {
                console.log("sports getSchedule "+dlist.length);
                if (zone()=="gb")
                {
                    dlistx = dlist;
                    sposition = getDate();
                }
                if (dlistx)
                {
                    showdate(sposition);
                }
            }
        }
    }
    xhr.send();
}

function getScheduleEx()
{
    page = 1;
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"listAlldate?country="+"gb"+"&sign=1",true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var cc = JSON.parse(xhr.responseText);
            dlistx = cc.data;
            if (dlistx)
            {
                console.log("sports getSchedule "+dlistx.length);
                sposition = getDate();
                if (dlist)
                {
                    showdate(sposition);
                }
            }
        }
    }
    xhr.send();
}

function showdate(position)
{
    if (position<1)
    {
        document.getElementById("ls").innerHTML = "";
        document.getElementById("dir-l").style.display = "none";
    }
    else
    {
        document.getElementById("ls").innerHTML = dlist[position-1];
        document.getElementById("dir-l").style.display = "block";
    }
    document.getElementById("cs").innerHTML = dlist[position];
    if (position>=(dlist.length-1))
    {
        document.getElementById("rs").innerHTML = "";
        document.getElementById("dir-r").style.display = "none";
    }
    else
    {
        document.getElementById("rs").innerHTML = dlist[position+1];
        document.getElementById("dir-r").style.display = "block";
    }
    getScheduleByDate(dlist[position]);
}

function getScheduleByDate(date)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"searchbydate?country="+zone()+"&sign=1&date="+date,true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var cc = JSON.parse(xhr.responseText);
            var data = cc.data;
            if (data)
            {
                console.log("sports getScheduleByDate "+data.length);
                showSchedule(data);
            }
        }
    }
    xhr.send();
}

function getDate()
{
    var dd = new Date();
    for(var i=0; i<dlistx.length; i++)
    {
        var cc = new Date(dlistx[i]);
        if ((cc.getDate()+cc.getMonth()*30+cc.getFullYear()*365) >= (dd.getDate()+dd.getMonth()*30+dd.getFullYear()*365))
            return i;
    }
    return dlistx.length-1;
}

function showSchedule(data)
{
    //
    if (data)
    {
        console.log("showSchedule "+data.length);
        var times = document.getElementsByClassName("time");
        var places = document.getElementsByClassName("place");
        var properties = document.getElementsByClassName("property");
        var team1icons = document.getElementsByClassName("team1icon");
        var team1s = document.getElementsByClassName("team1");
        var result1s = document.getElementsByClassName("result1");
        var result2s = document.getElementsByClassName("result2");
        var team2icons = document.getElementsByClassName("team2icon");
        var team2s = document.getElementsByClassName("team2");
        var vss = document.getElementsByClassName("vs");
        var matches = document.getElementsByClassName("match");
        spositon = 0;
        
        for (var i=0; i<times.length; i++)
        {
            if (i<data.length)
            {
                places[i].innerHTML = data[i].place;
                times[i].innerHTML = data[i].time;
                team1s[i].innerHTML = data[i].team1;
                team2s[i].innerHTML = data[i].team2;
                properties[i].innerHTML = data[i].property;
                if (data[i].team1png.indexOf("Default.png")!=-1 || data[i].team1png.indexOf("Y_placeholder_70x70.png")!=-1)
                {
                    team1icons[i].src = "http://s3.tcllauncher.com/html5/images/team_bg.png?md5=6bd5658d0a099449e17bee9401588be6";
                }
                else
                {
                    team1icons[i].src = data[i].team1png;
                }
                if (data[i].team2png.indexOf("Default.png")!=-1 || data[i].team2png.indexOf("Y_placeholder_70x70.png")!=-1)
                {
                    team2icons[i].src = "http://s3.tcllauncher.com/html5/images/team_bg.png?md5=6bd5658d0a099449e17bee9401588be6";
                }
                else
                {
                    team2icons[i].src = data[i].team2png;
                }
                result1s[i].innerHTML = data[i].team1score?data[i].team1score:"";
                result2s[i].innerHTML = data[i].team2score?data[i].team2score:"";
                if (data[i].team1score)
                {
                    vss[i].innerHTML = "";
                    vss[i].style.backgroundImage = "url(http://s3.tcllauncher.com/html5/images/line.png?md5=f987660ebf61599e6d93e36946cc950e)";
                }
                else
                {
                    vss[i].innerHTML = "VS";
                    vss[i].style.backgroundImage = "";
                }
                matches[i].style.display = "block";
            }
            else
            {
                matches[i].style.display = "none";
            }
        }
    }
}

function getScore()
{
    page = 0;
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"gettype",true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200)
        {
            var cc = JSON.parse(xhr.responseText);
            if (cc.data=="team")
            {
                getGroup();
            }
            else
            {
                window.location = "final.html";
            }
        }
    }
    xhr.send();
}

function getGroup()
{
    page = 0;
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"listgroup?country="+zone()+"&sign=1",true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var cc = JSON.parse(xhr.responseText);
            glist = cc.data;
            if (glist)
            {
                console.log("sports getGroup "+glist.length);
                document.getElementById("scorecenter").style.display = "block";
                showGroup(gposition);
            }
        }
    }
    xhr.send();
}

function showGroup(position)
{
    if (position<1)
    {
        document.getElementById("lg").innerHTML = "";
    }
    else
    {
        document.getElementById("lg").innerHTML = glist[position-1];
    }
    document.getElementById("cg").innerHTML = glist[position];
    if (position>=(glist.length-1))
    {
        document.getElementById("rg").innerHTML = "";
    }
    else
    {
        document.getElementById("rg").innerHTML = glist[position+1];
    }
    getGroupScore(glist[position]);
}

function getGroupScore(group)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"selectbygroup?country="+zone()+"&sign=1&group="+group,true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var cc = JSON.parse(xhr.responseText);
            var data = cc.data;
            if (data)
            {
                console.log("sports getGroup "+data.length);
                showGroupScore(data);
            }
        }
    }
    xhr.send();
}

function showGroupScore(data)
{
    //
    if (data)
    {
        console.log("showGroupScore "+data.length);
        var rank = document.getElementsByClassName("rank");
        var icon = document.getElementsByClassName("icon");
        var name = document.getElementsByClassName("name");
        var played = document.getElementsByClassName("played");
        var won = document.getElementsByClassName("won");
        var drawn = document.getElementsByClassName("drawn");
        var lost = document.getElementsByClassName("lost");
        var gf = document.getElementsByClassName("gf");
        var ga = document.getElementsByClassName("ga");
        var gd = document.getElementsByClassName("gd");
        var pts = document.getElementsByClassName("pts");
        spositon = 0;
        
        for (var i=0; i<data.length && i<played.length; i++)
        {
            rank[i+1].innerHTML = data[i].rank;
            icon[i+1].src = data[i].teampng;
            name[i+1].innerHTML = data[i].team;
            played[i+1].innerHTML = data[i].played;
            won[i+1].innerHTML = data[i].won;
            drawn[i+1].innerHTML = data[i].drawn;
            lost[i+1].innerHTML = data[i].lost;
            gf[i+1].innerHTML = data[i].GF;
            ga[i+1].innerHTML = data[i].GA;
            gd[i+1].innerHTML = data[i].GD;
            pts[i+1].innerHTML = data[i].Pts;
        }
    }
}

function getFinal()
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET",path+"knockout?country="+zone()+"&sign=1",true);
    xhr.onreadystatechange = function() {
        
        if (xhr.readyState == 4 && xhr.status == 200) 
        {
            var cc = JSON.parse(xhr.responseText);
            var data = cc.data;
            if (data)
            {
                console.log("sports getGroup "+data.length);
                showFinal(data);
            }
        }
    }
    xhr.send();
}

function showFinal(data)
{
    var finalteama = document.getElementsByClassName("finalteam");
    var scores = document.getElementsByClassName("finalscore");
    var j = 0;
    for (var i=0; i<finalteama.length&&j<data.length; i++)
    {
        var played = 1;
        if (data[j].team1png.indexOf("Default.png")!=-1 || data[j].team1png.indexOf("Y_placeholder_70x70.png")!=-1)
        {
            played = 0;
        }
        finalteama[i].getElementsByTagName("div")[0].innerHTML = played?data[j].team1:"";
        finalteama[i].getElementsByTagName("img")[0].src = played?data[j].team1png:"http://s3.tcllauncher.com/html5/images/global_2.png?md5=688b0d9fcf9de6d5d9a2b477b7f6710d";
        scores[i/2].innerHTML = data[j].team1score?(data[j].team1score+":"+data[j].team2score):"";
        i++;
        if (data[j].team2png.indexOf("Default.png")!=-1 || data[j].team2png.indexOf("Y_placeholder_70x70.png")!=-1)
        {
            played = 0;
        }
        finalteama[i].getElementsByTagName("div")[0].innerHTML = played?data[j].team2:"";
        finalteama[i].getElementsByTagName("img")[0].src = played?data[j].team2png:"http://s3.tcllauncher.com/html5/images/global_2.png?md5=688b0d9fcf9de6d5d9a2b477b7f6710d";
        j++;
    }
    finalteama = document.getElementsByClassName("finalteam1");
    scores = document.getElementsByClassName("finalscore1");
    for (var i=0; i<finalteama.length&&j<data.length; i++)
    {
        var played = 1;
        if (data[j].team1png.indexOf("Default.png")!=-1 || data[j].team1png.indexOf("Y_placeholder_70x70.png")!=-1)
        {
            played = 0;
        }
        finalteama[i].getElementsByTagName("div")[0].innerHTML = played?data[j].team1:"";
        finalteama[i].getElementsByTagName("img")[0].src = played?data[j].team1png:"http://s3.tcllauncher.com/html5/images/global_1.png?md5=0d86fabcd91b4677932703738314a47f";
        scores[i/2].innerHTML = data[j].team1score?(data[j].team1score+":"+data[j].team2score):"";
        i++;
        played = 1;
        if (data[j].team2png.indexOf("Default.png")!=-1 || data[j].team2png.indexOf("Y_placeholder_70x70.png")!=-1)
        {
            played = 0;
        }
        finalteama[i].getElementsByTagName("div")[0].innerHTML = played?data[j].team2:"";
        finalteama[i].getElementsByTagName("img")[0].src = played?data[j].team2png:"http://s3.tcllauncher.com/html5/images/global_1.png?md5=0d86fabcd91b4677932703738314a47f";
        j++;
    }
    finalteama = document.getElementsByClassName("finalteamx");
    var winer = 1;
    if (data[data.length-1].team1score<data[data.length-1].team2score)
    {
        winer = 2;
    }
    played = 1;
    if (data[data.length-1].team1png.indexOf("Default.png")!=-1 || data[data.length-1].team1png.indexOf("Y_placeholder_70x70.png")!=-1)
    {
        played = 0;
    }
    finalteama[0].getElementsByTagName("div")[0].innerHTML = played?((winer==1)?data[data.length-1].team1:data[data.length-1].team2):"";
    finalteama[0].getElementsByTagName("img")[0].src = played?((winer==1)?data[data.length-1].team1png:data[data.length-1].team2png):"http://s3.tcllauncher.com/html5/images/global.png?md5=1deb24745387e963216d871c5f24e5b1";
}

function updatePage(offset)
{
    var len = document.getElementsByClassName("teammatch").length;
    if (offset==-1)
    {
        if (len>3 && pageOffset<0)
        {
            pageOffset += 322;
            baroffset -= 496/(len-3);
        }
    }
    else
    {
        if (len>3 && (len-3)*(-322)<pageOffset)
        {
            pageOffset -= 322;
            baroffset += 496/(len-3);
            
        }
    }
    document.getElementById("progressbar").style.top = baroffset + "px";
    document.getElementById("teamschedules").style.top = -19 + pageOffset + "px";
}

function zone()
{
    var z = top.getTimeZone();
    if (z!="de" && z!="fr")
    {
        z = "gb"
    }
    return z;
}

(function() {
    if (tcl.channel.inputSource != 10)
    {
        tcl.channel.requestInputSource(10);
    }
})();