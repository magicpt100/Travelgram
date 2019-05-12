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
} else {
  return "";
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
function return_home() {
    var url = new URLSearchParams(window.location.search);
    var id_token = get_token_from_url();
    if (id_token != "") {
      window.location.href= "../trip_list/index.html?"+"id_token=" + id_token;
    } else {
        window.location.href= "../trip_list/index.html"
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
      var token = get_token_from_url();
      var url = "../trip_details/index.html?TripID="+curTrip.TripID.toString()+'&title='+curTrip.Title + '&uid=' +curTrip.UserID.toString();
      if (token != "") {
        url += "&id_token=" + token
      }
      console.log(url)
      window.location.href = url;
  }).catch(function(error) {
      console.log(error)
    });


}

function delete_trip(el) {
    if (confirm("Confirm Delete the Trip?")){
        var url = new URL(window.location.href);
        var id_token = url.searchParams.get("id_token");
        var tripID = parseInt($(el.parentNode.parentNode.parentNode).prop('id'));
        console.log(tripID);
        console.log(parseJwt(id_token)["cognito:username"]);
        var apigClient = apigClientFactory.newClient({apiKey: 'liZiiPAuQY3d4Hpmojgv25SgyoLqQX2e1pTpoRYU'});
        apigClient.userUserNameTripTripIDDelete({"TripID":tripID, "userName":parseJwt(id_token)["cognito:username"]}, null,
            {headers:{"Authorization": id_token}}).then(function (result) {
            console.log(result);
            $(el.parentNode.parentNode.parentNode).remove();
        }).catch(function(error) {
            console.log(error);
        });
    }
}

function edit_trip(el) {
    var tid = $(el.parentNode.parentNode.parentNode).prop('id');
    var url = new URL(window.location.href);
    var id_token = get_token_from_url();
    window.location.href = "../forms/editTrip.html?TripID="+tid+"&id_token=" +id_token;

}

function load_trips_w_tags(ele) {
    // console.log($(ele).prop("id"));
    $(ele).toggleClass("tags_selected ");
    var tags_selected = [];
    $(".tags_selected").each(function () {
        tags_selected.push(this.id.replace("-", " "));
    });
    if (tags_selected.length !== 0 && $("#clear-tags").length === 0){
        $(ele.parentNode).append("<a id='clear-tags' onclick=clear_tags()><i class=\"fa fa-times\" aria-hidden=\"true\"></i>Clear</a>")
    }
    if (tags_selected.length === 0){
        clear_tags();
    }else{
        load_trips(filter=tags_selected)
    }

}

