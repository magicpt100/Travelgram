import json
import boto3
import base64
import io
import datetime
from elasticsearch5 import Elasticsearch, RequestsHttpConnection
from requests_aws4auth import AWS4Auth

def lambda_handler(event, context):
    # elasticsearch
    host = 'vpc-photos-djta6afabridi6a46k6zz6mq44.us-east-1.es.amazonaws.com' # For example, my-test-domain.us-east-1.es.amazonaws.com
    service = 'es'
    credentials = boto3.Session().get_credentials()
    awsauth = AWS4Auth(credentials.access_key, credentials.secret_key, 'us-east-1', service, session_token=credentials.token)
    es = Elasticsearch(
        hosts = [{'host': host, 'port': 443}],
        http_auth = awsauth,
        use_ssl = True,
        verify_certs = True,
        connection_class = RequestsHttpConnection
    )
    res = es.search(index="photos", doc_type="photos", body={"query": {"match_all": {}}})


    print(json.dumps(res["hits"]["hits"], indent=2))

    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
