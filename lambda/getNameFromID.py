import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
user_table = dynamodb.Table('Travelgram-User')

def lambda_handler(event, context):
    userId = int(event["pathParameters"]["userId"])
    response = user_table.get_item(Key = {"UserID": userId}, AttributesToGet = ['Username'])
    if "Item" not in response or len(response["Item"]) == 0:  # uesr id does not exist
        return {
        'statusCode': 500,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': "User ID does not exist."
    }

    username = response['Item']['Username']
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': json.dumps({"Username" :  username})
    }
