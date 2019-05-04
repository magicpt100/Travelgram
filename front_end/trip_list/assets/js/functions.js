var positions = [];
function delete_node(el) {

  console.log($(el.parentNode));
}
function mytrips() {
    var url = new URL(window.location.href);
    var token = url.searchParams.get("id_token");
    var token = location.hash.substring(1).split("&")[0].split("=")[1];
    if (token == null){
      token = "eyJraWQiOiJmelBrQXg3dkpCSlNNRmt5U3VMMkp1V2d2M2VpMkt2MGVBVkhmOVMzZnVFPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiTTA5SXVMeUhpc1BfTUdjbVh6SWJRZyIsInN1YiI6IjFhZmFkYjRhLTA1ZjgtNGIwZS1iNjkwLTIzZmE5YTJlZDZkNSIsImF1ZCI6IjQ5czd2amJodWlwODMxcWExMmc4cHZhNnJpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNTU2OTk4MjgxLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9sTERZdERoakgiLCJjb2duaXRvOnVzZXJuYW1lIjoiR2lsYmVydFgiLCJleHAiOjE1NTcwMDE4ODEsImlhdCI6MTU1Njk5ODI4MSwiZW1haWwiOiJkd3lhbmVnaWxiZXJ0QGdtYWlsLmNvbSJ9.h3gtiXxxBOF_T73SbMR1EcrjxLcnDcOgVbP4tX9uHmiXI7CsC6arY4YYd33qEPbQ9m5BZfSho-l4foOh7k12NHzDrpJuLQaCNuAS5PYSTEwsjj-gekiP4Azc8Q_T39epL9PkPHUzfEGk38PViTOvfM5ZhH3SQDcLQoDH0nBpBpJVR0T6xUU8sTIKQHMx5QAyKMGaE4MwWxQwLBxqVcNq0jsQzzyrTdwWvHcUNvgZqHKz2GYPbmvfwjSh25ZHTv1zVztg4-tcyPPTamuY2-5qx4DW6AHv4L595ixNFEKAssKtuodbMdRv1nC1UtG7BuzHpJFdC9cNOatqV2-gx4Jj1w"
    }
    if (token) {
      window.location.href = "my_trips.html?id_token="+token;
    }

}

function create_trip() {
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
};

function tripDetail(trip) {
  console.log($(trip).prop('id'));
  var url = "../trip_details/index.html?TripID="+$(trip).prop('id');

  window.location.href = "../trip_details/index.html?TripID="+$(trip).prop('id');
}
(function () {
    var TripItem;
    TripItem = function (arg) {
        this.title = arg.Title, this.description = arg.Content;
        this.author = arg.UserID
        this.date = get_date(arg.StartTime);
        this.id = arg.TripID;
        this.cover = arg.CoverPhoto;
        this.draw = function (_this, pos) {
            return function (pos) {
                var $tripItem;
                $tripItem = $('.trip-item').clone().removeClass("trip-item").removeAttr("id");
                $tripItem.find('.title').html(_this.title);
                $tripItem.find('.date').html(_this.date);
                $tripItem.find('.readmore').attr('id', this.id)
                $tripItem.attr('id', this.id)
                $tripItem.find('.cover').attr("src",this.cover);

                //$tiemlineItem.find('.date').html(_this.date);
                if ("Images" in arg) {
                    $tripItem = $('.tiemline-withimage').clone().removeClass("tiemline-withimage");
                    $tripItem.find('.title').html(_this.title);
                    $tripItem.find('.date').html(_this.date);
                    $tripItem.find('.description').html(_this.description);
                    $tripItem.attr('id', this.id)
                    console.log($tripItem.prop('id'));
                    positions.push(pos);
                }
                $tripItem.insertBefore($('.last-item'));
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
    function get_nodes() {
      var apigClient = apigClientFactory.newClient();
      console.log(apigClient);
      apigClient.tripsGet({'userName': "st3174"})
        .then(function(result){
          console.log(result)
        });

    }

    function show_tripItem(arg, i){
        var tripItem = TripItem(arg);
        tripItem.draw(i);
    }

    function create_items(items) {
        var i = 0;
        items.forEach(function(item) {
               show_tripItem(item, i++);
        });
    }

    function load_trips() {
      var apigClient = apigClientFactory.newClient();
      console.log("load trips");
      apigClient.tripsGet()
        .then(function(result){
          var trips = result.data;
          trips.sort((a,b) => (a.StartTime > b.StartTime) ? 1 : ((b.StartTime > a.StartTime) ? -1 : 0));
          create_items(trips);
          var tmp2 =  document.getElementById('tmp2');
          var tmp1 = document.getElementById('tmp1');
          tmp2.parentNode.removeChild(tmp2);
          tmp1.parentNode.removeChild(tmp1);
        });
    }

    function load_my_trips() {
      var apigClient = apigClientFactory.newClient();
      var url = new URL(window.location.href);
      var id_token = url.searchParams.get("id_token");
      console.log(id_token)
      apigClient.userUserNameTripGet( {'userName': "Gilbert"},null,{headers:{"Authorization": id_token}})
        .then(function(result){
          var trips = result.data.user_trips
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
      console.log(apigClient);
      apigClient.userUserNameTripTripIDDelete({'userName': "st3174", 'tripID': id})
        .then(function(result){
          console.log(result)
        });
    }
    if (window.location.href.includes('id_token')) {
      document.getElementById("login").style.display = "none";
      var id_token = location.hash.substring(1).split("&")[0].split("=")[1];
      if (id_token == null){
        id_token = "eyJraWQiOiJmelBrQXg3dkpCSlNNRmt5U3VMMkp1V2d2M2VpMkt2MGVBVkhmOVMzZnVFPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiTTA5SXVMeUhpc1BfTUdjbVh6SWJRZyIsInN1YiI6IjFhZmFkYjRhLTA1ZjgtNGIwZS1iNjkwLTIzZmE5YTJlZDZkNSIsImF1ZCI6IjQ5czd2amJodWlwODMxcWExMmc4cHZhNnJpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNTU2OTk4MjgxLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9sTERZdERoakgiLCJjb2duaXRvOnVzZXJuYW1lIjoiR2lsYmVydFgiLCJleHAiOjE1NTcwMDE4ODEsImlhdCI6MTU1Njk5ODI4MSwiZW1haWwiOiJkd3lhbmVnaWxiZXJ0QGdtYWlsLmNvbSJ9.h3gtiXxxBOF_T73SbMR1EcrjxLcnDcOgVbP4tX9uHmiXI7CsC6arY4YYd33qEPbQ9m5BZfSho-l4foOh7k12NHzDrpJuLQaCNuAS5PYSTEwsjj-gekiP4Azc8Q_T39epL9PkPHUzfEGk38PViTOvfM5ZhH3SQDcLQoDH0nBpBpJVR0T6xUU8sTIKQHMx5QAyKMGaE4MwWxQwLBxqVcNq0jsQzzyrTdwWvHcUNvgZqHKz2GYPbmvfwjSh25ZHTv1zVztg4-tcyPPTamuY2-5qx4DW6AHv4L595ixNFEKAssKtuodbMdRv1nC1UtG7BuzHpJFdC9cNOatqV2-gx4Jj1w"
      }
      var username = parseJwt(id_token)["cognito:username"];
      window.onload = function() {
          document.getElementById("username").innerHTML = username;

      }

    } else {
      document.getElementById("username").style.display = "none";

    }
    if (window.location.href.includes('my_trips')) {
      load_my_trips();
    } else {
      load_trips();
    }

}.call(this));
