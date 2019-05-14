import json
import boto3
import time
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
image_table = dynamodb.Table("Travelgram-Image")
user_table = dynamodb.Table("Travelgram-User")
trip_table = dynamodb.Table('Travelgram-Trip')
s3 = boto3.resource("s3")
bucket = 'travelgramimages'
error_description = {
    -1 : "Image does not exist.",
    -2 : "Trip and image does not match.",
    -7 : "User does not exist.",
    -3 : "This user is not authorized to delete this image.",
    -4 : "This trip does not exist."
}

def check_parameters(username,image_id, trip_id):
    #check userName 
    response = user_table.scan(FilterExpression = Key('Username').eq(username))
    if "Items" not in response or len(response["Items"]) == 0:  # uesr name does not exist
        return -7
    userid = response['Items'][0]['UserID']
    #check if trip exist
    response = trip_table.get_item(Key = {"TripID": trip_id}, AttributesToGet = ['UserID'])
    if 'Item' not in response:
        return -4
    elif response['Item']['UserID'] != userid:
        return -3
    response = image_table.get_item(Key = {"ImageID": image_id})
    # check if image exist
    if "Item" not in response or len(response['Item']) == 0:
        return -1
    if response['Item']['TripID'] != trip_id:
        return -2
        
    return 1

def modifyImage(image_id):
    response = image_table.get_item(Key = {"ImageID": image_id})
    
    filename = response['Item']['FileName']
    s3.Object(bucket, filename ).delete()
    image_table.delete_item(
        Key = {
            "ImageID":image_id
        })
        
            
def lambda_handler(event, context):
    body = json.loads(event['body'])
    #body = event['body']
    username = body['userName']
    image_id = int(event['pathParameters']['ImageID']) # int
    trip_id = int(event['pathParameters']['TripID'])
    result = check_parameters(username,image_id, trip_id)
    if result != 1:
        return {
            'statusCode': 500,
            'body': json.dumps(error_description[result])
        }
    
    modifyImage(image_id)
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        "body":json.dumps("Success!")
    }
