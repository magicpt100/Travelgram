import json
import boto3
import base64
import time

s3 = boto3.client('s3')
dynamodb = boto3.client('dynamodb')
bucket = 'travelgramimages'
table = 'Travelgram-Image'
id_table = 'Travelgram-id'
node_table = boto3.resource('dynamodb').Table('Travelgram-TripNode')
error_description = {
    -1: "Trip node does not exist.",
    -2: "Trip and trip node do not match.",
    -3: "File name cannot be empty.",
    -4: "Image file is corrupted."
}

def get_update_image_id():
    image_id = dynamodb.get_item(TableName = id_table, Key = {'idName' : {'S' : 'ImageID'}})['Item']['nextID']['N']
    dynamodb.update_item(TableName=id_table, Key={'idName' : {'S' : "ImageID"}}, AttributeUpdates = {'nextID' : {'Value':  {"N" : str(int(image_id) + 1)}}})
    return image_id

def checkParameters(node_id, trip_id, file_name, image):
    # check node id
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
    if response["Items"][0]["TripID"] != trip_id:
        return -2
    if file_name == "":
        return -3
    
    # check images
    try:
        base64.b64decode(image)
    except:
        return -4
    return 1

def lambda_handler(event, context):
    body = json.loads(event['body'])
    #body = event['body']
    encoded_img = body["FileContent"]
    file_name = body["FileName"]
    node_id = body["NodeID"] # int 
    trip_id = int(event['pathParameters']['TripID'])
    result = checkParameters(node_id, trip_id, file_name, encoded_img)
    if result != 1:
        return {
            'statusCode': 500,
            'body': json.dumps(error_description[result])
        }

    decoded_img = base64.b64decode(encoded_img)
    image_id = get_update_image_id()
    key_name = "trip" + str(trip_id) + "_node" + str(node_id) + "_image" + str(image_id) +  file_name
    s3.put_object(Body=decoded_img, Bucket=bucket, Key=key_name)
    item = {
        "ImageID": {"N" : image_id},
        "FileName": {"S" : key_name},
        "TripID" : {"N" : str(trip_id)},
        "NodeID" : {"N" : str(node_id)}
    }
    
    dynamodb.put_item(TableName = table, Item = item)
    
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        "body": str(image_id)
    }
