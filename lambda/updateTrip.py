import json
import boto3
import time
import base64
from boto3.dynamodb.conditions import Key
from elasticsearch5 import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
trip_table = dynamodb.Table("Travelgram-Trip")
user_table = dynamodb.Table('Travelgram-User')
error_description = {
    -1: "Trip does not exist.",
    -2: "User does not exist.",
    -3: "User is not authorized to modify the trip.",
    -4: "Trip time is invalid."
}

now = int(time.time())
earliest_time = now - 10 * 365 * 24 * 60 * 60 # earliest time allowed is 10 years ago
########### ES ###############
index = 'trips'
type = 'tripcontent'
host = "search-travelgramsearch-te6bi4dkwyzudmadanw26s4yni.us-east-1.es.amazonaws.com"
region = 'us-east-1'
service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key,region, service,session_token = credentials.token)
es = Elasticsearch(
    hosts = [{'host':host, 'port':443}],
    http_auth = awsauth,
    use_ssl = True,
    verify_certs = True,
    connection_class = RequestsHttpConnection
)
######### S3 ##########
s3 = boto3.resource("s3")
bucket = "travelgramimages"

def check_parameters(tripId, userName, startTime, endTime):
    # check start and end time
    if startTime < earliest_time or endTime < earliest_time or startTime > endTime or startTime > now or endTime > now:
        return -4
    
    # check user name
    user_id = getUserId(userName)
    if user_id < 0:
        return -2
    
    # check trip 
    response = trip_table.scan(
        AttributesToGet = ['UserID'],
        ScanFilter = {
            "TripID":{
                "AttributeValueList":[tripId],
                "ComparisonOperator":"EQ"
            }
        })
        
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    if response["Items"][0]["UserID"] != user_id:
        return -3
    return 1

def getUserId(userName):
    response = user_table.scan(FilterExpression = Key('Username').eq(userName))
    if "Items" not in response or len(response["Items"]) == 0:  # uesr id does not exist
        return -1 
    userid = response['Items'][0]['UserID']
    return userid

def updateES(trip_id, destination, tags, title):
    body = {
        "query":{
            "term": {"TripID": trip_id}
        }
    }
    response = es.search(index=index,body=body)
    hits = response['hits']['hits']
    item = hits[0]['_source']
    id = hits[0]['_id']
    item['Titles']['TripTitle']= title
    item['Tags'] = ",".join(tags)
    item['Dst'] = destination
    update = {
        "doc":item
    }
    
    #print(update)
    es.update(index= index ,doc_type=type,id = id,body = update)
    

def lambda_handler(event, context):
    # update an already existed trip
    body = json.loads(event['body'])
    #body = event["body"]
    tripid = body['TripID']
    title= body['Title']
    destination = body['Dst']
    startTime = int(body['StartTime'])
    endTime = int(body['EndTime'])
    tags = body['Tags']
    userName = event["pathParameters"]["userName"]
    result = check_parameters(tripid, userName, startTime, endTime)
    if result != 1:
        return {
            'statusCode' : 500,
            "headers": {"Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"},
            'body' : json.dumps(error_description[result])
        }
    # update cover photo
    if "CoverPhoto" in body:
        filename = body['CoverPhoto']['FileName']
        img = body['CoverPhoto']['FileContent']
        # get old photo url
        response = trip_table.get_item(Key = {"TripID":tripid}, AttributesToGet = ['CoverPhoto'])
        if 'CoverPhoto' in response['Item']:
            url = response['Item']['CoverPhoto']
            fn = url.split("/")[-1]
            s3.Object(bucket, fn).delete()
        # add new photo
        decoded_img = base64.b64decode(img)
        key_name = "tripCover_" + str(tripid) + "_" + filename
        s3.Bucket(bucket).put_object(Body = decoded_img, Key = key_name)
        url = "https://s3.amazonaws.com/" + bucket + "/" + key_name
        trip_table.update_item(
            Key = {"TripID": int(tripid)},
            AttributeUpdates= {
                "Dst":{"Value":destination,"Action":"PUT"},
                "StartTime":{"Value":startTime, "Action":"PUT"},
                "EndTime":{"Value":endTime,"Action":"PUT"},
                "Title":{"Value":title,"Action":"PUT"},
                "Tags":{"Value":set(tags), "Action":"PUT"},
                "insertedAtTimestamp": {"Value":now, "Action":"PUT"},
                "CoverPhoto":{"Value":url, "Action":"PUT"}
            })
    else:
        trip_table.update_item(
            Key = {"TripID": int(tripid)},
            AttributeUpdates= {
                "Dst":{"Value":destination,"Action":"PUT"},
                "StartTime":{"Value":startTime, "Action":"PUT"},
                "EndTime":{"Value":endTime,"Action":"PUT"},
                "Title":{"Value":title,"Action":"PUT"},
                "Tags":{"Value":set(tags), "Action":"PUT"},
                "insertedAtTimestamp": {"Value":now, "Action":"PUT"}
            })
    updateES(tripid, destination, tags, title)
    
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body' : json.dumps("Successfully updated!")}
