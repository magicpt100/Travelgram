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


    // var cognitoID;
    // var apigClient;
    //
    // // var id_token=parse_query_string();
    // var id_token = "eyJraWQiOiI5bnd3eXREV2FWeFFcL0JYRDJqZjJFNUplTTlHUU0zZTI5NWJ5enYwZEozTT0iLCJhbGciOiJSUzI1NiJ9.eyJhdF9oYXNoIjoiRnRBNTNCVGtVNVJoRW5vamM0cmZ5USIsInN1YiI6ImYyYjgzMmFkLWZkMDEtNDY4ZC1hMTA2LWQwYTRmZjEyZjk2MCIsImF1ZCI6IjY4Zmc3bWowOGNybjViZmVjcmNqczd2cGh1IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImV2ZW50X2lkIjoiNWY0MDIxNzctNjQ2YS0xMWU5LWFhZDYtNDVhYzU0Nzk3NWM4IiwidG9rZW5fdXNlIjoiaWQiLCJhdXRoX3RpbWUiOjE1NTU4NzQzNjQsImlzcyI6Imh0dHBzOlwvXC9jb2duaXRvLWlkcC51cy1lYXN0LTEuYW1hem9uYXdzLmNvbVwvdXMtZWFzdC0xX0NraGtkdTZ5YiIsImNvZ25pdG86dXNlcm5hbWUiOiJmMmI4MzJhZC1mZDAxLTQ2OGQtYTEwNi1kMGE0ZmYxMmY5NjAiLCJleHAiOjE1NTU4Nzc5NjQsImlhdCI6MTU1NTg3NDM2NCwiZW1haWwiOiJkd3lhbmVnaWxiZXJ0QGdtYWlsLmNvbSJ9.W0XVoOH_9p_5Ar7m1y3GsoMFArb-4TGc_KA6Z5kwqzYKkfWL8nssFXEqU2-MlmdCCjBhkzDT8H5sagX4jigLGU70ywKxzAgnH8htv_doZi3k19RnX7zEj9_WVqpbO3LxcxZfYo9euxW4Z75VarWrSDm0_aIjK52RoiXeYq221yX9d8wN9dvmUtpnkrCMh8xQMiN9pjapOTmfko32bREUfuw9VMTd2aKjsmMncDZGR7HrFhNpnLobKTGH5Mf3uHnsj03-Lz54hApeThY_XKvUu5qDVJbWXO0GndIrC3dlJSjIVvt1R2Mszk77sE1hcvnjfI4szNdrhCbL21SM_VXMIw"
    // AWS.config.region = 'us-east-1';
    // var params = {
    //   IdentityPoolId: 'us-east-1:a8dbc19d-bf82-411d-9d2b-731277e4c6d8', /* required */
    //   // AccountId: 'STRING_VALUE',
    //   Logins: {
    //     'cognito-idp.us-east-1.amazonaws.com/us-east-1_Ckhkdu6yb': id_token,/* '<IdentityProviderName>': ... */
    //   }
    // };
    //
    // var cognitoidentity = new AWS.CognitoIdentity({apiVersion: '2014-06-30'});
    // cognitoidentity.getId(params, function(err, data) {
    //   if (err) console.log(err, err.stack); // an error occurred
    //   else{
    //     cognitoID = data;           // successful response
    //     console.log(cognitoID);
    //     var params = {
    //       IdentityId: cognitoID.IdentityId, /* required */
    //       // CustomRoleArn: 'STRING_VALUE',
    //       Logins: {
    //         'cognito-idp.us-east-1.amazonaws.com/us-east-1_Ckhkdu6yb': id_token
    //         /* '<IdentityProviderName>': ... */
    //       }
    //     };
    //     cognitoidentity.getCredentialsForIdentity(params, function(err, data) {
    //       if (err) console.log(err, err.stack); // an error occurred
    //       else{
    //         // console.log(data.Credentials);           // successful response
    //         apigClient = apigClientFactory.newClient({
    //           accessKey: data.Credentials.AccessKeyId,
    //           secretKey: data.Credentials.SecretKey,
    //           sessionToken: data.Credentials.SessionToken,
    //         });
    //         // apigClient.chatbotPost(null, body)
    //         //   .then(function(result){
    //         //     sendMessage(jQuery.parseJSON(result.data.body).message, "left")
    //         //     // Add success callback code here.
    //         //   }).catch( function(result){
    //         //     console.log("there is something wrong!!!")
    //         //     // Add error callback code here.
    //         //   });
    //       }
    //     });
    //   }
    // });

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
      // 'Time': parseInt(datetime.getTime())/1000,
      'Time':1555117082,
      'Content': text,
      'Price': price,
      'Images':files64
    };

    var params = {
      'TripID':1
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
