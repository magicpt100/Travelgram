var positions = [];
var url = new URL(window.location.href);
var id = url.searchParams.get("TripID");
var title = url.searchParams.get("title");
var uid = url.searchParams.get("uid");
var id_token = url.searchParams.get("id_token");
function delete_node(el) {
  console.log($(el.parentNode).prop('id'));
}
function edit_node(el) {
  var nid = $(el.parentNode.parentNode).prop('id');
  window.location.href = "../forms/editNode.html?NodeID="+nid+"&id_token=" +id_token;

}

function add_node() {
  window.location.href = "../forms/createNode.html?TripID="+id +"&id_token=" +id_token;
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
  document.getElementById("first-item").style.display = "none";
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
        this.title = arg.Title, this.description = arg.Content;
        this.date = get_date(arg.Time);
        this.id = arg.NodeID;
        this.draw = function (_this, pos) {
            return function (pos) {
                var $timelineItem;
                $timelineItem = $('.right-item').clone().removeClass("right-item");
                $timelineItem.find('.title').html(_this.title);
                $timelineItem.find('.description').html(_this.description);
                $timelineItem.find('.date').html(_this.date);
                $timelineItem.attr('id', this.id)
                console.log(this.id)
                //$tiemlineItem.find('.date').html(_this.date);
                if ("Images" in arg) {
                    $timelineItem = $('.tiemline-withimage').clone().removeClass("tiemline-withimage");
                    $timelineItem.find('.title').html(_this.title);
                    $timelineItem.find('.date').html(_this.date);
                    $timelineItem.find('.description').html(_this.description);
                    $timelineItem.attr('id', this.id)
                    positions.push(pos);
                }
                $timelineItem.insertBefore($('.last-item'));
            };
        }(this);
        return this;
    };
    function get_date(date) {
        date = new Date(date*1000);
          var monthname = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
          var d = new Date();
          var formatted = +d.getDate()+" " + monthname[d.getMonth()]+" "+d.getFullYear();
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

    document.getElementById("trip-title").innerHTML = title;
    var apigClient = apigClientFactory.newClient({apiKey: 'liZiiPAuQY3d4Hpmojgv25SgyoLqQX2e1pTpoRYU'});
    apigClient.getnameUserIdGet({"userId": uid}).then(function (result) {
        document.getElementById("trip-author").innerHTML = result.data['Username'];
        var url = new URL(window.location.href);
        if (window.location.href.includes('id_token'))  {
          var id_token = url.searchParams.get("id_token");
          var username = parseJwt(id_token)["cognito:username"];
          if (username != result.data['Username']) {
            console.log(result.data['Username'])
            removeAuthorOptions();
          }

        } else {
          removeAuthorOptions();
        }

        // check whether the author of this trip is the same as the current user.
    }).catch(function(error) {
          document.getElementById("trip-author").innerHTML = 'admin';
          console.log(error)
          removeAuthorOptions();
      });

    get_nodes(id, uid);
}.call(this));
