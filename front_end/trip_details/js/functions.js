var positions = [];
var url = new URL(window.location.href);
var tripid = url.searchParams.get("TripID");
var triptitle = url.searchParams.get("title");
var uid = url.searchParams.get("uid");
var id_token = url.searchParams.get("id_token");
function getUserNameByToken() {
  if (window.location.href.includes('id_token')) {
    var id_token = url.searchParams.get("id_token");
    if (id_token == null) {
      id_token = location.hash.substring(1).split("&")[0].split("=")[1];
    }
    var username = parseJwt(id_token)["cognito:username"];
    return username;
}
}

function get_token_from_url() {
  var token = url.searchParams.get("id_token");
  if (token == null) {
    token = location.hash.substring(1).split("&")[0].split("=")[1];
  }
  if (token == null || token == "") {
    return ""
  } else {
    return token
  }
}
function return_home() {
    var url = new URLSearchParams(window.location.search);
    var id_token = get_token_from_url();
    if (id_token != "") {
      window.location.href= "../trip_list/index.html?"+"id_token=" + id_token;
    } else {
        window.location.href= "../trip_list/index.html"
    }

}
function delete_node(el) {
    if (confirm("Confirm delete this node?")){
        var username = getUserNameByToken();
        var apigClient = apigClientFactory.newClient();
        var url = new URL(window.location.href);
        var nid = $(el.parentNode.parentNode).prop('id');
        var tripid = url.searchParams.get("TripID");
        var id_token = url.searchParams.get("id_token");
        console.log(username)
        var url = new URL(window.location.href);
        apigClient.tripTripIDNodesNodeIDDelete({'NodeID': nid, 'TripID': tripid},null, {headers:{"Authorization": id_token}}).then(function(result) {
            console.log("success");
            $(el.parentNode.parentNode).hide();
        }).catch(function(error) {
            console.log(error);
        })
    }

}
function edit_node(el) {
  var nid = $(el.parentNode.parentNode).prop('id');
  var url = new URL(window.location.href);
  var title = url.searchParams.get("title");
  window.location.href = "../forms/editNode.html?NodeID="+nid+"&id_token=" +id_token+"&title="+title+"&TripID="+tripid + "&uid="+ uid;

}

function add_node() {
  window.location.href = "../forms/createNode.html?TripID="+tripid +"&id_token=" +id_token+"&title="+triptitle + "&uid=" + uid;
}

