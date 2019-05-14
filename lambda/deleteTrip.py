import json
import boto3
import time
from boto3.dynamodb.conditions import Key
from elasticsearch5 import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
trip_table = dynamodb.Table("Travelgram-Trip")
node_table = dynamodb.Table("Travelgram-TripNode")
image_table = dynamodb.Table("Travelgram-Image")
favorite_table = dynamodb.Table("Travelgram-Favorite")
user_table = dynamodb.Table('Travelgram-User')
s3 = boto3.resource("s3")
bucket = 'travelgramimages'
error_description = {
    -1 : "Trip does not exist.",
    -2 : "User is not authorized to delete the trip"
}

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

def modifyFavorite(tripid):
    response = favorite_table.scan(
        AttributesToGet = ['UserID'],
        ScanFilter = {
            "TripID":{
                "AttributeValueList":[tripid],
                "ComparisonOperator": "CONTAINS"
            }
        }
        )
    for item in response['Items']:
        user_id = item['UserID']
        favorite_table.update_item(Key = {'UserID': user_id},
                  UpdateExpression = "DELETE TripID :val1 SET insertedAtTimestamp = :val2",
                  ExpressionAttributeValues = {
                      ":val1":{tripid,},
                      ":val2":int(time.time())
                  })
    
    
def deleteNodes(trip_id):
    response = node_table.scan(
        AttributesToGet = ['NodeID'],
        ScanFilter = {
            "TripID":{
                "AttributeValueList":[trip_id],
                "ComparisonOperator":"EQ"
            }
        })
    nodes = response['Items']
    for node in nodes:
        id = node['NodeID']
        node_table.delete_item(Key = {"NodeID": id})
    
def deleteImages(trip_id):
    response = image_table.scan(
        ScanFilter = {
            "TripID":{
                "AttributeValueList":[trip_id],
                "ComparisonOperator":"EQ"
            }
        })
    images = response['Items']
    for image in images:
        id = image['ImageID']
        filename = image['FileName']
        s3.Object(bucket, filename).delete()
        image_table.delete_item(
        Key = {
            "ImageID":id
        })

def getUserId(userName):
    response = user_table.scan(FilterExpression = Key('Username').eq(userName))
    if "Items" not in response or len(response["Items"]) == 0:  # uesr id does not exist
        return -1 
    userid = response['Items'][0]['UserID']
    return userid

def check_parameters(trip_id, user_name):
    # check user name
    user_id = getUserId(user_name)
    if user_id < 0:
        return -2
        
    response = trip_table.scan(
        AttributesToGet = ['UserID'],
        ScanFilter = {
            "TripID":{
                "AttributeValueList":[trip_id],
                "ComparisonOperator":"EQ"
            }
        })
        
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    if response["Items"][0]["UserID"] != user_id:
        return -2
    return 1

def deleteCover(trip_id):
    response = trip_table.get_item(Key = {"TripID": trip_id}, AttributesToGet = ['CoverPhoto'])

    if "CoverPhoto" in response['Item']:
        url = response['Item']['CoverPhoto']
        filename = url.split("/")[-1]
        s3.Object(bucket, filename).delete()
def deleteES(trip_id):
    body = {
        "query":{
            "term": {"TripID": trip_id}
        }
    }
    response = es.search(index=index,body=body)
    hits = response['hits']['hits']
    item = hits[0]['_source']
    id = hits[0]['_id']
    es.delete(index=index,doc_type=type,id=id)
    
def lambda_handler(event, context):

    trip_id = int(event['pathParameters']['TripID'])
    user_name = event['pathParameters']['userName']
    # validate parameters
    result = check_parameters(trip_id, user_name)
    if result != 1:
        return {
            'statusCode': 500,
            "headers": {"Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"},
            'body': json.dumps(error_description[result])
        }
    
    # #find all the user who like this trip and then remove that trip from set
    modifyFavorite(trip_id)
    #delete all nodes of this trip
    deleteNodes(trip_id)
    #delete all images of this trip
    deleteImages(trip_id)
    #delete cover photo
    deleteCover(trip_id)
    # #delete trip from trip table
    trip_table.delete_item(
         Key = {
             "TripID":trip_id
         })
    #delete record in es
    deleteES(trip_id)
    
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': json.dumps("Successfully deleted!")
    }
