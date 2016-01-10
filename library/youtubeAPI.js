

function VideoCoverStyling(canva, player,events){
    canva.addEventListener("click",click);
    function click(event){
        if(player.getPlayerState()===1) player.pauseVideo();
        else player.playVideo();
    }
    
}

function VideoCoverStyling_wrapper(wrapper, player, events) {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        var played = 0;
        player.addEventListener('onStateChange', create)
        function create(event) {
            if (event.data === 1 && played === 0) {
                played = 1;
                createCanvas();
            }
        }
    }
    else createCanvas();
    function createCanvas() {
        var canva = document.createElement('canvas');
        var videoFrame = player.getIframe();
        canva.width = videoFrame.width;
        canva.height = videoFrame.height;
        canva.style.position = 'absolute';
        canva.style.top = 0;
        canva.style.left = 0;
        //wrapper.appendChild(canva);
        videoFrame.parentNode.insertBefore(canva, videoFrame.nextSibling);
        canva.addEventListener("click", click);
        function click(event) {
            if (player.getPlayerState() === 1) player.pauseVideo();
            else player.playVideo();
        }
        canva.ondblclick = function () {
            var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
            var ev = state ? 'FullscreenOn' : 'FullscreenOff';
            if (ev === 'FullscreenOn') exitFullscreenMode()
            else fullScreen(wrapper);
        };
    }
}

function autoHide(player, timer, div, funct) {//Problems!!
    //var timer;
    var videoFrame = player.getIframe();
    var wrapper = videoFrame.parentNode;
    player.addEventListener('onStateChange', hideShow);
    wrapper.addEventListener('mousemove', function (event) {
        clearTimeout(timer);
        if (div.style.display === "none") funct.show();
        timer = setTimeout(function () { funct.hide();}, 2000);
     });
    function hideShow(event) {
        if (event.data === 2 || event.data === -1) {
            clearTimeout(timer);
            funct.show();
            timer = setTimeout(function () { funct.hide();}, 2000);
        } 
    }
}

//makes every element with an Id to be stored as a variable, ex: c.rateList1
//saves the effort of typing getElementById()
function setElemVariables(){
    var c={};
    var allElem=document.getElementsByTagName('*');
    for(var i=0,j=allElem.length;i<j;i++) {
        if(allElem[i].id){
            var elemId=allElem[i].id
            c[elemId]=allElem[i];
        }    
    }
    return c;
}

function loadVideo(player,videoId){//starts with auto play
   player.loadVideoById({videoId:videoId});
}
function cueVideo(player,videoId){//starts paused
    player.cueVideoById({videoId:videoId});
    //test2.innerHTML="event";
}
function loadPlaylist(player,playlistId,index){//starts with auto play
    if(typeof playlistId==="object"){
                player.loadPlaylist({
                playlist: playlistId,
                index: index
            });
        }
    else
        player.loadPlaylist({
            list: playlistId,
            index: index
        });
}

//not good for seekTo(). Only for playing update
function showCurrentTime(player,span) { 
    //var span=document.getElementById(spanId);
    span.innerHTML = secondsToTimeText(player.getCurrentTime());  
}

function twoDigit(num) {
    if (Math.floor(num/10)===0) return "0"+num;
    else return num;
}
function secondsToTimeText(time){
    var totalSeconds = Math.floor(time);
    var seconds = totalSeconds % 60;
    var minutes = Math.floor(totalSeconds / 60);
    return minutes + ":" + twoDigit(seconds);  
}


function eventsGivenTime(player,timers,videoId,handlers){    
    player.addEventListener("onStateChange",stateChange);
    player.addEventListener("onPlaybackRateChange",rateChange);

    function stateChange(event){
        if(event.data!=1) clearTimers();
        else {
             if(videoId===getQueryVariable(player.getVideoUrl(),'v')){
                clearTimers();
                //test.innerHTML+=" a";
                setTimedEvents();
            }
        }
       
    }
    function rateChange(event){
        if(player.getPlayerState()===1&&videoId===getQueryVariable(player.getVideoUrl(),'v')){
            clearTimers();
            setTimedEvents();
        }
    }

    function setTimedEvents(){
        
        var speed=player.getPlaybackRate();
        for(var j=0;j<handlers.length;j++){
            //
            //setTimeout(wrapper(j), 0);
            setEvent(handlers[j].time,player,speed,handlers[j].funct);
        }
        
    }

    function setEvent(time,player,speed,funct){//time is in seconds
        //test4.innerHTML+=" time stamp";
        //clearTimeout(timers.splice(0,1));
        //test.innerHTML+=time;
        //remaining_time = time - player.getCurrentTime();
        if (time - player.getCurrentTime() > 0) {           
            timers.push (setTimeout(funct, (time - player.getCurrentTime()) * 1000/speed));
            //test4.innerHTML+=" "+remaining_time;
           // test.innerHTML+= " b";
        }
    }
    function clearTimers(){
        for(var i=0;i<timers.length;i++){
            clearTimeout(timers[i]);
        }
        timers.length=0;
    }
}




function changeTime(player,value,max,spanDisplayTime) {
    //var spanDisplayTime=document.getElementById(spanDisplayTimeId);
    var time;
    var dur = player.getDuration();

//    if (value === max) 
//        time = player.getDuration() - 1;
//    else 
        time = value / max * dur ;
    
    //if (playing === false) player.playVideo();
    //test2.innerHTML =test2.innerHTML + " seeked ";
    
    player.seekTo(time, true/*allow seek ahead*/); 
    if (spanDisplayTime!=null) spanDisplayTime.innerHTML = secondsToTimeText(time);  
    //if(player.getPlayerState===0)player.pauseVideo;
}

