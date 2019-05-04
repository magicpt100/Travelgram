/*
 * Copyright 2010-2016 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * You may not use this file except in compliance with the License.
 * A copy of the License is located at
 *
 *  http://aws.amazon.com/apache2.0
 *
 * or in the "license" file accompanying this file. This file is distributed
 * on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
 * express or implied. See the License for the specific language governing
 * permissions and limitations under the License.
 */

var apigClientFactory = {};
apigClientFactory.newClient = function (config) {
    var apigClient = { };
    if(config === undefined) {
        config = {
            accessKey: '',
            secretKey: '',
            sessionToken: '',
            region: '',
            apiKey: undefined,
            defaultContentType: 'application/json',
            defaultAcceptType: 'application/json'
        };
    }
    if(config.accessKey === undefined) {
        config.accessKey = '';
    }
    if(config.secretKey === undefined) {
        config.secretKey = '';
    }
    if(config.apiKey === undefined) {
        config.apiKey = '';
    }
    if(config.sessionToken === undefined) {
        config.sessionToken = '';
    }
    if(config.region === undefined) {
        config.region = 'us-east-1';
    }
    //If defaultContentType is not defined then default to application/json
    if(config.defaultContentType === undefined) {
        config.defaultContentType = 'application/json';
    }
    //If defaultAcceptType is not defined then default to application/json
    if(config.defaultAcceptType === undefined) {
        config.defaultAcceptType = 'application/json';
    }

    
    // extract endpoint and path from url
    var invokeUrl = 'https://nx3qwxaol6.execute-api.us-east-1.amazonaws.com/prod';
    var endpoint = /(^https?:\/\/[^\/]+)/g.exec(invokeUrl)[1];
    var pathComponent = invokeUrl.substring(endpoint.length);

    var sigV4ClientConfig = {
        accessKey: config.accessKey,
        secretKey: config.secretKey,
        sessionToken: config.sessionToken,
        serviceName: 'execute-api',
        region: config.region,
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var authType = 'NONE';
    if (sigV4ClientConfig.accessKey !== undefined && sigV4ClientConfig.accessKey !== '' && sigV4ClientConfig.secretKey !== undefined && sigV4ClientConfig.secretKey !== '') {
        authType = 'AWS_IAM';
    }

    var simpleHttpClientConfig = {
        endpoint: endpoint,
        defaultContentType: config.defaultContentType,
        defaultAcceptType: config.defaultAcceptType
    };

    var apiGatewayClient = apiGateway.core.apiGatewayClientFactory.newClient(simpleHttpClientConfig, sigV4ClientConfig);
    
    
    
    apigClient.favoriteTripPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['body'], ['body']);
        
        var favoriteTripPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/favoriteTrip').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(favoriteTripPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.favoriteTripOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var favoriteTripOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/favoriteTrip').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(favoriteTripOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.favoriteTripTripIDUserNameDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['UserName', 'TripID'], ['body']);
        
        var favoriteTripTripIDUserNameDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/favoriteTrip/{TripID}/{UserName}').expand(apiGateway.core.utils.parseParametersToObject(params, ['UserName', 'TripID'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(favoriteTripTripIDUserNameDeleteRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.favoriteTripTripIDUserNameOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var favoriteTripTripIDUserNameOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/favoriteTrip/{TripID}/{UserName}').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(favoriteTripTripIDUserNameOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.getnameGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var getnameGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/getname').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(getnameGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.getnameOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var getnameOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/getname').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(getnameOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.searchTripGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['params'], ['body']);
        
        var searchTripGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/searchTrip').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, ['params']),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(searchTripGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.searchTripOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var searchTripOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/searchTrip').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(searchTripOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tagsTagNumGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['tagNum'], ['body']);
        
        var tagsTagNumGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/tags/{tagNum}').expand(apiGateway.core.utils.parseParametersToObject(params, ['tagNum'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tagsTagNumGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tagsTagNumOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var tagsTagNumOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/tags/{tagNum}').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tagsTagNumOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['TripID'], ['body']);
        
        var tripTripIDNodesGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes').expand(apiGateway.core.utils.parseParametersToObject(params, ['TripID'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['TripID', 'body'], ['body']);
        
        var tripTripIDNodesPutRequest = {
            verb: 'put'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes').expand(apiGateway.core.utils.parseParametersToObject(params, ['TripID', ])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesPutRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['TripID', 'body'], ['body']);
        
        var tripTripIDNodesPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes').expand(apiGateway.core.utils.parseParametersToObject(params, ['TripID', ])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var tripTripIDNodesOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesDeleteimageImageIDDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['ImageID', 'TripID'], ['body']);
        
        var tripTripIDNodesDeleteimageImageIDDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes/deleteimage/{ImageID}').expand(apiGateway.core.utils.parseParametersToObject(params, ['ImageID', 'TripID'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesDeleteimageImageIDDeleteRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesDeleteimageImageIDOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var tripTripIDNodesDeleteimageImageIDOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes/deleteimage/{ImageID}').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesDeleteimageImageIDOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesUploadimagePost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['TripID', 'body'], ['body']);
        
        var tripTripIDNodesUploadimagePostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes/uploadimage').expand(apiGateway.core.utils.parseParametersToObject(params, ['TripID', ])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesUploadimagePostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesUploadimageOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var tripTripIDNodesUploadimageOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes/uploadimage').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesUploadimageOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripTripIDNodesNodeIDDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['NodeID', 'TripID'], ['body']);
        
        var tripTripIDNodesNodeIDDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/trip/{TripID}/nodes/{NodeID}').expand(apiGateway.core.utils.parseParametersToObject(params, ['NodeID', 'TripID'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripTripIDNodesNodeIDDeleteRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripsGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var tripsGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/trips').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripsGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.tripsOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var tripsOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/trips').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(tripsOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.userUserNameIdGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['userName'], ['body']);
        
        var userUserNameIdGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/user/{userName}/id').expand(apiGateway.core.utils.parseParametersToObject(params, ['userName'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(userUserNameIdGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.userUserNameIdOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var userUserNameIdOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/user/{userName}/id').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(userUserNameIdOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.userUserNameTripGet = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['userName'], ['body']);
        
        var userUserNameTripGetRequest = {
            verb: 'get'.toUpperCase(),
            path: pathComponent + uritemplate('/user/{userName}/trip').expand(apiGateway.core.utils.parseParametersToObject(params, ['userName'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(userUserNameTripGetRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.userUserNameTripPut = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['userName'], ['body']);
        
        var userUserNameTripPutRequest = {
            verb: 'put'.toUpperCase(),
            path: pathComponent + uritemplate('/user/{userName}/trip').expand(apiGateway.core.utils.parseParametersToObject(params, ['userName'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(userUserNameTripPutRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.userUserNameTripPost = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['userName', 'body'], ['body']);
        
        var userUserNameTripPostRequest = {
            verb: 'post'.toUpperCase(),
            path: pathComponent + uritemplate('/user/{userName}/trip').expand(apiGateway.core.utils.parseParametersToObject(params, ['userName', ])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(userUserNameTripPostRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.userUserNameTripOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var userUserNameTripOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/user/{userName}/trip').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(userUserNameTripOptionsRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.userUserNameTripTripIDDelete = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, ['userName', 'TripID'], ['body']);
        
        var userUserNameTripTripIDDeleteRequest = {
            verb: 'delete'.toUpperCase(),
            path: pathComponent + uritemplate('/user/{userName}/trip/{TripID}').expand(apiGateway.core.utils.parseParametersToObject(params, ['userName', 'TripID'])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(userUserNameTripTripIDDeleteRequest, authType, additionalParams, config.apiKey);
    };
    
    
    apigClient.userUserNameTripTripIDOptions = function (params, body, additionalParams) {
        if(additionalParams === undefined) { additionalParams = {}; }
        
        apiGateway.core.utils.assertParametersDefined(params, [], ['body']);
        
        var userUserNameTripTripIDOptionsRequest = {
            verb: 'options'.toUpperCase(),
            path: pathComponent + uritemplate('/user/{userName}/trip/{TripID}').expand(apiGateway.core.utils.parseParametersToObject(params, [])),
            headers: apiGateway.core.utils.parseParametersToObject(params, []),
            queryParams: apiGateway.core.utils.parseParametersToObject(params, []),
            body: body
        };
        
        
        return apiGatewayClient.makeRequest(userUserNameTripTripIDOptionsRequest, authType, additionalParams, config.apiKey);
    };
    

    return apigClient;
};