function clear_tags(){
    $(".tags").removeClass("tags_selected");
    $("#clear-tags").remove();
    load_trips();
}


    var TripItem;
    TripItem = function (arg,isFavorite) {
        //console.log(arg);
        isFavorite = typeof(isFavorite) !=="undefined"? isFavorite: false;
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
                if(!isFavorite){
                    $tripItem = $('.trip-item').clone().removeClass("trip-item").removeAttr("id");
                }else{
                    $tripItem = $('.trip-item-fav').clone().removeClass("trip-item-fav").removeAttr("id");

                }
                $tripItem.find('.title').html(this.title);
                $tripItem.find('.date').html(this.date);
                $tripItem.find('.readmore').attr('id', this.id);
                $tripItem.find('.like-span').html(this.numLikes.toString())
                if (this.like === true) {
                  $tripItem.find('.button-like').toggleClass("liked");
                }
                if (window.location.href.includes('id_token') === false)  {
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
                $tripItem.addClass("realtrip");
                $tripItem.css("display", "inline-block");
                if (!isFavorite){
                    $tripItem.insertBefore($('.last-item'));
                } else {
                    $tripItem.css('display', "block");
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
      // console.log(apigClient);
      apigClient.tripsGet({'userName': "st3174"})
        .then(function(result){
          console.log(result)
        });

    }

    function show_tripItem(arg,isFavorite){
        var tripItem = TripItem(arg,isFavorite);
        tripList.set(tripItem.id, tripItem);
        tripItem.draw();
    }

    function create_items(items,isFavorite) {
        isFavorite = typeof(isFavorite) !=="undefined"? isFavorite: false;
        var i = 0;
        items.forEach(function(item) {
            show_tripItem(item,isFavorite);
        });
    }

    function load_trips(filter=null) {
        $(".realtrip").remove();
        tripList.clear();
        var apigClient = apigClientFactory.newClient();
        // console.log("load trips");
        var userName = getUserNameByToken();
        if (userName != "") {
          apigClient.tripsGet({}, null, {headers:{'userName':userName}})
            .then(function(result){
              var trips = result.data;
              console.log(trips);
              trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));

                if (filter !== null){
                    console.log(filter);
                    var filtered_trips = [];
                    trips.forEach(function (ele) {
                        var tags = ele.Tags;
                        if (filter.every(elem => tags.indexOf(elem) > -1)){
                            filtered_trips.push(ele);
                        }
                    });
                    create_items(filtered_trips);
                }else{
                    create_items(trips);
                }
              $("#tmp1").hide();
              $("#tmp2").hide();

            }).catch(function(error) {
              console.log(error);
            });
        } else {
          apigClient.tripsGet()
            .then(function(result){
              var trips = result.data;
              console.log(trips);
              trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
                if (filter !== null){
                    console.log(filter);
                    var filtered_trips = [];
                    trips.forEach(function (ele) {
                        var tags = ele.Tags;
                        if (filter.every(elem => tags.indexOf(elem) > -1)){
                            filtered_trips.push(ele);
                        }
                    });
                    create_items(filtered_trips);
                }else{
                    create_items(trips);
                }
              $("#tmp1").hide();
              $("#tmp2").hide();
            }).catch(function(error) {
              console.log(error);
            });
        }
    }

    function load_my_trips() {
      tripList.clear();
      var apigClient = apigClientFactory.newClient();
      var url = new URL(window.location.href);
      var id_token = get_token_from_url();
      apigClient.userUserNameTripGet( {'userName': getUserNameByToken()},null,{headers:{"Authorization": id_token}})
        .then(function(result){
          var trips = result.data.user_trips;
          trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
          create_items(trips);
            $("#tmp1").hide();
            $("#tmp2").hide();

          var fav_trips = result.data.favoriteTrips;
          create_items(fav_trips,true);
          var tmp4 =  document.getElementById('tmp4');
          tmp4.parentNode.removeChild(tmp4);
          var tmp3 =  document.getElementById('tmp3');
          tmp3.parentNode.removeChild(tmp3);
        });
    }

    function load_search_results() {
        $(".widget_tag_cloud").hide();
        var apigClient = apigClientFactory.newClient();
        var url = new URL(window.location.href);
        var id_token = get_token_from_url();
        // console.log(id_token);
        var q = url.searchParams.get("q");
        apigClient.searchTripGet({"params": q})
            .then(function (result) {
                // console.log(result);
                var trips = result.data;
                trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
                create_items(trips);
                $("#tmp1").hide();
                $("#tmp2").hide();
            });

        // apigClient.userUserNameTripGet( {'userName': "Gilbert"},null,{headers:{"Authorization": id_token}})
        //     .then(function(result){
        //         var trips = result.data.user_trips;
        //         console.log(trips);
        //         trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
        //         create_items(trips);
        //         $("#tmp1").hide();
        //         $("#tmp2").hide();
        //     });
    }

    // function delete_trip(id) {
    //   var apigClient = apigClientFactory.newClient();
    //   var id_token = url.searchParams.get("id_token");
    //   console.log(apigClient);
    //   apigClient.userUserNameTripTripIDDelete({'userName': "st3174", 'tripID': id})
    //     .then(function(result){
    //       console.log(result)
    //     });
    // }
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

    var urlParams = new URLSearchParams(window.location.search);
    var q = urlParams.get("q");

    if (window.location.href.includes('my_trips')) {
      load_my_trips();
    } else if(q!=null){
        $("#breadtitle").html("Search Result");
        $(".page-list").append("<li>search result</li>");
        $("#search_bar").val(q);
        load_search_results();
    }else {
      load_trips();
    }
