import json
import boto3
import time
from decimal import Decimal
from elasticsearch5 import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
node_table = dynamodb.Table("Travelgram-TripNode")
image_table = dynamodb.Table("Travelgram-Image")
trip_table = dynamodb.Table('Travelgram-Trip')
user_table = dynamodb.Table("Travelgram-User")
s3 = boto3.resource("s3")
bucket = 'travelgramimages'
error_description = {
    -1: "Trip node does not exist.",
    -2: "Trip and trip node do not match.",
    -3: "User does not exist",
    -4: "This user is not authorized to delete this node."
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

def modifyImage(node_id):
    response = image_table.scan(
        AttributesToGet = ['ImageID',"FileName"],
        ScanFilter = {
            "NodeID":{
                "AttributeValueList":[node_id],
                "ComparisonOperator": "EQ"
            }
        }
        )
    for item in response['Items']:
        image_id = item['ImageID']
        filename = item['FileName']
        s3.Object(bucket, filename ).delete()
        image_table.delete_item(
            Key = {
                "ImageID":image_id
            })

def checkParameters(node_id, trip_id):
    #check userName 
    # response = user_table.scan(FilterExpression = Key('Username').eq(username))
    # if "Items" not in response or len(response["Items"]) == 0:  # uesr id does not exist
    #     return -3
    # userid = response['Items'][0]['UserID']
    # check if node exist
    response = node_table.scan(
        AttributesToGet = ['TripID'],
        ScanFilter = {
            "NodeID":{
                "AttributeValueList":[node_id],
                "ComparisonOperator":"EQ"
            }
        })
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    #check if correct trip node is matched with username
    tid = response['Items'][0]['TripID']
    # id_truth = trip_table.get_item(Key = {"TripID": tid}, AttributesToGet = ['UserID'])
    # id_truth = id_truth['Item']['UserID']
    # if id_truth != userid:
    #     return -4
        
    if tid != trip_id:
        return -2
  
    return 1
            
def deleteES(trip_id, node_id):
    body = {
        "query":{
            "term": {"TripID": trip_id}
        }
    }
    response = es.search(index=index,body=body)
    hits = response['hits']['hits']
    item = hits[0]['_source']
    id = hits[0]['_id']
    item['Titles']['NodeTitle'].pop(str(node_id))
    es.delete(index=index,doc_type=type,id=id)
    es.index(index= index ,doc_type=type,id = id ,body = item)
    

def lambda_handler(event, context):
    node_id = int(event["pathParameters"]['NodeID'])
    trip_id = int(event["pathParameters"]["TripID"])
    result = checkParameters(node_id, trip_id)
    if result != 1:
        return {
            'statusCode' : 500,
            "headers": {"Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"},
            'body' : json.dumps(error_description[result])
        }
    
    #delete all the images related to that node
    modifyImage(node_id)
    node_table.delete_item(Key = {"NodeID":node_id})
    #delete node title in ES
    deleteES(trip_id, node_id)
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': json.dumps("Successfully deleted!")
    }
