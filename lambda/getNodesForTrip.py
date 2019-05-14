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
bucket = 'travelgramimages'
url_prefix = "https://s3.amazonaws.com/travelgramimages/"
node_table = dynamodb.Table('Travelgram-TripNode')
image_table = dynamodb.Table('Travelgram-Image')
trip_table = dynamodb.Table('Travelgram-Trip')
error_description = {
    -1:  "Trip does not exist"
}

def checkParameters(trip_id):
    response = trip_table.get_item(Key = {"TripID": trip_id})
    # check if image exist
    if "Item" not in response or len(response['Item']) == 0:
        return -1
        
    return 1

def lambda_handler(event, context):
    trip_id = int(event["pathParameters"]["TripID"])
    result = checkParameters(trip_id)
    if result != 1:
        return {
            'statusCode': 500,
            'body': json.dumps(error_description[result]),
        }
    
    trip_nodes = node_table.scan(FilterExpression = Attr('TripID').eq(trip_id))["Items"]
    images = image_table.scan(FilterExpression = Attr('TripID').eq(trip_id))["Items"]
    
    for image in images:
        for node in trip_nodes:
            if node["NodeID"] == image["NodeID"]:
                file_name = image["FileName"]
                image_dict = {"ImageID": image["ImageID"], "FileName": file_name, "Url": url_prefix + file_name}
                if "Images" in node:
                    node["Images"].append(image_dict)
                else:
                    node["Images"] = [image_dict]
                break
        
    return { 
    "statusCode": 200,
    "headers": {"Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json"},
    "body": json.dumps(trip_nodes, cls = DecimalEncoder),
     "isBase64Encoded": False
    }
