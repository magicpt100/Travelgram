import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from collections import Counter

dynamodb = boto3.resource('dynamodb')
user_table = dynamodb.Table('Travelgram-User')
trip_table = dynamodb.Table('Travelgram-Trip')

def getUserId(user_name):
    response = user_table.scan(FilterExpression = Key('Username').eq(user_name))
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    userid = response['Items'][0]['UserID']
    return userid

def lambda_handler(event, context):
    
    tagnum = int(event['pathParameters']['tagNum'])
    trips = trip_table.scan()["Items"]
    tags = []
    for trip in trips:
        tags.extend(list(map(str.lower, trip["Tags"])))
    tags = Counter(tags)
    top5 = [tag[0] for tag in tags.most_common(tagnum)]
    
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
        'body': json.dumps(top5)
    }