function eventForIrregularImg(canva, imgSrc, mouseEvent, funct) {
    //var canva=document.getElementById(canvaId);
    var img = new Image();
    img.onload = function () {
        canva.width = img.naturalWidth;
        canva.height = img.naturalHeight;
        var ctx = canva.getContext("2d");
        ctx.drawImage(img, 0, 0);

        canva.addEventListener("mousemove", getOpacity);
        //canva.addEventListener("touchstart", getOpacity);
        function getOpacity(event) {

            var coords=mouseCoordsToElem(event.target,event);
            var imgData = ctx.getImageData(coords.x, coords.y, 1, 1);
            var opaque;
            //if (imgData.data[(coords.y * canva.width + coords.x) * 4 + 3] < 50) opaque = false;
            if (imgData.data[3] < 50) { opaque = false; /*test2.innerHTML = "opaque:" + imgData.data[3];*/ }
            else { opaque = true; /*test2.innerHTML = "opaque:" + imgData.data[3];*/ }
            //test2.innerHTML = "x:" + coords.x + " y:" + coords.y + " opaque:" + opaque;
            //            test2.innerHTML = "x:" + coords.x + " y:" + coords.y + " opaque:" + opaque
            //            + " pageX:" + coords.pageX + " pageY:" + coords.pageY
            //            + " canvasOffsetX:" + coords.left + " canvasOffsetY:" + coords.top;

            if (opaque === true) {
                canva.addEventListener(mouseEvent, funct);
            }
            else canva.removeEventListener(mouseEvent, funct);
        }

    };
    img.src = imgSrc;
}


// valid for anything that wants slider motion
//event target is the sliding icon
// actionDrag and actionEnd must have input arguments (value,max) 
function sliderBarMode(event,div,actionDrag,actionEnd,axis) {

    //var c=document.getElementsByTagName("canvas");
        //var div=document.getElementById(divId);
        var mcoords = findDocumentCoords(event);
        if(div.getElementsByClassName("handle")[0]) var canva = div.getElementsByClassName("handle")[0];
        //var div = canva.parentElement;
        //div.style.position = "relative";
        canva.style.position = "absolute";
        if (axis === "y") var x0 = mcoords.y;
        else var x0 = mcoords.x;

        var canva0 = canva.getBoundingClientRect();
        var div0 = div.getBoundingClientRect();

        if (axis === "y") {
            var canvaX0 = canva0.top + window.pageYOffset;
            var divX = div0.top + window.pageYOffset;   
        }
        else { 
            var canvaX0 = canva0.left + window.pageXOffset;
            var divX = div0.left + window.pageXOffset;        
        }

        var offset0 = x0 - canvaX0;
        document.addEventListener("mousemove",dragBar);
        document.addEventListener("touchmove",dragBar);
       // document.addEventListener("touchmove",function(){test4.innerHTML+=" moved"});
        document.addEventListener("mouseup", cleardrag);
        document.addEventListener("touchend", cleardrag);

        var value = canvaX0 - divX;

        if (axis === "y") {
            var divw = div.offsetHeight;
            var canw = canva.offsetHeight;
        }
        else {
            var divw = div.offsetWidth;
            var canw = canva.offsetWidth;
        }
        var max = divw - canw;

        function dragBar(event) {
            //test.innerHTML+="a";
            event.preventDefault();
            mcoords = findDocumentCoords(event);

            if (axis === "y") var mx = mcoords.y;
            else var mx = mcoords.x;
            //var canvaX = canva.getBoundingClientRect();


            if (mx - offset0 < divX || mx < divX)
                value = 0;
            else if (mx > (divX + divw) || (mx + canw - offset0) > (divX + divw))
                value=max;//value = max-1;//!!!!video seekTo() problem
            else
                //canva.style.left = event.pageX - x0 + canvaX0.left - document.body.scrollLeft - divX.left + "px";
                value = mx - offset0 - divX;
            if (axis === "y") {
                canva.style.top = value + "px";
                value = max - value;
            }
            else canva.style.left = value + "px";
            //actionDrag(value, max);
            actionDrag(value, max, cleardrag);
        }
        function cleardrag(/*event*/){
            //test.innerHTML+=" Cleared"; 
            document.removeEventListener("mousemove", dragBar);
            document.removeEventListener("touchmove", dragBar);
            document.removeEventListener("mouseup", cleardrag);
            document.removeEventListener("touchend", cleardrag); 
            actionEnd(value,max);
            
        }
}



// valid for anything that wants click-change-position/value motion
//event target is the slider bar, div is the div containing handle
// actionClick must have input arguments (value,max) 
//the handle that changes postion must have calssname "handle"
function clickOnSliderBar(event, div, actionClick, axis) {

    var mcoords = findDocumentCoords(event);

    //var div = event.target;
    // var bar=event.target;
    var canva;

    //    if (div.lastElementChild != null)
    //        var canva = div.lastElementChild;
    //    else return;


    if (div.getElementsByClassName('handle')[0]) canva = div.getElementsByClassName('handle')[0];
    else return;

    //div.style.position = "relative";
    canva.style.position = "absolute";

    var canva0 = canva.getBoundingClientRect();
    var div0 = div.getBoundingClientRect();

    if (axis === "y") {
        var canvaX0 = canva0.top + window.pageYOffset;
        var divX = div0.top + window.pageYOffset;
        //var x0 = mcoords.y;
        var cw = canva.offsetHeight;
        var dw = div.offsetHeight;
        var mx = mcoords.y;
    }
    else { 
        var canvaX0 = canva0.left + window.pageXOffset;
        var divX = div0.left + window.pageXOffset;
        //var x0 = mcoords.x;
        var cw = canva.offsetWidth;
        var dw = div.offsetWidth;
        var mx = mcoords.x;
    }

    var max = dw - cw;
    //var value = canvaX0 - divX;
    var value;
    if (mx - divX < 0.5 * cw)
        value = 0;
    else if (mx - divX > (dw - 0.5 * cw)) {
        value = max; //value = max - 1; //!!!!video seekTo() problem
    }
    else {
        value = mx - divX - 0.5 * cw;
        // test2.innerHTML = "value got";
    }
    
    if (axis === "y") {
        canva.style.top = value + "px";
        value = max - value;
    }
    else canva.style.left = value + "px";
    actionClick(value, max);
    
}


