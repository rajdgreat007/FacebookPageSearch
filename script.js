var fbPageSearch=(function(){
    var accessToken = "565249373560024|Diblm34UTfesJ4fNfnBqbzESCZE";
    var graphApiBaseUrl = "https://graph.facebook.com/";
    var pageList = [];
    var page = {};
    var cache = {};
    var cachedVars = {
        searchString : '',
        pageListContainer : document.getElementById('pageList'),
        searchButton : document.getElementById('searchButton'),
        searchText : document.getElementById('searchText'),
        pageContainer : document.getElementById('page'),
        lastClickedPage : null,
        topMargin : null
    };
    function receivePageList(data){
        pageList = data.data;
        fbPageSearch.showSearchedPageList();
        if(!cache.hasOwnProperty(cachedVars.searchString.replace(/ /g,'_'))){
            cache[cachedVars.searchString.replace(/ /g,'_')] = data;
        }
    }
    function receivePage(data){
        page = data;
        fbPageSearch.showPage();
        if(!cache.hasOwnProperty(page.id)){
            cache[page.id] = data;
        }
    }
    function fireAjax(url, callback){
        var xmlhttp;
        if (window.XMLHttpRequest) {
            xmlhttp = new XMLHttpRequest();
        } else {
            xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xmlhttp.onreadystatechange = function() {
            if (xmlhttp.readyState == 4 ) {
                if(xmlhttp.status == 200){
                    if (xmlhttp.responseText) callback(JSON.parse(xmlhttp.responseText));
                    else console.log('no records found')
                }
                else {
                    alert('Server Error occured. Please try again')
                }
            }
        };
        xmlhttp.open("GET", url, true);
        xmlhttp.send();
    }
    function bindEvent(element, type, handler) {
        if(element.addEventListener) {
            element.addEventListener(type, handler, false);
        } else {
            element.attachEvent('on'+type, handler);
        }
    }

    function setCookie(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays*24*60*60*1000));
        var expires = "expires="+d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires;
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1);
            if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
        }
        return "";
    }
    return{
        findPages : function(){
            cachedVars.searchString = cachedVars.searchText.value.trim();
            cachedVars.searchString != '' ?
                (
                    cache.hasOwnProperty(cachedVars.searchString.replace(/ /g,'_'))?
                        receivePageList(cache[cachedVars.searchString.replace(/ /g,'_')]):
                        fireAjax(graphApiBaseUrl+"search?q="+cachedVars.searchString+"&type=page&access_token="+accessToken, receivePageList)
                ) : alert('Please enter valid search term')
        },
        showPageList : function(heading,pageListSource){
            this.clearPageList();
            this.clearPage();
            var pageListContainer = cachedVars.pageListContainer;
            var h2 = document.createElement('h2');
            h2.innerHTML = heading;
            pageListContainer.appendChild(h2);
            for(var i=0;i<pageListSource.length;i++){
                var obj = pageListSource[i];
                var div = document.createElement("div");
                div.className = "pageItem"; div.id=obj.id;
                var h3 = document.createElement('h3');
                h3.innerHTML = obj.name;
                div.appendChild(h3);
                var p = document.createElement('p');
                p.innerHTML = obj.category;
                div.appendChild(p);
                var rating = document.createElement('div');
                rating.className='ratingBox';
                var txt = document.createElement('span'); txt.innerHTML = "Rate this Page";
                rating.appendChild(txt);
                var select = document.createElement('select'); select.id=obj.id; select.className="ratingSelect";
                var alreadyRated = getCookie(obj.id);
                for (var j = 0; j<=5; j++){
                    var opt = document.createElement('option');
                    opt.value = j;
                    opt.innerHTML = j;
                    if(alreadyRated && parseInt(alreadyRated) == j) opt.selected = 'selected';
                    select.appendChild(opt);
                }
                rating.appendChild(select);
                div.appendChild(rating);
                pageListContainer.appendChild(div);
            }
        },
        clearPageList : function(){
            pageList = [];
            var pageListContainer = cachedVars.pageListContainer;
            pageListContainer.innerHTML = "";
        },
        getPage : function(id){
            this.clearPage();
            cache.hasOwnProperty(id)? receivePage(cache[id]):fireAjax(graphApiBaseUrl+id,receivePage)
        },
        showPage : function(){
            var pageContainer = cachedVars.pageContainer;
            pageContainer.style.marginTop = cachedVars.topMargin+'px';
            for (var item in page) {
                if (page.hasOwnProperty(item) && typeof(page[item])!="boolean" && typeof(page[item])!="object") {
                    var p = document.createElement('p');
                    p.innerHTML = item+" : "+page[item];
                    pageContainer.appendChild(p);
                }
            }
        },
        clearPage : function(){
            page={};
            var pageContainer = cachedVars.pageContainer;
            pageContainer.innerHTML = "";
        },
        toggleClass : function(div){
            div.className = "pageItem active";
            if(cachedVars.lastClickedPage !== null) cachedVars.lastClickedPage.className = 'pageItem';
            cachedVars.lastClickedPage = div;
        },
        showSearchedPageList : function(){
            this.showPageList("Search Results : "+pageList.length+ " pages found.", pageList);
        },
        submitOnEnterKey : function(e){
            var event = e||window.event;
            if (event.keyCode == 13){
                cachedVars.searchButton.click();
            }
        },
        bindEvents : function(){
            var self = this;
            bindEvent(cachedVars.pageListContainer, 'click', function(e){
                var event = e||window.event;
                var target = event.target||event.srcElement;
                var div;
                if(target.className=='pageItem'){
                    div = target;
                }else if(target.parentNode.className=='pageItem'){
                    div = target.parentNode;
                }
                if(div){
                    cachedVars.topMargin = event.clientY+document.body.scrollTop-130;
                    self.getPage(div.id);
                    self.toggleClass(div);
                }
            });

            bindEvent(cachedVars.pageListContainer, 'change', function(e){
                var event = e||window.event;
                var target = event.target||event.srcElement;
                if(target.className=='ratingSelect'){
                    setCookie(target.id,target.value,10);
                }
            });

            bindEvent(cachedVars.searchText, 'keyup', self.submitOnEnterKey);
            bindEvent(cachedVars.searchButton, 'click', self.findPages)
        },
        init : function(){
            this.bindEvents();
        }
    }
})();
window.onload= fbPageSearch.init();