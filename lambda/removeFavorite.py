import json
import boto3
import time
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
user_table = dynamodb.Table("Travelgram-User")
favorite_table = dynamodb.Table("Travelgram-Favorite")
client = boto3.client('dynamodb')
error_description = {
    -1: "User does not exist.",
    -2: "Favorite list is empty.",
    -3: "Trip is not in the favorite list."
}

#get userID from user table according to the username
def getUserId(username):
    response = user_table.scan(FilterExpression = Key('Username').eq(username))
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    userid = response['Items'][0]['UserID']
    return userid

def removeFavorite(tripID, userID):
    client.update_item(TableName = "Travelgram-Favorite",
                        Key = {'UserID': {'N': str(userID)}},
                   UpdateExpression = "DELETE TripID :val1 SET insertedAtTimestamp = :val2",
                   ExpressionAttributeValues = {
                       ":val1":{"NS":[str(tripID)]},
                       ":val2":{"N":str(int(time.time()))}
                   })

def modifyTrip(tripID):
    client.update_item(TableName = "Travelgram-Trip", Key = {'TripID': {'N': str(tripID)}},
                                                    AttributeUpdates = {'NumLikes': {'Action':"ADD",
                                                                                     'Value':{'N':"-1"}},
                                                    })

def checkParameters(tripID, userID):
    if userID < 0:
        return -1
    response = favorite_table.get_item(Key = {"UserID": userID})
    if 'Item' not in response or len(response['Item']['TripID']) == 0:
        return -2
    if tripID not in response['Item']['TripID']:
        return -3
    return 1
    
def lambda_handler(event, context):
    tripID, userName = int(event['pathParameters']['TripID']), event['pathParameters']['UserName']
    userID = getUserId(userName)
    result = checkParameters(tripID, userID)
    if result != 1:
        return {
            'statusCode': 500,
            "headers": {"Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"},
            'body':  json.dumps(error_description[result])
        }
    
    removeFavorite(tripID, userID)
    modifyTrip(tripID)

    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': json.dumps("Success!")
    }