//action when hovering on slider bar(only working when the mouse is not down)
//when mouse pressed, it will stop the action(to separate from slider bar mode)
//the position handle(not the pop-up element)must have class"handle"
//div is the whole bar div, not neccessarily bar image
function mouseEnterSliderBar(event,div,actionHover,acionLeave,actionEnter){
    
    var mcoords = findDocumentCoords(event);
    //var div = event.target;
    var bar=event.target;
    var canva;
    var cw;
    
//    if (div.lastElementChild != null)
//        var canva = div.lastElementChild;
//    else return;

    if(div.getElementsByClassName('handle')[0]) {canva=div.getElementsByClassName('handle')[0]; cw=canva.offsetWidth;}
    else cw=0;
   
   // div.style.position = "relative";
  //  canva.style.position = "absolute";
   // var canva0 = canva.getBoundingClientRect();
    var div0 = bar.getBoundingClientRect();
   // var canvaX0 = canva0.left + window.pageXOffset;
    var divX = div0.left + window.pageXOffset;
    var x0 = mcoords.x;

    var value /*= canvaX0 - divX*/;
   // var cw = canva.offsetWidth;
    var dw = bar.offsetWidth;
    var max = dw - cw;

    if (mcoords.x - divX < 0.5 * cw)
        value = 0;
    else if (mcoords.x - divX > (dw - 0.5 * cw)) {
        value = max; 
    }
    else {
        value = mcoords.x - divX - 0.5 * cw;
        // test2.innerHTML = "value got";
    }

    //test3.innerHTML+=" E";
    bar.addEventListener("mouseleave",leaving);
    if(event.buttons!=1) {//mouse not pressed
        if(actionEnter) actionEnter(value,max);
        bar.addEventListener("mousemove",hovering);
        bar.addEventListener("mousedown",down);
    }
    else {
         bar.addEventListener("mouseup",up);
    }
   function up(event){
        //test3.innerHTML+=" U";
        bar.addEventListener("mousedown",down);
        bar.addEventListener("mousemove",hovering); 
        bar.removeEventListener("mouseup",up);
   }
   function down(event){
        //test3.innerHTML+=" D";
        acionLeave(value,max);
        bar.removeEventListener("mousemove",hovering);
        bar.addEventListener("mouseup",up);
   }
   function leaving(event){
        //test3.innerHTML+=" L"; 
        bar.removeEventListener("mouseup",up);
        bar.removeEventListener("mousemove",hovering);
        bar.removeEventListener("mousedown",down);
        bar.removeEventListener("mouseleave",leaving);
        if(event.buttons!=1) acionLeave(value,max);
   }
    function hovering(event){
            mcoords = findDocumentCoords(event);
            if (mcoords.x - divX < 0.5 * cw)
                value = 0;
            else if (mcoords.x - divX > (dw - 0.5 * cw)) {
                value = max; 
            }
            else {
                value = mcoords.x - divX - 0.5 * cw;
            }
            actionHover(event,value,max);
    }    
}

function displayTimeFromProportion(player,spanDisplayTime,value,max){ 
    //var spanDisplayTime=document.getElementById(spanDisplayTimeId); 
    var total=player.getDuration();
    var totalSeconds = value/max*total;
    spanDisplayTime.innerHTML = secondsToTimeText(totalSeconds);
}

//need class "handle"
function updateSliderBarPosition(value, max, div,axis) {//div is the slider background
    if (div.getElementsByClassName("handle")[0]) var canva = div.getElementsByClassName("handle")[0];

    if (axis === "y") {
        var pos = (div.offsetHeight - canva.offsetHeight) / max * (max-value);
        canva.style.position = "absolute";
        canva.style.top = pos + "px";    
    }
    else { 
        var pos = (div.offsetWidth - canva.offsetWidth) / max * value;
        canva.style.position = "absolute";
        canva.style.left = pos + "px";    
    }
}



function findDocumentCoords(mouseEvent) {
    var xpos
    var ypos;
    if (mouseEvent) {
        //FireFox
        xpos = mouseEvent.pageX;
        ypos = mouseEvent.pageY;
    }
    else {
        //IE
        xpos = window.event.x + window.pageXOffset - 2;
        ypos = window.event.y + window.pageYOffset - 2;
    }
    if(mouseEvent.touches&&mouseEvent.touches.length===1){
        var touch = mouseEvent.touches[0]; 
        xpos = touch.pageX;
        ypos = touch.pageY;
    }
    // document.getElementById("documentCoords").innerHTML = xpos + ", " + ypos;
    return {
        x: xpos,
        y: ypos
    };
}

