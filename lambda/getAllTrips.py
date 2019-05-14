import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
import decimal
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)
    
dynamodb = boto3.resource('dynamodb')
trip_table = dynamodb.Table('Travelgram-Trip')
like_table = dynamodb.Table('Travelgram-Favorite')
user_table = dynamodb.Table('Travelgram-User')

def getUserId(user_name):
    response = user_table.scan(FilterExpression = Key('Username').eq(user_name))
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    userid = response['Items'][0]['UserID']
    return userid

def getUserName(userId):
    response = user_table.get_item(Key = {"UserID": userId}, AttributesToGet = ['Username'])
    return response['Item']['Username']

def checkFavorite(trip_id, user_id):
    results = like_table.get_item(Key = {"UserID": user_id})
    if "Item" not in results:
        return False
    return trip_id in results["Item"]["TripID"]
    
def lambda_handler(event, context):
    is_guest = True
    if "headers" in event and "username" in event["headers"]:
        user_name = event["headers"]["username"]
        user_id = getUserId(user_name)
        is_guest = False
        
    if not is_guest and user_id < 0:
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"},
            "body":  json.dumps("User does not exist.")
        }
        
    trips = trip_table.scan()["Items"]
    
    for trip in trips:
        trip["Tags"] =list(trip["Tags"])   # convert set to list for json serialization
        trip["Username"] = getUserName(int(trip["UserID"]))
        if is_guest:
            continue
        is_like = checkFavorite(trip["TripID"], user_id)
        trip["isLikeByUser"] = is_like
    
    return { 
    "statusCode": 200,
    "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
    "body": json.dumps(trips, cls = DecimalEncoder),
     "isBase64Encoded": False
    }