var positions = [];
var tripList = new Map([]);
var url = new URL(window.location.href);
var apigClient = apigClientFactory.newClient({apiKey: 'liZiiPAuQY3d4Hpmojgv25SgyoLqQX2e1pTpoRYU'});
function delete_node(el) {

  console.log($(el.parentNode));
}
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
function likeTrip(btn) {
  var username = getUserNameByToken();
  var tripid = $(btn.parentNode.parentNode.parentNode).prop('id')
  if ($(btn).hasClass("liked") == false) {
    // send like request

    apigClient.favoriteTripPost({"TripID": parseInt(tripid), "UserName": username, }, {"TripID": parseInt(tripid), "UserName": username}, {headers:{"Authorization": id_token}}).then(function (result) {
        $(btn).addClass("liked");
        var numLike = $(btn.parentNode.parentNode.parentNode).find('.like-span').html()
        console.log(numLike)
        numLike = parseInt(numLike) + 1
        numLike = numLike.toString()
        $(btn.parentNode.parentNode.parentNode).find('.like-span').html(numLike)

    }).catch(function (error) {
      console.log(error)
    })
  } else {
    // cancel like
        console.log(id_token)
    apigClient.favoriteTripTripIDUserNameDelete({'UserName':username, "TripID": parseInt(tripid)}, null, {headers:{"Authorization": id_token}}).then(function(result) {
      $(btn).removeClass("liked");
      var numLike = $(btn.parentNode.parentNode.parentNode).find('.like-span').html()
      console.log(numLike)
      numLike = parseInt(numLike) - 1
      numLike = numLike.toString()
      $(btn.parentNode.parentNode.parentNode).find('.like-span').html(numLike)
    }).catch(function (error) {
      console.log(error);
    })
  }
}
function mytrips() {
    var url = new URL(window.location.href);
    var token = url.searchParams.get("id_token");
    if (token == null) {
      token = location.hash.substring(1).split("&")[0].split("=")[1];
    }

    if (token) {
      window.location.href = "my_trips.html?id_token="+token;
    }

}

