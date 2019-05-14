import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from elasticsearch5 import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth
import decimal
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
trip_table = dynamodb.Table('Travelgram-Trip')
class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)
    
index = 'trips'
type = 'tripcontent'
host = "search-travelgramsearch-te6bi4dkwyzudmadanw26s4yni.us-east-1.es.amazonaws.com"
region = 'us-east-1'
service = 'es'
credentials = boto3.Session().get_credentials()
awsauth = AWS4Auth(credentials.access_key, credentials.secret_key,region, service,session_token = credentials.token)
es = Elasticsearch(
    hosts = [{'host':host, 'port':443}],
    http_auth = awsauth,
    use_ssl = True,
    verify_certs = True,
    connection_class = RequestsHttpConnection
)

def search(q):
    payload1 = {
        "query":{
            "multi_match":{
                "query":q,
                "type": "best_fields",
                "fields":['Tags^2','Titles.TripTitle',"Titles.NodeTitle.*",'Dst^4'],
                "fuzziness": "AUTO"
            }
        },
    }
    res1 = es.search(index="trips",body=payload1)
    res1 = res1['hits']['hits']
    ids = [item["_source"]['TripID'] for item in res1]
    if len(q.split(' ')) > 1:
        payload2 = {
        "query":{
                "multi_match":
                {
                    "query":q,
                    "type": "cross_fields",
                    "fields":['Tags','Titles.TripTitle',"Titles.NodeTitle.*",'Dst'],
                    "operator": "and"
                }
            },
                }
        
        res2 = es.search(index="trips",body=payload2)
        res2 = res2['hits']['hits']
        ids2 = [item["_source"]['TripID'] for item in res2]
        result = ids2.copy()
        ids2 = set(ids2)
        for id in ids:
            if id not in ids2:
                result.append(id)
        ids = result
    return ids
        
def getAllTrip(ids):
    trips = []
    for id in ids:
        id = int(id)
        response = trip_table.get_item(Key = {"TripID":id})
        response['Item']['Tags'] = list(response['Item']['Tags'])
        trips.append(response['Item'])
    return trips
def lambda_handler(event, context):
    q = event["queryStringParameters"]["params"]
    q = q.lower()
    trip_ids = search(q)
    trips = getAllTrip(trip_ids)
    return {
        'statusCode': 200,
        "headers": {"Access-Control-Allow-Origin": "*",
                    "Content-Type": "application/json"},
        "body": json.dumps(trips, cls = DecimalEncoder)
    }
