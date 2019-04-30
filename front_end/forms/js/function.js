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

    var id_token = location.hash.substring(1).split("&")[0].split("=")[1];
    apigClient = apigClientFactory.newClient();
  $( "#create-trip-node" ).click(async function() {
    var node_name = $("input[name=node_name]").val();
    var datetime = new Date($("input[name=datetime]").val());
    var address = $("input[name=address]").val();
    var rating = $("#sel1 option:selected").text();
    var price = $("#sel2 option:selected").text();
    var text = $("#nodetext").val();
    console.log(node_name);
    console.log(datetime.getTime());
    console.log(address);
    console.log(text);
    console.log(rating);
    console.log(price);
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
      'Images':files64
    };

    var url = new URL(window.location.href);
    var TripID = parseInt(url.searchParams.get("TripID"));
    var params = {
      'TripID': TripID
    };

    apigClient.tripTripIDNodesPost(params, body, {headers:{"Authorization": id_token}})
    .then(function(result){
      console.log(result);
        // sendMessage(jQuery.parseJSON(result.data.body).message, "left")
        // Add success callback code here.
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


    var body = {
      'Title':trip_name,
      'Dst': destination,
      // 'Time': parseInt(datetime.getTime())/1000,
      'StartTime':parseInt(datetime1.getTime())/1000,
      'EndTime':parseInt(datetime2.getTime())/1000,
      'Tags':tags
    };

    var params = {
      'userName':'aaa'
    };
    apigClient.userUserNameTripPost(params, body)
    .then(function(result){
      console.log(result);
        // sendMessage(jQuery.parseJSON(result.data.body).message, "left")
        // Add success callback code here.
      }).catch( function(result){
        console.log("there is something wrong!!!");
        // Add error callback code here.
      });
  });

}.call(this));