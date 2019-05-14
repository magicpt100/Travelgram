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

def getUserName(userId):
    response = user_table.get_item(Key = {"UserID": userId}, AttributesToGet = ['Username'])
    return response['Item']['Username']

def getUserId(user_name):
    response = user_table.scan(FilterExpression = Key('Username').eq(user_name))
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    userid = response['Items'][0]['UserID']
    return userid

def getLikedTripsId(user_id):
    results = like_table.get_item(Key = {"UserID": user_id})
    if "Item" not in results:
        return []
        
    return list(results["Item"]["TripID"])

def lambda_handler(event, context):
    user_name = event["pathParameters"]["userName"]
    user_id = getUserId(user_name)
    if user_id == -1:
        return {
            'statusCode': 500,
            'body': json.dumps("User does not exist.")
        }
    
    user_trips = trip_table.scan(FilterExpression = Attr('UserID').eq(user_id))["Items"]
    for trip in user_trips:
        trip["Tags"] = list(trip["Tags"])
        trip["isLikeByUser"] = False
        trip["Username"] = user_name

    liked_trips_id = getLikedTripsId(user_id)
    if len(liked_trips_id) > 0:
        liked_trips = trip_table.scan(ScanFilter = { "TripID":{"AttributeValueList": liked_trips_id, "ComparisonOperator":"IN"}})["Items"]
        for trip in liked_trips:
            trip["Tags"] = list(trip["Tags"])
            trip["Username"] = getUserName(int(trip["UserID"]))
            trip["isLikeByUser"] = True
    else:
        liked_trips = []
             
    trips = {'user_trips': user_trips, 'favoriteTrips': liked_trips}    
    return { 
    "statusCode": 200,
    "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
    "body": json.dumps(trips, cls = DecimalEncoder),
     "isBase64Encoded": False
    }