//get mouse coords relative to div
function mouseCoordsToElem(div,mouseEvent){//y coords not verified 
    //var div=document.getElementById(divId);
    var documentCoords=findDocumentCoords(mouseEvent);
    var div0 = div.getBoundingClientRect();
    var x=documentCoords.x- div0.left - window.pageXOffset;
    //var x=documentCoords.x-(div0.left+document.body.scrollLeft);
    var y=documentCoords.y- div0.top - window.pageYOffset;
    return{
        x:x,
        y:y//y coords not verified 
    };
}



function showThumbNail(videoID,div){
   // var div=document.getElementById(divId);
    var image=document.createElement('img');
    image.setAttribute('src','http://img.youtube.com/vi/'+videoID+'/3.jpg');
    div.appendChild(image);
}


function videoInfo(videoid,funct) {
//key is from my googleAPI account
var url='https://www.googleapis.com/youtube/v3/videos?key=AIzaSyBi8zspWyFDfqgm5YOTqM6BFny3V5igLtc&part=snippet&id='+videoid;
fetchJSONFile(url,funct);
}

function playlistInfo(playlistId,funct) {//use playlistId to get info, MAX first 50 videos
//key is from my googleAPI account
    var url='https://www.googleapis.com/youtube/v3/playlistItems?maxResults=50&key=AIzaSyBi8zspWyFDfqgm5YOTqM6BFny3V5igLtc&part=snippet,contentDetails&playlistId='+playlistId;
    fetchJSONFile(url,funct);
}

function fetchJSONFile(path, callback) {
    var httpRequest = (window.XMLHttpRequest)?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path,true);//true for asyncronous
    httpRequest.send(); 
}

//executes asyncronously after the player is ready 
//accept playlistId as array or simply the playlistId(this way, max 50 items) on youtube
//can be displayed in any format
//need to set up a not displayed section in htm, with dissidents of class:title,channelTitle,thumbnail
function setUpPlaylist(input){
    var player=input.player, playlistId=input.playlistId, div=input.div, 
        actionClick=input.actionClick, actionEnter=input.actionEnter, actionLeave=input.actionLeave;
        styleNowPlaying=input.styleNowPlaying, styleNotPlaying=input.styleNotPlaying;
    //div.style.display="block";
    var sampleNode=div.getElementsByClassName('sampleNode')[0].cloneNode(true);
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }
    div.appendChild(sampleNode);
    var templateNode = sampleNode.cloneNode(true);
    sampleNode.style.display = "none";
    //get playlist video Ids as array
    var playlist=[],item=[],len;
    var styled=false;
    followPlaylist(player, div, styleNowPlaying, styleNotPlaying);
    if(typeof playlistId==="string"){//use playlistId, Max 50 items
        playlistInfo(playlistId,getlist);
    }
    else {//use Array, no maximun
        playlist=playlistId;
        len=playlist.length;
        for(var i=0;i<len;i++){
            display(i);
        }
    }       
    function getlist(data1){
                len=data1.items.length;//test2.innerHTML+=" playlistData:"+len;
                for(var i=0;i<len;i++){
                    playlist[i]=data1.items[i].contentDetails.videoId;
                    display(i);                   
                }
     }
    function display(i){
            videoInfo(playlist[i],construction);
            function construction(data){

                //item[i]=div.getElementsByClassName('sampleNode')[0].cloneNode(true);//true:clone with all descendants
                item[i] = templateNode.cloneNode(true); //true:clone with all descendants
               // item[i].style.display="block";
                if(item[i].getElementsByClassName("title")[0]!=null) 
                    item[i].getElementsByClassName("title")[0].innerHTML=data.items[0].snippet.title;
                if(item[i].getElementsByClassName("channelTitle")[0]!=null)
                    item[i].getElementsByClassName("channelTitle")[0].innerHTML=data.items[0].snippet.channelTitle;
                if(item[i].getElementsByClassName("thumbnail")[0]!=null){                
                    var image=document.createElement('img');
                    //image.setAttribute('src',data.items[0].snippet.thumbnails.default.url);
                    image.setAttribute('src', 'http://img.youtube.com/vi/' + playlist[i] + '/default.jpg');
                    item[i].getElementsByClassName("thumbnail")[0].appendChild(image);
                }

                item[i].className += " playlistItem "+i+" "+playlist[i];
                //item[i].id="position:"+i;
                //test2.innerHTML+=item[i].id;
                if(input.actionClick!=null) item[i].addEventListener("click",click);
                if(input.actionEnter!=null)item[i].addEventListener("mouseenter",cursorEnter);//better to use css :hover
                if(input.actionLeave!=null)item[i].addEventListener("mouseleave",cursorLeave);
                //insert item in the right order
                if (i === len - 1) {
                    div.appendChild(item[i]);
                    //div.getElementsByClassName('sampleNode')[0].style.display = "none";
                }
                for(var j=i+1;j<len;j=j+1){
                    if(item[j]!=undefined){
                        div.insertBefore(item[i], item[j]);
                        break;
                    }
                    if(j===len-1) div.appendChild(item[i]);
                }

                //check if now playing
                if(styled===false){
                    var videoId=getQueryVariable(player.getVideoUrl(),'v');
                     if(playlist[i]===videoId) {
                        var event={data:player.getPlayerState()};
                        if (styleNowPlaying) styleNowPlaying(event, item[i]);
                        styled=true;
                     }               
                }
                function click(event){
                    //loadVideo(player,playlist[i]);
                    actionClick(event,i,item[i]);
                }
                function cursorEnter(event){
                    actionEnter(event,i,item[i]);
                }
                function cursorLeave(event){
                    actionLeave(event,i,item[i]);
                }
            }
    } 
    function followPlaylist(player, playlistDiv,styleNowPlaying,styleNotPlaying) {
        //but eventlistenr seems always happen before div setting
       // test2.innerHTML+=" eventListener";
        player.addEventListener("onStateChange",nowPlaying);
        function nowPlaying(event){
            //if(event.data===-1){
                var videoId=getQueryVariable(player.getVideoUrl(),'v');
                var itemDiv=playlistDiv.getElementsByClassName(videoId)[0];
                var listItems=playlistDiv.getElementsByClassName("playlistItem");
                if(styleNotPlaying!=null) {for(var i=0;i<listItems.length;i++) styleNotPlaying(event,listItems[i]);}
                if(styleNowPlaying!=null) styleNowPlaying(event,itemDiv);
            //}
        }
    }  
}