function mytrips() {
    var url = new URL(window.location.href);
    var token = url.searchParams.get("id_token");
    if (token == null) {
      token = location.hash.substring(1).split("&")[0].split("=")[1];
    }

    if (token) {
      window.location.href = "../trip_list/my_trips.html?id_token="+token;
    }

}
function parseJwt(token) {
  try {
    // Get Token Header
    const base64HeaderUrl = token.split('.')[0];
    const base64Header = base64HeaderUrl.replace('-', '+').replace('_', '/');
    const headerData = JSON.parse(window.atob(base64Header));

    // Get Token payload and date's
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    const dataJWT = JSON.parse(window.atob(base64));
    dataJWT.header = headerData;
    return dataJWT;
  } catch (err) {
    return false;
  }
}
function removeAuthorOptions() {
  //document.getElementById("first-item").style.display = "none";
  document.getElementById("last-item").style.display = "none";
  var ebtns = Array.from(document.getElementsByClassName("edit-btn"));
  var dbtns = Array.from(document.getElementsByClassName("delete-btn"));
  var author_btns = ebtns.concat(dbtns);
  author_btns.forEach(function(btn) {
  btn.style.display = "none";
});
}
(function () {
    var TimelineItem;
    TimelineItem = function (arg) {
      console.log(arg)
        this.title = arg.Title, this.description = arg.Content;
        this.date = get_date(arg.Time);
        this.address = arg.Address;
        this.id = arg.NodeID;
        this.rate = arg.Rate;
        this.price = arg.Price;
        this.draw = function (_this, pos) {
            return function (pos) {
                var $timelineItem;
                $timelineItem = $('.right-item').clone().removeClass("right-item");
                $timelineItem.find('.title').html(_this.title);
                $timelineItem.find('.description').html(_this.description);
                $timelineItem.find('.date').html(_this.date);
                $timelineItem.attr('id', this.id)
                $timelineItem.find('.location').html('<span class="glyphicon glyphicon-map-marker"></span> '+_this.address + ' · ' +_this.price);
                var stars = ""
                 for (i =1; i <= _this.rate; i++) {
                  stars += '<span class="glyphicon glyphicon-star green"></span>'
                }
                for (i=_this.rate; i <5; i++) {
                  stars += '<span class="glyphicon glyphicon-star-empty green"></span>'
                }

                  $timelineItem.find('.starrr').html(stars);
                console.log(this.id)
                //$tiemlineItem.find('.date').html(_this.date);
                if ("Images" in arg) {
                    $timelineItem = $('.tiemline-withimage').clone().removeClass("tiemline-withimage");
                    $timelineItem.find('.title').html(_this.title);
                    $timelineItem.find('.date').html(_this.date);
                    $timelineItem.find('.description').html(_this.description);
                    $timelineItem.attr('id', this.id)
                    $timelineItem.find('.location').html('<span class="glyphicon glyphicon-map-marker"></span> '+_this.address + ' · ' +_this.price);
                    $timelineItem.find('.starrr').html(stars);
                    positions.push(pos);
                }
                $timelineItem.css("display", "inline-block");
                $timelineItem.insertBefore($('.last-item'));
            };
        }(this);
        return this;
    };
    function get_date(date) {
        date = new Date(date*1000);
        var monthname = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var d = date;
        var hh = d.getHours();
        var dd = "AM";
        var h = hh;
        if (h >= 12) {
          h = hh - 12;
          dd = "PM";
        }
        if (h == 0) {
          h = 12;
        }
        var formatted = h + " " + dd +", "+ d.getDate()+" " + monthname[d.getMonth()]+" "+d.getFullYear();
        // console.log(formatted);
        return formatted
    }
    function get_nodes(tid, uid) {
      var apigClient = apigClientFactory.newClient();
      apigClient.tripTripIDNodesGet({'TripID': tid})
        .then(function(result){
            items = result.data;
            items.sort((a,b) => (a.Time > b.Time) ? 1 : ((b.Time > a.Time) ? -1 : 0));
            create_items(items);
            var tmp2 =  document.getElementById('tmp2');
            var tmp1 = document.getElementById('tmp1');
            tmp2.parentNode.removeChild(tmp2);
            tmp1.parentNode.removeChild(tmp1);
            var swiperid = 0;
            var elements = document.getElementsByClassName('swiper-container');
            Array.prototype.forEach.call(elements, function (element) {
                element.className += " " + 'swiper-container'+swiperid++;
            });
            var i;
            for (i = 0; i < swiperid; i++) {
              var swiper = new Swiper('.swiper-container'+i);
              var pos = positions[i];
              var images = items[pos].Images;
              var urls = []
             Array.prototype.forEach.call(images, function (image) {
                urls.push(image.Url);
             });
             Array.prototype.forEach.call(images, function (image) {
                 var slide = "<div class='swiper-slide'> <img src='" + image.Url +"' alt=''/></div>"
                var newSlide = swiper.appendSlide(slide,'swiper-slide blue-slide','div');
             });
            }
          // Add success callback code here.
        }).catch( function(result){
            console.log(result);
          // Add error callback code here.
        });
    }

    function show_timelineItem(arg, i){
        var timelineItem = TimelineItem(arg);
        timelineItem.draw(i);
    }

    function create_items(items) {
        var i = 0;
        items.forEach(function(item) {
               show_timelineItem(item, i++);
        });
    }

    document.getElementById("trip-title").innerHTML = triptitle;
    var apigClient = apigClientFactory.newClient({apiKey: 'liZiiPAuQY3d4Hpmojgv25SgyoLqQX2e1pTpoRYU'});
    apigClient.getnameUserIdGet({"userId": uid}).then(function (result) {
        document.getElementById("trip-author").innerHTML = result.data['Username'];
        var url = new URL(window.location.href);
        var id_token = get_token_from_url();
        if (id_token != "") {
          var username = parseJwt(id_token)["cognito:username"];
          window.onload = function() {
              document.getElementById("username").innerHTML = username;
          }
          //document.getElementById("username").style.dislpay="block";
          if (username != result.data['Username']) {
            removeAuthorOptions();
          }

        } else {
          document.getElementById("login").style.display="block";
          removeAuthorOptions();
        }

        // check whether the author of this trip is the same as the current user.
    }).catch(function(error) {
          document.getElementById("trip-author").innerHTML = 'admin';
          console.log(error)
          removeAuthorOptions();
      });
      var id_token = get_token_from_url()
      if (id_token != "") {
        var element = document. getElementById("login");
        element.parentNode.removeChild(element);
        var username = parseJwt(id_token)["cognito:username"];
        window.onload = function() {
            document.getElementById("username").innerHTML = username;
        }

      } else {
        var element = document.getElementById("usernameEle");
        element.parentNode.removeChild(element);
        console.log(element)

      }
    get_nodes(tripid, uid);
}.call(this));
