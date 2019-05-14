import json
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb',region_name = 'us-east-1')
trip_table = dynamodb.Table("Travelgram-Trip")
sqs = boto3.resource('sqs')
queue = sqs.get_queue_by_name(QueueName='travelgramemail')

def send_email(body):
    body = body.split(",")
    type = body[0]
    tripid = int(body[1])
    emails = body[2:]
    #get trip title, trip user id
    response = trip_table.get_item(Key = {"TripID":tripid})
    item = response['Item']
    title, uid = item['Title'],item['UserID']
    #
    url = "https://s3.amazonaws.com/travelgram-v1/trip_details/index.html?TripID={}&title={}&uid={}".format(tripid,title,uid)
    # Replace sender@example.com with your "From" address.
    # This address must be verified with Amazon SES.
    SENDER = "Travelgram <travelgram.cloud@gmail.com>"
    
    # Replace recipient@example.com with a "To" address. If your account 
    # is still in the sandbox, this address must be verified.
    for email in emails:
        RECIPIENT = email
        
        # Specify a configuration set. If you do not want to use a configuration
        # set, comment the following variable, and the 
        # ConfigurationSetName=CONFIGURATION_SET argument below.
        #CONFIGURATION_SET = "ConfigSet"
        
        # If necessary, replace us-west-2 with the AWS Region you're using for Amazon SES.
        AWS_REGION = "us-east-1"
        
        # The subject line for the email.
        if type == 'update':
            SUBJECT = "Update in your favorite trip"
             # The email body for recipients with non-HTML email clients.
            BODY_TEXT = ("Notification from Travelgram\r\n"
                     "Your favorite trip " + title + " "
                     "has new update! Go check it now!"
                    )
                    
        else:
            SUBJECT = "Someone Liked Your Trip"
             # The email body for recipients with non-HTML email clients.
            BODY_TEXT = ("Notification from Travelgram\r\n"
                     "Your trip " + title + " "
                     "has been liked by someone! Go check it now!"
                    )
                    
       
        # The HTML body of the email.
        if type == 'update':
            BODY_HTML = """<html>
            <head></head>
            <body>
              <h1>Notification from Travelgram</h1>
              <p>Your favorite trip
                <b><a href=\'"""+url+"""\'>""" + title + """</a></b>
               has new update! Go check it now!</p>
            </body>
            </html>
                        """            
        else:
            BODY_HTML = """<html>
            <head></head>
            <body>
              <h1>Notification from Travelgram</h1>
              <p>Your trip
                <b><a href=\'"""+url+"""\'>""" + title + """</a></b>
               has been liked by someone! Go check it now!</p>
            </body>
            </html>
                        """ 
        
        
        # The character encoding for the email.
        CHARSET = "UTF-8"
        
        # Create a new SES resource and specify a region.
        client = boto3.client('ses',region_name=AWS_REGION)
        
        # Try to send the email.
        try:
            #Provide the contents of the email.
            response = client.send_email(
                Destination={
                    'ToAddresses': [
                        RECIPIENT,
                    ],
                },
                Message={
                    'Body': {
                        'Html': {
                            'Charset': CHARSET,
                            'Data': BODY_HTML,
                        },
                        'Text': {
                            'Charset': CHARSET,
                            'Data': BODY_TEXT,
                        },
                    },
                    'Subject': {
                        'Charset': CHARSET,
                        'Data': SUBJECT,
                    },
                },
                Source=SENDER
            )
        # Display an error if something goes wrong.	
        except ClientError as e:
            print(e.response['Error']['Message'])
        else:
            print("Email sent! Message ID:"),
            print(response['MessageId'])
        
def lambda_handler(event, context):
    message = queue.receive_messages(MaxNumberOfMessages = 1)
    if len(message) != 0:
        body = message[0].body
        print(body) 
        #send emails
        send_email(body)
        #delete the message in the queue
        message[0].delete()
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