//not supported on IE 10 or below, heard it works on IE 11
//not supported on IOS 6 or below, heard it works on IOS 7.1
function fullScreen(elem){
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
        //if(nextelem!==null) nextelem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
        //if(nextelem!==null) nextelem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
        //if(nextelem!==null) nextelem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullScreen) {
        elem.webkitRequestFullScreen();
        //if(nextelem!==null) nextelem.webkitRequestFullScreen();
    } 
}

function exitFullscreenMode(){
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    }
}

function fullScreenWithCoverSetUp(player,wrapper){
    document.addEventListener('webkitfullscreenchange', fullScreenHandler, false);
    document.addEventListener('mozfullscreenchange', fullScreenHandler, false);
    document.addEventListener('fullscreenchange', fullScreenHandler, false);
    document.addEventListener('MSFullscreenChange', fullScreenHandler, false);
    var videoFrame = player.getIframe();
    var canva = wrapper.getElementsByTagName('canvas')[0];

    var ow=0,oh=0,sw=0,sh=0;
    function fullScreenHandler() {
        var state = document.fullScreen || document.mozFullScreen || document.webkitIsFullScreen;
        var ev = state ? 'FullscreenOn' : 'FullscreenOff';
        if (ev === 'FullscreenOff') {
            //videoFrame.width = ow; videoFrame.height = oh;
            player.setSize(ow, oh);
            canva.width = ow; canva.height = oh;
        }
        else {    
            ow = videoFrame.width; oh = videoFrame.height;
            //sw = document.documentElement.clientWidth; sh = document.documentElement.clientHeight;
            sw = window.innerWidth; sh = window.innerHeight;
            if(screen.width/screen.height<ow/oh){
               // videoFrame.width = sw; 
                // videoFrame.height = sw / ow * oh;
                player.setSize(sw, sw / ow * oh);
                canva.width = sw;
                canva.height = sw / ow * oh;
            }
            else{
                //videoFrame.width = sh*ow/oh; 
                // videoFrame.height = sh;
                player.setSize(sh * ow / oh, sh);
                canva.width =sh*ow/oh;
                canva.height = sh;
            }
        }
   }
}

function getQueryVariable(url,variable) {
    var query = url.substring( url.indexOf('?') + 1 );
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) === variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    //console.log('Query variable %s not found', variable);
}




//Is working syncronously to use return
//cannot get auto generated captions
//doesn't require an API key

//can use player1.getOption("captions", "tracklist")[i].languageName;
//player1.getOption("captions", "tracklist")[i].languageCode;
//****player1.getOption("cc", "track")[i].languageCode;
//****player1.getOption("cc", "track")[i].name;
function getTrack(player,callback){   
    var xhttp;
    var name=[];
    var code=[];
    code.length=0; name.length=0;
    if(player.getVideoUrl()) var url='http://video.google.com/timedtext?type=list&v='+getQueryVariable(player.getVideoUrl(),'v');
    else return {code:code, name:name};
    if (window.XMLHttpRequest)
      {
      xhttp=new XMLHttpRequest();
      }
    else // for IE 5/6
      {
      xhttp=new ActiveXObject("Microsoft.XMLHTTP");
      }
    xhttp.open("GET",url,true);/*false:sync, true:async*/
    //if async=true, need  xhttp.onreadystatechange=function(){} to tell when it finishes
    xhttp.send();
    xhttp.onreadystatechange=function(){
        var xmlDoc=xhttp.responseXML;
        if(xmlDoc) {var x=xmlDoc.getElementsByTagName("track");
                for(var i=0;i<x.length;i++){
                name.push(x[i].getAttribute("lang_translated"));
                code.push(x[i].getAttribute("lang_code"));
            }
        }
        callback({value:code, name:name});
        //return {code:code, name:name};
    };
    //return {code:ans2, name:ans};
}

