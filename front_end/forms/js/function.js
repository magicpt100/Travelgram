(function () {
    // find the token
    function parse_query_string() {
      var url = new URL(window.location.href.replace("#", "?"));
      var c = url.searchParams.get("id_token");
      return c;
    }

    function getBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
    }

  function get_date(date) {
    date = new Date(date*1000);
    var d = date;
    return d.getMonth() + "/" + d.getDate() + "/" + d.getFullYear()
  }



    // var id_token = location.hash.substring(1).split("&")[0].split("=")[1];
    var url = new URL(window.location.href);
    var id_token = url.searchParams.get("id_token");

    var parseJwt = function (token) {
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
    const username = parseJwt(id_token)["cognito:username"];

    apigClient = apigClientFactory.newClient();
  $( "#create-trip-node" ).click(async function() {
    var node_name = $("input[name=node_name]").val();
    var datetime = new Date($("input[name=datetime]").val());
    var address = $("input[name=address]").val();
    var rating = $("#sel1 option:selected").text();
    var price = $("#sel2 option:selected").text();
    var text = $("#nodetext").val();

    var files = upload.cachedFileArray;
    var files64 = [];
    for (var i = 0; i < files.length; i++) {
      var promise = getBase64(files[i]);
      var new_file = await promise;
      var file_dict = {"FileName": files[i].name, "FileContent": new_file.replace(/^data:image\/[a-z]+;base64,/, "")};
      files64.push(file_dict);
      console.log(file_dict)
    }
    var body = {
      'Address':address,
      'Rate': parseFloat(rating),
      'Title': node_name,
      'Time': parseInt(datetime.getTime())/1000,
      'Content': text,
      'Price': price,
      'Images':files64,
      'userName': username
    };

    var url = new URL(window.location.href);
    var TripID = parseInt(url.searchParams.get("TripID"));
    var params = {
      'TripID': TripID
    };

    apigClient.tripTripIDNodesPost(params, body, {headers:{"Authorization": id_token}})
    .then(function(result){
      var url = new URL(window.location.href);
      var TripID = url.searchParams.get("TripID");
      var id_token = url.searchParams.get("id_token");
      var title = url.searchParams.get("title");
      window.location = "../trip_details/index.html?TripID=" + TripID + "&id_token=" + id_token + "&title=" + title;

    }).catch( function(result){
        console.log("there is something wrong!!!");
        // Add error callback code here.
      });
  });


  $( "#create-trip" ).click(async function() {
    var trip_name = $("input[name=trip_title]").val();
    var datetime1 = new Date($("input[name=datetime1]").val());
    var datetime2 = new Date($("input[name=datetime2]").val());

    var destination = $("input[name=dest]").val();
    var tags = $("input[id=tokenfield]").val().split(", ");

    var file = document.getElementById('my-file-selector').files[0];
    var promise = getBase64(file);
    var file_content = await promise;
    file_content = file_content.replace(/^data:image\/[a-z]+;base64,/, "");
    // console.log(file_content);

    var body = {
      'Title':trip_name,
      'Dst': destination,
      'StartTime':parseInt(datetime1.getTime())/1000,
      'EndTime':parseInt(datetime2.getTime())/1000,
      'Tags':tags,
      "CoverPhoto":{
        "FileName":file.name,
        "FileContent": file_content,

      }
    };

    var params = {
      'userName':username
    };
    apigClient.userUserNameTripPost(params, body, {headers:{"Authorization": id_token}})
    .then(function(result){
      console.log(result);
        // Add success callback code here.
        var url = new URL(window.location.href);
        var id_token = url.searchParams.get("id_token");

        window.location = "../trip_list/my_trips.html?id_token=" + id_token;
      }).catch( function(result){
        console.log("there is something wrong!!!");
        // Add error callback code here.
      });
  });

}.call(this));
