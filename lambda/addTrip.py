import json
import boto3
import time
import base64
from boto3.dynamodb.conditions import Key
from elasticsearch5 import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

client = boto3.client('dynamodb')
id_table = "Travelgram-id"
trip_table = "Travelgram-Trip"
dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
user_table = dynamodb.Table("Travelgram-User")
error_description = {
    -1: "User does not exist.",
    -2: "Trip time is invalid."
}
now = int(time.time())
earliest_time = now - 10 * 365 * 24 * 60 * 60 # earliest time allowed is 10 years ago
#ES
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
########## S3 ##############
s3 = boto3.client("s3")
bucket = "travelgramimages"
################################################
def modifyID():
    trip_id = client.get_item(TableName = id_table, Key = {'idName' : {'S' : 'TripID'}})['Item']['nextID']['N']
    client.update_item(TableName=id_table, Key={'idName' : {'S' : "TripID"}}, AttributeUpdates = {'nextID' : {'Value':  {"N" : str(int(trip_id) + 1)}}})
    return trip_id
    
def getID(username):
    response = user_table.scan(FilterExpression = Key('Username').eq(username))
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    userid = response['Items'][0]['UserID']
    return userid

def addTrip(trip_id,title,destination, user_id, startTime, endTime,tags,url):
    item = {
        'TripID':{"N": str(trip_id)},
        "Dst":{"S":destination},
        "Title":{"S":title},
        "StartTime":{"N":str(startTime)},
        "EndTime":{"N":str(endTime)},
        "UserID":{"N":str(user_id)},
        "Tags":{"SS":tags},
        "NumLikes":{"N":"0"},
        "insertedAtTimestamp":{"N":str(int(time.time()))},
        "CoverPhoto": {"S": url}
    }
    
    client.put_item(TableName = trip_table, Item = item )
    
def modifyES(trip_id,title, destination,tags):
    #insert an index into es
    body = {
        "TripID":trip_id,
        "Titles":{"TripTitle":title,"NodeTitle":{}},
        "Dst":destination,
        "Tags":",".join(tags)
    }
    res=es.index(index='trips',doc_type='tripcontent',body=body)
    
def checkParameters(user_id, startTime, endTime):
    if user_id < 0:
        return - 1
    if startTime < earliest_time or endTime < earliest_time or startTime > endTime or startTime > now or endTime > now:
        return -2
    return 1

def lambda_handler(event, context):
    body = json.loads(event['body'])
    #body = event['body']
    title= body['Title']
    destination = body['Dst']
    userName = event['pathParameters']['userName']
    startTime = int(body['StartTime'])
    endTime = int(body['EndTime'])
    tags = body['Tags']
    coverimg = body['CoverPhoto']
    img_filename = coverimg['FileName']
    img_content = coverimg['FileContent']
   
    user_id = getID(userName)
    result = checkParameters(user_id, startTime, endTime)
    if result != 1:
        return {
            'statusCode': 500,
            "headers": {"Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"},
            'body': json.dumps(error_description[result])
        }
    
    trip_id = modifyID()  
    #send image
    decode_img = base64.b64decode(img_content)
    key_name = "tripCover_" + str(trip_id) + "_" + img_filename
    s3.put_object(Body = decode_img, Bucket = bucket, Key = key_name)
    url = "https://s3.amazonaws.com/" + bucket + "/" + key_name
    addTrip(trip_id,title,destination, user_id, startTime, endTime, tags, url)
    #add an index into ElasticSearch
    modifyES(trip_id, title, destination,tags)
    
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': json.dumps({"TripID" :  trip_id})
    }
