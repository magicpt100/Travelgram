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
    if (id_token == null){
      id_token = "eyJraWQiOiJmelBrQXg3dkpCSlNNRmt5U3VMMkp1V2d2M2VpMkt2MGVBVkhmOVMzZnVFPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiNTZYekdXd1Y3RWxNX0Q0VERfZUMzZyIsInN1YiI6ImNhYjQyNjlkLWFlMGEtNDUyZS1iYWQxLTUwMzg2NjE5NzEzMCIsImF1ZCI6IjQ5czd2amJodWlwODMxcWExMmc4cHZhNnJpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV2ZW50X2lkIjoiNDU3ZTlmNGItNmI4MS0xMWU5LThlODktYjkxODBkNDNjMDBlIiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NTY2NTM4NTcsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX2xMRFl0RGhqSCIsImNvZ25pdG86dXNlcm5hbWUiOiJHaWxiZXJ0IiwiZXhwIjoxNTU2NjU3NDU3LCJpYXQiOjE1NTY2NTM4NTcsImVtYWlsIjoiZHd5YW5lZ2lsYmVydEBnbWFpbC5jb20ifQ.L9UmyI7Sy83a652XJY74Zq78TGCfScYXhSY26sf1XL6mqbXVA66KQSMvDthQWpcSwbIEiTzGgIUlv6cJz8BZFBmgRk1GSu0hJe1gBRaQbcH-Jgz2yrMbHGFi9MgpIrPkrrhCNp5uBtiepvJamvG744B8qqAxv1kwRLAPydoz2pib8_PLJBFwulUfqDJ48Snez5LhCpZ4yM8yyYLMbGfGjh6wJNZOCav21V7WILPMCHmGzpGDqpv1r761efR-HRRpf9g6KhWc3BYckK0GZVWQ9h5ATkdaZqjP6OfHzfEABJmBuY8LztuC9De_4m9usilVgbVlz1dSj3PVzsBW1hk7jQ"
    }

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
    var username = parseJwt(id_token)["cognito:username"];

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
      'StartTime':parseInt(datetime1.getTime())/1000,
      'EndTime':parseInt(datetime2.getTime())/1000,
      'Tags':tags
    };

    var params = {
      'userName':username
    };
    apigClient.userUserNameTripPost(params, body, {headers:{"Authorization": id_token}})
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
