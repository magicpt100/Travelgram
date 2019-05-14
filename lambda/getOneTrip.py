import json
import boto3
import time
import base64
from boto3.dynamodb.conditions import Key
import decimal
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)
    
dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
trip_table = dynamodb.Table("Travelgram-Trip")

def lambda_handler(event, context):
    tripid = event['pathParameters']['TripID']
    tripid = int(tripid)
    #check if tripid is exist
    response = trip_table.get_item(Key = {"TripID": tripid})
    if 'Item' not in response:
        return {
            'statusCode' : 500,
            'body' : json.dumps("trip does not exist.")
        }
    else:
        trip = response['Item']
        trip['Tags'] = list(trip['Tags'])
        return {
            'statusCode': 200,
            "headers": {"Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"},
            'body': json.dumps(trip,cls = DecimalEncoder),
            "isBase64Encoded": False
        }
