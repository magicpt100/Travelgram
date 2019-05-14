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
node_table = dynamodb.Table('Travelgram-TripNode')

def lambda_handler(event, context):
    node_id = int(event["pathParameters"]["NodeID"])
    response = node_table.get_item(Key = {"NodeID" : node_id})
    if "Item" not in response or len(response["Item"]) == 0:
        return {
        'statusCode': 500,
        "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
        "body" : "Node does not exist."
        }
        
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*", "Content-Type": "application/json"},
        "body" : json.dumps(response["Item"], cls = DecimalEncoder)
    }
    
    
    