function create_trip() {
  console.log("you are in!")
  var url = new URL(window.location.href);
  var token = url.searchParams.get("id_token");
  url = "../forms/createTrip.html?id_token=" + token;
  window.location.href = url;
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

function tripDetail(trip) {
  var apigClient = apigClientFactory.newClient({apiKey: 'liZiiPAuQY3d4Hpmojgv25SgyoLqQX2e1pTpoRYU'});
  apigClient.getonetripTripIDGet({"TripID": $(trip).prop('id')}).then(function (result) {
      console.log(result.data)
      var curTrip = result.data
      var cur_url = new URL(window.location.href);
      var token = cur_url.searchParams.get("id_token");
      var url = "../trip_details/index.html?TripID="+curTrip.TripID.toString()+'&title='+curTrip.Title + '&uid=' +curTrip.UserID.toString();
      if (token != null) {
        url += "&id_token=" + token
      }
      console.log(url)
      window.location.href = url;
  }).catch(function(error) {
      console.log(error)
    });


}
(function () {
    var TripItem;
    TripItem = function (arg) {
        //console.log(arg);
        this.title = arg.Title;
        this.description = arg.Content;
        this.author = arg.UserID;
        this.date = get_date(arg.StartTime);
        this.id = arg.TripID;
        this.cover = arg.CoverPhoto;
        this.numLikes = arg.NumLikes;
        this.username = arg.Username;
        this.liked = arg.isLikeByUser;
        if (arg.isLikeByUser == true) {
          this.like = true;
        } else{
          this.like = false;
        }
        apigClient.getnameUserIdGet({"userId": this.author}).then(function (result) {
            this.authorname = result.data['Username'];
        }).catch(function(error) {
            this.authorname = 'undefined';
          });
        this.draw = function () {
            return function () {
                var $tripItem;
                $tripItem = $('.trip-item').clone().removeClass("trip-item").removeAttr("id");
                $tripItem.find('.title').html(this.title);
                $tripItem.find('.date').html(this.date);
                $tripItem.find('.readmore').attr('id', this.id);
                $tripItem.find('.like-span').html(this.numLikes.toString())
                if (this.like == true) {
                  $tripItem.find('.button-like').toggleClass("liked");
                }
                if (window.location.href.includes('id_token') == false)  {
                  //$tripItem.find('.button-like').hide();
                  $tripItem.find('.button-like').attr("disabled", true);
                } else {
                    if (this.liked) {
                      $tripItem.find('.button-like').addClass("liked")
                    }
                }
                $tripItem.attr('id', this.id);
                $tripItem.find('.cover').attr("src",this.cover);
                var apigClient = apigClientFactory.newClient({apiKey: 'liZiiPAuQY3d4Hpmojgv25SgyoLqQX2e1pTpoRYU'});
                apigClient.getnameUserIdGet({"userId": this.author}).then(function (result) {
                    $tripItem.find('.author').html(result.data['Username']);
                    var id = $tripItem.prop('id')
                    var curTrip = tripList.get(parseInt($tripItem.prop('id')));
                    curTrip.id = id
                    curTrip.authorname = result.data['Username'];
                }).catch(function(error) {
                      $tripItem.find('.author').html('undefined');
                      this.authorname = 'undefined';
                      console.log(error)
                  });
                if ($(".last-item")[0]){
                    $tripItem.insertBefore($('.last-item'));
                } else {
                    $tripItem.insertBefore($('.last-item-fav'));
                }
            };
        }(this);
        return this;
    };
    function get_date(date) {
        date = new Date(date*1000);
        var monthname = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var d = date;
        var formatted = d.getDate()+" " + monthname[d.getMonth()]+" "+d.getFullYear();
        return formatted
    }
    function get_nodes() {
      var apigClient = apigClientFactory.newClient();
      console.log(apigClient);
      apigClient.tripsGet({'userName': "st3174"})
        .then(function(result){
          console.log(result)
        });

    }

    function show_tripItem(arg){
        var tripItem = TripItem(arg);
        tripList.set(tripItem.id, tripItem);
        tripItem.draw();
    }

    function create_items(items, tag=null) {
        var i = 0;
        items.forEach(function(item) {
            if (tag == null) {
                show_tripItem(item);
            }else if(item.Tags.includes(tag)){
                show_tripItem(item);
            }
        });
    }

    function load_trips() {
      tripList.clear();
      var apigClient = apigClientFactory.newClient();
      console.log("load trips");
      var userName = getUserNameByToken();
      apigClient.tripsGet({}, null, {headers:{'userName':userName}})
        .then(function(result){
          var trips = result.data;
          console.log(trips);
          trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
          var urlParams = new URLSearchParams(window.location.search);
          var tag = urlParams.get("tag");
          if (tag==null){
              create_items(trips);
          }else{
              $("#breadtitle").html("Tag: "+tag);
              $(".page-list").append("<li>"+tag+"</li>");
              create_items(trips, tag)
          }

          var tmp2 =  document.getElementById('tmp2');
          var tmp1 = document.getElementById('tmp1');
          tmp2.parentNode.removeChild(tmp2);
          tmp1.parentNode.removeChild(tmp1);
        }).catch(function(error) {
          console.log(error);
        });
    }

    function load_my_trips() {
      tripList.clear();
      var apigClient = apigClientFactory.newClient();
      var url = new URL(window.location.href);
      var id_token = url.searchParams.get("id_token");
      console.log(id_token);
      apigClient.userUserNameTripGet( {'userName': getUserNameByToken()},null,{headers:{"Authorization": id_token}})
        .then(function(result){
          var trips = result.data.user_trips;
          trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
          create_items(trips);
          var tmp2 =  document.getElementById('tmp2');
          var tmp1 = document.getElementById('tmp1');
          tmp2.parentNode.removeChild(tmp2);
          tmp1.parentNode.removeChild(tmp1);

          var fav_trips = result.data.favoriteTrips;
          create_items(fav_trips);
            var tmp4 =  document.getElementById('tmp4');
            var tmp3 = document.getElementById('tmp3');
            tmp4.parentNode.removeChild(tmp4);
            tmp3.parentNode.removeChild(tmp3);
        });
    }

    function load_search_results() {
        var apigClient = apigClientFactory.newClient();
        var url = new URL(window.location.href);
        var id_token = url.searchParams.get("id_token");
        console.log(id_token);
        var q = url.searchParams.get("q");
        apigClient.searchTripGet({"params": q})
            .then(function (result) {
                console.log(result);
                var trips = result.data;
                trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
                create_items(trips);
                var tmp2 =  document.getElementById('tmp2');
                var tmp1 = document.getElementById('tmp1');
                tmp2.parentNode.removeChild(tmp2);
                tmp1.parentNode.removeChild(tmp1);
            });

        apigClient.userUserNameTripGet( {'userName': "Gilbert"},null,{headers:{"Authorization": id_token}})
            .then(function(result){
                var trips = result.data.user_trips;
                trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
                create_items(trips);
                var tmp2 =  document.getElementById('tmp2');
                var tmp1 = document.getElementById('tmp1');
                tmp2.parentNode.removeChild(tmp2);
                tmp1.parentNode.removeChild(tmp1);
            });
    }

    function delete_trip(id) {
      var apigClient = apigClientFactory.newClient();
      var id_token = url.searchParams.get("id_token");
      console.log(apigClient);
      apigClient.userUserNameTripTripIDDelete({'userName': "st3174", 'tripID': id})
        .then(function(result){
          console.log(result)
        });
    }
    if (window.location.href.includes('id_token')) {
      document.getElementById("login").style.display = "none";
      var id_token = url.searchParams.get("id_token");
      if (id_token == null) {
        id_token = location.hash.substring(1).split("&")[0].split("=")[1];
      }
      var username = parseJwt(id_token)["cognito:username"];
      window.onload = function() {
          document.getElementById("username").innerHTML = username;

      }

    } else {
      document.getElementById("username").style.display = "none";

    }

    var urlParams = new URLSearchParams(window.location.search);
    var q = urlParams.get("q");

    if (window.location.href.includes('my_trips')) {
      load_my_trips();
    } else if(q!=null){
        $("#breadtitle").html("Search Result");
        $(".page-list").append("<li>search result</li>");
        load_search_results();
    }else {
      load_trips();
    }

}.call(this));
