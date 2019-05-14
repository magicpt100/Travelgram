import json
import boto3
import time

from boto3.dynamodb.conditions import Key
dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
user_table = dynamodb.Table("Travelgram-User")
favorite_table = dynamodb.Table("Travelgram-Favorite")
trip_table = dynamodb.Table("Travelgram-Trip")
client = boto3.client('dynamodb')
error_description = {
    -1 : "Trip does not exist.",
    -2 : "Trip is already in the favorite list.",
    -3 : "User trip cannot be added into favorite list.",
    -4 : "User invalid."
}

def check_parameters(trip_id, user_id):
    #check if user_id is valid
    if user_id == -1:
        return -4
    # check if trip exist
    response = trip_table.scan(AttributesToGet = ['UserID'], ScanFilter = { "TripID":{ "AttributeValueList":[trip_id], "ComparisonOperator":"EQ" }})
    if "Items" not in response or len(response["Items"]) == 0:
        return -1
    
    # check if trip is created by the same user
    if response["Items"][0]["UserID"] == user_id:
        return -3
    
    # check if trip is already in favorite list
    response = client.get_item(TableName = "Travelgram-Favorite", Key = {"UserID":{"N":str(user_id)}})
    if "Item" in response:
        if "TripID" not in response['Item']:
            return 1
        trip_list = response['Item']['TripID']['NS']
        if str(trip_id) in trip_list:
            return -2
        
    return 1

#get userID from user table according to the username
def getUserId(username):
    response = user_table.scan(FilterExpression = Key('Username').eq(username))
    if "Items" not in response or len(response['Items']) == 0:
        return -1
    userid = response['Items'][0]['UserID']
    return userid

def addFavorite(tripID, userID):
    response = client.get_item(TableName = "Travelgram-Favorite", Key = {"UserID":{"N":str(userID)}})
    if "Item" in response and "TripID" in response["Item"]:
        lists = response['Item']['TripID']['NS']
    else:
        lists = []
    lists.append(str(tripID))
    client.update_item(TableName="Travelgram-Favorite", Key={'UserID' : {'N' : str(userID)}}, 
    AttributeUpdates = {'TripID' : {'Value':  {"NS" : lists}}, 
    "insertedAtTimestamp":{"Value": {"N":str(int(time.time()))}}})

def modifyTrip(tripID):
    client.update_item(TableName = "Travelgram-Trip", Key = {'TripID': {'N': str(tripID)}},
                                                    AttributeUpdates = {'NumLikes': {'Action':"ADD",
                                                                                     'Value':{'N':"1"}},
                                                    })
                                                    
def getEmail(trip_id):
    response = trip_table.get_item(Key = {"TripID":trip_id}, AttributesToGet = ["UserID"])
    userid = response['Item']['UserID']
    email = user_table.get_item(Key = {"UserID":userid}, AttributesToGet = ["Email"])
    email = email['Item']['Email']
    return email
    
def send_message(trip_id, username):
    body = "like,"
    # #1. get trip title
    # response = trip_table.get_item(Key = {"TripID":trip_id}, AttributesToGet = ["Title"])
    # title = response['Item']['Title']
    # body += title + ","
    body += str(trip_id) + ","
    #2. get all emails of the users who like this trip
    email = getEmail(trip_id)
    #3. store all emails to message body and then send it to sqs
    sqs = boto3.resource("sqs")
    queue = sqs.get_queue_by_name(QueueName='travelgramemail')
    body += email
    #print(body)
    response = queue.send_message(MessageBody = body)
    
def lambda_handler(event, context):
    tripID, userName = event['TripID'], event['UserName']
    userID = getUserId(userName)
    
    result = check_parameters(tripID, userID)
    if result != 1:
        return {
            'statusCode' :  500,
            'body': error_description[result]
        }
    
    addFavorite(tripID, userID)
    modifyTrip(tripID)
    send_message(tripID, userName)
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
        'body': "Success"
    }
