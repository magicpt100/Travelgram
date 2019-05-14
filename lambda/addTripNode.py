import json
import boto3
import time
import base64
from boto3.dynamodb.conditions import Key, Attr
from elasticsearch5 import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
node_table = dynamodb.Table('Travelgram-TripNode')
id_table = dynamodb.Table('Travelgram-id')
trip_table = dynamodb.Table('Travelgram-Trip')
user_table = dynamodb.Table("Travelgram-User")
favorite_table = dynamodb.Table("Travelgram-Favorite")
#######ES##############
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

s3 = boto3.client('s3')
dynamodb_client = boto3.client('dynamodb')
bucket = 'travelgramimages'
image_table_name = 'Travelgram-Image'
id_table_name = 'Travelgram-id'
####################Error##############
error_description = {
    -1: "Trip does not exist.",
    -2: "Rate is invalid.",
    -3: "Node time is invalid.",
    -4: "Price is invalid.",
    -5: "File name is empty.",
    -6: "Image file is corrupted.",
    -7: "User does not exist.",
    -8: "This user has no right to modify this trip"
}
now = int(time.time())
earliest_time = now - 10 * 365 * 24 * 60 * 60 # earliest time allowed is 10 years ago

def check_parameters(userName,trip_id, price, rate, node_time, images):
    #check userName 
    response = user_table.scan(FilterExpression = Key('Username').eq(userName))
    if "Items" not in response or len(response["Items"]) == 0:  # uesr id does not exist
        return -7
    userid = response['Items'][0]['UserID']
    # check price
    if price not in {"", " ", "$", "$$", "$$$", "$$$$", "$$$$$"}:
        return -4
    # check node time
    if node_time > now or node_time < earliest_time:
        return -3
    # check node rate
    if rate not in {None, "", " ", 0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5}:
        return -2
    # check trip id
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
    if response['Items'][0]['UserID'] != userid:
        return -8
    # check images
    for image in images:
        if image['FileName'] == "":
            return -5
        if image['FileContent'] == "":
            return -6
        try:
            base64.b64decode(image['FileContent'])
        except:
            return -6
    return 1

def get_update_nodeId():
    node_id = id_table.get_item(Key = {"idName" : "NodeID"})["Item"]["nextID"]
    id_table.update_item(Key = {"idName" : "NodeID"}, AttributeUpdates = {"nextID" : {"Value" : (node_id + 1), "Action" : "PUT"}})
    return int(node_id)

def get_update_image_id():
    image_id = dynamodb_client.get_item(TableName = id_table_name, Key = {'idName' : {'S' : 'ImageID'}})['Item']['nextID']['N']
    dynamodb_client.update_item(TableName=id_table_name, Key={'idName' : {'S' : "ImageID"}}, AttributeUpdates = {'nextID' : {'Value':  {"N" : str(int(image_id) + 1)}}})
    return image_id
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
    item['Titles']['NodeTitle'][node_id] = title
    update = {
        "doc":item
    }
    es.update(index= index ,doc_type=type,id = id,body = update)
def getEmail(trip_id):
    emails = []
    response = favorite_table.scan(
        AttributesToGet = ['UserID'],
        ScanFilter = {
            "TripID":{
                "AttributeValueList":[trip_id],
                "ComparisonOperator": "CONTAINS"
            }
        }
        )
    for item in response['Items']:
        user_id = item['UserID']
        email = user_table.get_item(Key = {"UserID":user_id}, AttributesToGet = ["Email"])
        email = email['Item']['Email']
        emails.append(email)
    return emails
    
def send_message(trip_id, username):
    body= "update,"
    # #1. get trip title
    # response = trip_table.get_item(Key = {"TripID":trip_id}, AttributesToGet = ["Title"])
    # title = response['Item']['Title']
    # body += title + ","
    body+=str(trip_id)+","
    #2. get all emails of the users who like this trip
    emails = getEmail(trip_id)
    if len(emails) == 0:
        return 
    #3. store all emails to message body and then send it to sqs
    sqs = boto3.resource("sqs")
    queue = sqs.get_queue_by_name(QueueName='travelgramemail')
    body += ",".join(emails)
    response = queue.send_message(MessageBody = body)
    #print("send the info to the queue!")

def lambda_handler(event, context):
    body = json.loads(event['body'])
    #body = event['body']
    username = body["userName"]# for varification
    address = body["Address"]
    content = body["Content"]
    rate = body["Rate"]
    images = body['Images']
    node_time = int(body["Time"])
    title = body["Title"]
    price = body["Price"]
    trip_id = int(event["pathParameters"]["TripID"])
    timestamp = now
    result = check_parameters(username,trip_id, price, rate, node_time, images)
    if result != 1:
        return {
            'statusCode' : 500,
            "headers": {"Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"},
            'body' : json.dumps(event)
        }
    
    if not rate or rate == "" or rate == " ":
        rate = "-1"
    node_id = get_update_nodeId()
    item = {"NodeID" : node_id, "Address" : address, "Content" : content, "TripID" : trip_id,
            "Price" :  price, "Title" : title, "Rate" : Decimal(str(rate)), "Time": node_time, "insertedAtTimestamp" : timestamp}
    
    if price == "" or price == " ":
        del item["Price"]
    
    if rate == "-1":
        del item["Rate"]
    
    node_table.put_item(Item = item)
    
    #upload images
    for image in images:
        encoded_img = image['FileContent']
        file_name = image['FileName']
        decoded_img = base64.b64decode(encoded_img)
        image_id = get_update_image_id()
        key_name = "trip" + str(trip_id) + "_node" + str(node_id) + "_image" + str(image_id) + file_name
       
        item = {
            "ImageID": {"N" : image_id},
            "FileName": {"S" : key_name},
            "TripID" : {"N" : str(trip_id)},
            "NodeID" : {"N" : str(node_id)}
        }
        s3.put_object(Body=decoded_img, Bucket=bucket, Key=key_name)
        dynamodb_client.put_item(TableName = image_table_name, Item = item)
    #### update ES
    updateES(trip_id, node_id,title)
    ##send message to queue
    send_message(trip_id, username)
    return {
        "statusCode": 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        "body": json.dumps({"NodeID":node_id}),
        "isBase64Encoded": False
    }