// Currently supports listDiv is a <select> element or sampleNode is an element that contains radio button and label
// with input option, must have a wrapper to wrap input and label together
function setList(c){
    var valueArray=c.valueArray,
        nameArray=c.nameArray,
        div=c.listDiv,
        actionChange=c.actionChange,
        stylingFunct=c.stylingFunct,
        defaultValue=c.defaultValue;
     var items=[]; items.length=0;
     var defaultIndex;
     var sampleNode=div.getElementsByClassName('sampleNode')[0].cloneNode(true);
     while (div.firstChild) {
            div.removeChild(div.firstChild);
        }
     div.appendChild(sampleNode);
     if(valueArray.length===0||valueArray.length===1){
            if(c.actionNull) c.actionNull();
            return;
     }
     if (c.actionExist) c.actionExist();
   //  var found = 0;
     for(var i=0;i<valueArray.length;i++){
            items.push(div.firstElementChild.cloneNode(true));
            div.appendChild(items[i]);
            var nameSpan=div.getElementsByClassName("nameSpan")[i+1];
            items[i].style.display = "block";

            //find default value, use substring because of language code
//            if(typeof defaultValue === 'STRING'){
//                if (found === 0 && valueArray[i].substring(0, 2).toUpperCase() === defaultValue.substring(0, 2).toUpperCase()) {
//                    defaultIndex = i;
//                    found = 1;
//                }
//                else if (valueArray[i].toUpperCase() === defaultValue.toUpperCase()) {
//                    defaultIndex = i;
//                    found = 1;
//                }
//            }
//            else 
            if (valueArray[i] === defaultValue) defaultIndex = i;
            
            if(nameSpan!=null) {
                nameSpan.style.display="block";
                if(div.nodeName==="SELECT"){//!!tagName always returns uppercase sting
                    nameSpan.text=nameArray[i];
                    items[i].value=valueArray[i];
                   // items[i].disabled =  false;
                }
                else if(div.getElementsByTagName('input')[0]!=null) {
                    nameSpan.innerHTML=nameArray[i];
                    items[i].getElementsByTagName('input')[0].id=div.id+"_"+valueArray[i];
                    items[i].getElementsByTagName('input')[0].value=valueArray[i];
                    items[i].getElementsByTagName('input')[0].name=div.id;
                    //nameSpan.setAttribute('for',trackList.name[i]);
                    items[i].getElementsByTagName('label')[0].htmlFor =div.id+"_"+valueArray[i];
                    //items[i].onclick=actionInput;
                    items[i].getElementsByTagName('label')[0].addEventListener("click", actionInput);
                }
            }

            //mouseEventStyling
            if(stylingFunct){
                for(var j=0;j<stylingFunct.length;j++){
                    if(div.getElementsByTagName("label")) items[i].getElementsByTagName("label")[0].addEventListener(stylingFunct[j].event,stylingFunct[j].funct);
                    else items[i].addEventListener(stylingFunct[j].event,stylingFunct[j].funct);
                }
            }
        }
        if(div.nodeName==="SELECT") {
              div.onchange=actionSelect;
            if(defaultIndex!=null)  div.selectedIndex = defaultIndex+1;//+1 for there is an invisible sample node at the beginning
            else div.selectedIndex = 0;   
            actionSelect();    
        }
        else {
            if(defaultIndex!=null) var checkedButton=items[defaultIndex].getElementsByTagName('input')[0];   
            else checkedButton=sampleNode.getElementsByTagName('input')[0];  
            checkedButton.checked = true;          
            var item= checkedButton.nextSibling;
            var value= checkedButton.value;
            actionChange(item,value);
        }
       

        function actionSelect(){ 
            var value=div.options[div.selectedIndex].value;
            var checkedItem=div.options[div.selectedIndex];
            actionChange(checkedItem,value);
        }
        function actionInput(event){
          //  if(document.querySelector('input[name="'+div.id+'"]:checked')){
            //    var checkedButton=document.querySelector('input[name="'+div.id+'"]:checked');
                var checkedButton=event.target.previousElementSibling;
                var item= checkedButton.nextSibling;
                var value= checkedButton.value;
                actionChange(item,value);
          //  }
        }
}


//On mobile device simulation, it will display 2 cc tracks, engish and the other
//doesnt work for auto-generated captions on mobile device
//not working in IE!!!!Need to be clicked twice(or use setTimeOut)
//sometimes not working with auto generated caption
//Now susiblingsrackList is a <select> element or sampleNode is an element that contains radio button and label
function ccon(player,trackList) {
        //var trackList=document.getElementById(trackListId);
        player.setOption("captions", "reload");
        player.setOption("cc", "reload");

        player.loadModule("captions");  //Works for html5 ignored by AS3
        player.loadModule("cc");  //Works for AS3 ignored by html5
        

        funct();        
        setTimeout(funct,300);//for IE to work!!!??????
        
        function funct(){
            
            if(trackList){
               //if(trackList.getElementsByTagName('input')[0]&&document.querySelector('input[name="'+trackList.id+'"]:checked')) test3.innerHTML="checked";
                if(trackList.nodeName==="SELECT"&&trackList.options[trackList.selectedIndex].value!=undefined){
                    player.setOption("captions", "track", { "languageCode": trackList.options[trackList.selectedIndex].value });
                    player.setOption("cc", "track", { "languageCode": trackList.options[trackList.selectedIndex].value });    
                    //test4.innerHTML+=" setOpetion";
                }
                else if(trackList.getElementsByTagName("input")[0]!==null){
                    var inputList=trackList.getElementsByTagName('input');
                    for(var i=0;i<inputList.length;i++) {
                        if(inputList[i].checked){
                            player.setOption("captions", "track", { "languageCode": inputList[i].value });
                            player.setOption("cc", "track", { "languageCode": inputList[i].value });
                            break;
                        }                  
                    }
                }
                else{
                    player.setOption("captions", "track", { "languageCode": 'en' });
                    player.setOption("cc", "track", { "languageCode": 'en' });
                }
            }
            else{
                player.setOption("captions", "track", { "languageCode": 'en' });
                player.setOption("cc", "track", { "languageCode": 'en' });
            }
        }

}
function ccoff(player) {
    player.unloadModule("captions");  //Works for html5 ignored by AS3
    player.unloadModule("cc");  //Works for AS3 ignored by html5
        
}

