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

    apigClient.tripTripIDNodesPost(params, body, {headers:{"Authorization": "eyJraWQiOiJmelBrQXg3dkpCSlNNRmt5U3VMMkp1V2d2M2VpMkt2MGVBVkhmOVMzZnVFPSIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiT09EVlBZcThMUnRtY1l2Zk1TM3N3QSIsInN1YiI6ImNhYjQyNjlkLWFlMGEtNDUyZS1iYWQxLTUwMzg2NjE5NzEzMCIsImF1ZCI6IjQ5czd2amJodWlwODMxcWExMmc4cHZhNnJpIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV2ZW50X2lkIjoiNjI3NTA3NGEtNmI2Yi0xMWU5LThhYjYtYzM1NjJiMjliYTA4IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NTY2NDQ0NTcsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX2xMRFl0RGhqSCIsImNvZ25pdG86dXNlcm5hbWUiOiJHaWxiZXJ0IiwiZXhwIjoxNTU2NjQ4MDU3LCJpYXQiOjE1NTY2NDQ0NTcsImVtYWlsIjoiZHd5YW5lZ2lsYmVydEBnbWFpbC5jb20ifQ.ImuCFGOln3pPtBKSC4v3mqAi75Sl-d6UBVX3z4RVx6CYsTQy0BdG0aZdW1Dv_q9tvLWcgyRWcu2HGj5AaPCyVNW_ZuXlvfV8x4MehE64tUDY1CD2viGISsxlVoIvskpjPjKQYYxTsESS01VE5G3QVR3_wsEtsp5dECJt5KRFf-3dsPYafSqI3_nlzyMaWZ93cBG6gnTGwQW-JcGaujg-QFnwjLDc-Pb4e8gsT0fSfZptLjYxYTnsvUZRlR4TVpCw-gyM28ZS2ug2pjIx0TslBXkT-Mkc0Ckr2EWR5QAHzMqhlHBl17vjf-N_BUqKA_m-3g0EPCttCmXgiy68aH_dwA"}})
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
