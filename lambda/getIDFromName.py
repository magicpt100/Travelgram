import json
import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
user_table = dynamodb.Table('Travelgram-User')

def lambda_handler(event, context):
    userName = event["pathParameters"]["userName"]
    response = user_table.scan(FilterExpression = Key('Username').eq(userName))
    if "Items" not in response or len(response["Items"]) == 0:  # uesr id does not exist
        return {
        'statusCode': 500,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': json.dumps({"UserID" :  -1})
    }

    userid = response['Items'][0]['UserID']
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': json.dumps({"UserID" :  int(userid)})
    }