// Currently supports div is a <select> element or sampleNode is an element that contains radio button and label
// with input option, must have a wrapper to wrap input and label together
function setListForVideoSync(player,div,defaultValue,essentialFunct,styling){
        
        var videoId,length=0;
        if(getQueryVariable(player.getVideoUrl(),'v')) videoId=getQueryVariable(player.getVideoUrl(),'v');
        
        var stylingFunctions;
        if(styling&&styling.stylingFunct) stylingFunctions=styling.stylingFunct;
        var inputArray = essentialFunct.actionSetUp(player);

        var actionNull, actionExist;
        if(essentialFunct.actionExist) actionNull=essentialFunct.actionNull;
        if (essentialFunct.actionExist) actionExist = essentialFunct.actionExist;

        wrap(inputArray);

        function wrap(inputArray){
            if(inputArray) length=inputArray.value.length;
            setList({
                valueArray:inputArray.value,
                nameArray:inputArray.name,
                listDiv:div,
                defaultValue:defaultValue,
                actionChange:change,
                actionNull:actionNull,
                actionExist:actionExist,
                stylingFunct:stylingFunctions
            });
        }

        player.addEventListener('onStateChange',wrapper2);
        function wrapper2(event) {
            var inputArray2 = essentialFunct.actionSetUp(player);
            var length2 = 0;
            wrap2(inputArray2);
            function wrap2(inputArray2) {
                if (inputArray2) length2 = inputArray2.value.length;
                if (length !== length2 || (getQueryVariable(player.getVideoUrl(), 'v') !== videoId)) {
                    videoId = getQueryVariable(player.getVideoUrl(), 'v');
                    setList({
                        valueArray: inputArray2.value,
                        nameArray: inputArray2.name,
                        listDiv: div,
                        defaultValue: defaultValue,
                        actionChange: change,
                        actionNull: actionNull,
                        actionExist: actionExist,
                        stylingFunct: stylingFunctions
                    });
                }
                length = length2;
            }
        }
        function change(item,value){
                essentialFunct.actionChange(player,value);
                if(div.getElementsByTagName("label")) var siblings=div.getElementsByTagName("label");
                else var siblings=item.parentNode.childNodes;
                if(styling&&styling.styleSelected&&styling.styleUnselected){
                    for(var k=0; k<siblings.length; k++) {styling.styleUnselected(siblings[k]);}
                    styling.styleSelected(item);
                }
        }

    }

// Currently supports div is a <select> element or sampleNode is an element that contains radio button and label
// with input option, must have a wrapper to wrap input and label together
function setListForVideoAsync(player, div, defaultValue, essentialFunct, styling) {
    //var div=document.getElementById(divId);
    var videoId/*, length = 0*/;
    if (getQueryVariable(player.getVideoUrl(), 'v')) videoId = getQueryVariable(player.getVideoUrl(), 'v');
    
    var stylingFunctions;
    if (styling && styling.stylingFunct) stylingFunctions = styling.stylingFunct;
    
    var actionNull, actionExist;
    if (essentialFunct.actionExist) actionNull = essentialFunct.actionNull;
    if (essentialFunct.actionExist) actionExist = essentialFunct.actionExist;
    //var inputArray = essentialFunct.actionSetUp(player, wrap);

    //if (inputArray) wrap(inputArray);
    /*else*/ essentialFunct.actionSetUp(player, wrap); //input array has no return value(happens when use async function in actionSetUp)

    

    function wrap(inputArray) {
//        if (inputArray)
//            length = inputArray.value.length;
        setList({
            valueArray: inputArray.value,
            nameArray: inputArray.name,
            listDiv: div,
            defaultValue: defaultValue,
            actionChange: change,
            actionNull: actionNull,
            actionExist: actionExist,
            stylingFunct: stylingFunctions
        });
    }

    player.addEventListener('onStateChange', wrapper2);
    function wrapper2(event) {
        if (getQueryVariable(player.getVideoUrl(), 'v') !== videoId) {
            //if (!essentialFunct.condition || essentialFunct.condition(event) !== false) {
                //var inputArray2 = essentialFunct.actionSetUp(player, wrap);
                // var length2 = 0;

                //if (inputArray2) wrap2(inputArray2);
                /*else*/essentialFunct.actionSetUp(player, wrap2); //input array has no return value(happens when use async function in actionSetUp)

                function wrap2(inputArray2) {
                    //if (inputArray2)
                    //length2 = inputArray2.value.length;
                    //test.innerHTML += " A:" + length + " B:" + length2;
                    //if (length !== length2 || (getQueryVariable(player.getVideoUrl(), 'v') !== videoId)) {
                    videoId = getQueryVariable(player.getVideoUrl(), 'v');
                    //length = length2;
                    setList({
                        valueArray: inputArray2.value,
                        nameArray: inputArray2.name,
                        listDiv: div,
                        defaultValue: defaultValue,
                        actionChange: change,
                        actionNull: actionNull,
                        actionExist: actionExist,
                        stylingFunct: stylingFunctions
                    });
                    //test3.innerHTML+=" ex:"+div.id;
                    //}
                }
            //}
        }
    }
    function change(item, value) {
        //                player.setOption("captions", "track", { "languageCode": value });
        //                player.setOption("cc", "track", { "languageCode": value });
        essentialFunct.actionChange(player, value);
        if (div.getElementsByTagName("label")) var siblings = div.getElementsByTagName("label");
        else var siblings = item.parentNode.childNodes;
        if (styling && styling.styleSelected && styling.styleUnselected) {
            for (var k = 0; k < siblings.length; k++) { styling.styleUnselected(siblings[k]); }
            styling.styleSelected(item);
        }
    }

}




