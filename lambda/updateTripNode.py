import json
import boto3
import time
from decimal import Decimal
from elasticsearch5 import Elasticsearch, RequestsHttpConnection
from boto3.dynamodb.conditions import Key, Attr
from requests_aws4auth import AWS4Auth

dynamodb = boto3.resource('dynamodb')
node_table = dynamodb.Table('Travelgram-TripNode')
user_table = dynamodb.Table("Travelgram-User")
trip_table = dynamodb.Table('Travelgram-Trip')
error_description = {
    -1 : "Trip node does not exist.",
    -2 : "Trip does not match the trip node.",
    -3 : "Rate is invalid.",
    -4 : "Node time is invalid.",
    -5 : "Price is invalid.",
    -7: "User does not exist.",
    -8: "This user has no right to modify this trip."
}
now = int(time.time())
earliest_time = now - 10 * 365 * 24 * 60 * 60 # earliest time allowed is 10 years ago
##### ES #########
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


def check_parameters(username, node_id, trip_id, rate, node_time, price):
    #check userName 
    response = user_table.scan(FilterExpression = Key('Username').eq(username))
    if "Items" not in response or len(response["Items"]) == 0:  # uesr name does not exist
        return -7
    userid = response['Items'][0]['UserID']
    # check price
    if price not in {"", " ","$", "$$", "$$$", "$$$$", "$$$$$"}:
        return -5
    # check node time
    if node_time > now or node_time < earliest_time:
        return -4
    # check node rate
    if rate not in {None, "", " ", 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5}:
        return -3
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
    tid = response['Items'][0]['TripID']
    id_truth = trip_table.get_item(Key = {"TripID": tid}, AttributesToGet = ['UserID'])
    id_truth = id_truth['Item']['UserID']
    if id_truth != userid:
        return -8
    
    if response["Items"][0]["TripID"] != trip_id:
        return -2
        
    return 1

def updateES(trip_id, node_id, title):
    body = {
        "query":{
            "term": {"TripID": trip_id}
        }
    }
    response = es.search(index=index,body=body)
    hits = response['hits']['hits']
    item = hits[0]['_source']
    id = hits[0]['_id']
    item['Titles']['NodeTitle'][str(node_id)] = title
    update = {
        "doc":item
    }
    es.update(index= index ,doc_type=type,id = id,body = update)
    

def lambda_handler(event, context):

    body = json.loads(event['body'])
    #body = event['body']
    username = body['userName']
    node_id = body['NodeID']
    address = body["Address"]
    content = body["Content"]
    rate = body["Rate"]
    node_time = int(body["Time"])
    title = body["Title"]
    price = body["Price"]
    trip_id = int(event["pathParameters"]["TripID"])
    timestamp = now
    
    result = check_parameters(username,node_id, trip_id, rate, node_time, price)
    if result != 1:
        return {
            'statusCode': 500,
            'body': json.dumps(error_description[result]),
            'isBase64Encoded' : False
        }
    # check if title is modified
    response = node_table.get_item(
        Key = {"NodeID": int(node_id)})
    old_title = response['Item']['Title']
    if old_title != title:
        updateES(trip_id, node_id, title)
    
    if not rate or rate == "" or rate == " ":
        rate = "-1"
    item_update = {
            "Address":{"Value":address,"Action":"PUT"},
            "Content":{"Value":content, "Action":"PUT"},
            "Time":{"Value":node_time,"Action":"PUT"},
            "Title":{"Value":title,"Action":"PUT"},
            "Rate":{"Value":Decimal(str(rate)), "Action":"PUT"},
            "Price":{"Value":price,"Action": "PUT"},
            "insertedAtTimestamp": {"Value":timestamp, "Action":"PUT"}
        }
    
    if price == "" or price == " ":
        del item_update["Price"]
    if rate == "-1":
        del item_update["Rate"]
    
    node_table.update_item(
        Key = {"NodeID": int(node_id)},
        AttributeUpdates= item_update)
    
    return {
        'statusCode': 200,
        "isBase64Encoded": False,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': json.dumps("Success!")
    }
    