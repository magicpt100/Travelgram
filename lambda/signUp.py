import json
import boto3
from boto3.dynamodb.conditions import Key, Attr

dynamodb = boto3.resource('dynamodb')
user_table = dynamodb.Table('Travelgram-User')
id_table = dynamodb.Table('Travelgram-id')


def lambda_handler(event, context):
    user_name = event["userName"]
    email = event["request"]["userAttributes"]["email"]
    
    user_id = id_table.get_item(Key = {"idName" : "UserID"})["Item"]["nextID"]
    id_table.update_item(Key = {"idName" : "UserID"}, AttributeUpdates = {"nextID" : {"Value" : (user_id + 1), "Action" : "PUT"}})
    
    item = {
        "UserID" : user_id,
        "Username" : user_name,
        "Email" : email
    }
    
    user_table.put_item(Item = item)
    return event