function progressBarAndTimeSpanSetUp(player,div,timeSpan){
    //var div=document.getElementById(divId);
    //var timeSpan=document.getElementById(timeSpanId);
    var handle=div.getElementsByClassName('handle')[0];
    //var bar=div.getElementsByClassName('bar')[0];

    //player.addEventListener("onReady", function(){showCurrentTime(event.target, timeSpan);});
    showCurrentTime(player, timeSpan);

    timeSpan.nextElementSibling.innerHTML="/"+secondsToTimeText(player.getDuration());
    var timerPlaying;
    player.addEventListener("onStateChange", timeUpdate);
    
    //player.addEventListener("onReady", timeInitial);
    timeInitial(event);

    /*'click on bar' or 'drag handle'*/
    //handle.addEventListener("mousedown",dragTimeBar1);
    //handle.addEventListener("touchstart",dragTimeBar1);
    //div.addEventListener("click",clickTimeBar1);

    /*'click on bar' then 'drag handle'*/
    div.addEventListener('mousedown', clickTimeBar2);
    div.addEventListener('touchstart', clickTimeBar2);
    function clickTimeBar2(event) {
        clickTimeBar1(event);
        dragTimeBar1(event);    
    }



    if(div.getElementsByClassName("hoverTimeBlock")[0]) {
        var hoverTimeSpan=div.getElementsByClassName("hoverTimeBlock")[0];
        //div.addEventListener("mouseenter", hoverTimeBar1);
        div.addEventListener("mouseenter", hoverTimeBar1);
    }

    function timeUpdate(event){
        showCurrentTime(event.target, timeSpan);
        //updateSliderBarPosition(event.target, div);
        updateSliderBarPosition(player.getCurrentTime(),player.getDuration(), div);
        if (event.data === 1) {
                timerPlaying = setInterval(function () {
                    showCurrentTime(event.target, timeSpan);
                    //updateSliderBarPosition(event.target, div);
                    updateSliderBarPosition(player.getCurrentTime(), player.getDuration(), div);
                }, 100);     /*update per 100 milisecond*/
        }
        else {
                clearInterval(timerPlaying);
        }
        if(event.data===-1) timeSpan.nextElementSibling.innerHTML="/"+secondsToTimeText(player.getDuration());
    }
    function timeInitial(event){
        //updateSliderBarPosition(player, div);
        updateSliderBarPosition(player.getCurrentTime(), player.getDuration(), div);
        showCurrentTime(player, timeSpan);
        timeSpan.nextElementSibling.innerHTML="/"+secondsToTimeText(player.getDuration());
    }


    function dragTimeBar1(event) {
        // test3.innerHTML += "down ";
        event.preventDefault();
        var init = false;
        if (player.getPlayerState()!=2) init = true;
        player.pauseVideo();
        sliderBarMode(event,div, drag, end/*, exitEvent*/); /*!!!function in sliderBarMode must have (value,max) as input arguments*/      
        function drag(value, max, clearDrag) {
            //event.stopPropagation();
            
            if(value===max) {
                clearDrag();//test.innerHTML+=" cleared";
                value=max-1;
            }
            changeTime(player, value, max, timeSpan);//test.innerHTML+=" To:"+ value/max;
        }
        function end(value, max) {
            //event.stopPropagation();
            //if(value===max) return;
               // if(value!==max){
                    if (init === true) player.playVideo();
                    else player.pauseVideo();
               // }
                //else player.playVideo();
        }
    }
    
    function clickTimeBar1(event) {
//             var init = false;
//             if (player1.getPlayerState()!=2) init = true;
//             player1.pauseVideo();
        clickOnSliderBar(event,div,click); /*!!!function in clickOnSliderBar must have (value,max) as input arguments*/
//             if (init === true) player1.playVideo();
        function click(value, max) {
            if(value===max) value=max-1;
            changeTime(player, value, max, timeSpan);
        }
        //dragTimeBar1(event);
    }
         //timeBarImg.onmousemove = hoverTimeBar1;
    function hoverTimeBar1(event) {
        mouseEnterSliderBar(event,div, hover, leave);
        function hover(e, value, max) {
            hoverTimeSpan.style.display = "block";
            
            /*div.style.position = "relative";*/
            hoverTimeSpan.style.position = "absolute";
           // hoverTimeSpan.style.top = "-"+div.offsetHeight+"px";
            //follow mouse position, not value
            var co = mouseCoordsToElem(div, e);
            hoverTimeSpan.style.left = (co.x - hoverTimeSpan.offsetWidth / 2) + "px";
            var hoverText=div.getElementsByClassName("hoverTimeText")[0];
            displayTimeFromProportion(player, hoverText, value, max);
        }
        function leave(value, max) {
            hoverTimeSpan.style.display = "none";
        }
    //function enter(value, max) {}
    }
}

function volumeBarSetUp(player, div,axis) {
    var canva = div.getElementsByClassName('handle')[0];
    updateSliderBarPosition(player.getVolume(), 100, div, axis);
    
//    canva.addEventListener('mousedown', volumeControl);
//    canva.addEventListener("touchstart", volumeControl);
//    div.addEventListener('click', clickVolume);

    div.addEventListener('mousedown', pressDrag);
    div.addEventListener('touchstart', pressDrag);
    function pressDrag(event) {
        clickVolume(event);
        volumeControl(event);    
    }
    function volumeControl(event) {
        sliderBarMode(event, div, actionDrag, actionEnd, axis);
        function actionDrag(value, max, cleardrag) {
            player.setVolume(Math.round(value / max * 100));
        }
        function actionEnd(value, max) { }
    }
    function clickVolume(event) {
        clickOnSliderBar(event, div, actionClick, axis);
        function actionClick(value, max) {
            player.setVolume(Math.round(value / max * 100)); 
        }    
    }
}




function starEnd() {
    player1.cueVideoById({ 'videoId': 'kdrGqG5MphY',
        'startSeconds': 31,
        'suggestedQuality': 'default'
    });
}
function stopVideo() {
    player1.stopVideo();
}