```sh
npm install
```

## Local Environment Variables
```sh
# Copy the "environments/.env.local" content into ".env" file
$ cp environments/.env.local .env
```

## Dev Environment Variables
```sh
# Copy the "environments/.env.dev" content into ".env" file
$ cp environments/.env.dev .env
```

## Prod Environment Variables
```sh
# Copy the "environments/.env.prod" content into ".env" file
$ cp environments/.env.prod .env
```

# TEST IN LOCAL PC:-

# STEP 1:-
# below command will run both express and websocket server for "local" stage only
```sh
npm run deploy-offline
```

# STEP 2:-
# [POST] First create chat between two users using REST API(after running above express server):-
```sh
http://localhost:3000/local/chat/create
```
```json
{
    "referralId": "01J517K1M9V5R73HAFWD1J7P96", // using "referralId" as chat id in backend 
    "userIdOne": "21138dba-c021-7083-b79a-5e5a0accb07d",
    "userIdTwo": "01332daa-30e1-705d-30fa-24b60011124c"
}
```

# Test on dev [Pass-Authorization-token]
[POST]
```sh
https://chatapi.dev.worko.work/chat/create
```
```json
{
    "referralId": "01J517K1M9V5R73HAFWD1J7P96",
    "userIdOne": "21138dba-c021-7083-b79a-5e5a0accb07d", // emp or cand user id
    "userIdTwo": "01332daa-30e1-705d-30fa-24b60011124c"  // cand or emp user id
}
```

# OPEN ANOTHER WINDOWS TERMINAL AND FOLLOW BELOW STEPS TO TEST WEB SOCKET SERVER FOR ABOVE CREATED CHAT

```sh
wscat --version
```

# if not already installed
```sh
npm install -g wscat
```

# Test on dev, the $connect Route 
```sh
wscat -c 'wss://chatws.dev.worko.work?userId=e1134dca-6071-70ff-2941-54fcce656f38&referralId=01J03QGS9P3V708PXW0ZWJ3Y9S&Authorization=Bearer <Authorization-token>'
```

# Test the $connect Route in local
** [custom WebSocket routes cannot be tested without first establishing a WebSocket connection.]
```sh
wscat -c "ws://localhost:3001?userId=21138dba-c021-7083-b79a-5e5a0accb07d&referralId=01J517K1M9V5R73HAFWD1J7P96"
```

# The $disconnect route is triggered when you disconnect the WebSocket.
```json
CTRL + C
```

# sendMessage Route Payload Format
```json
{"action": "sendMessage","sendMessageData":{"text": "yes serverless.ts","referralId": "01J517K1M9V5R73HAFWD1J7P96","senderId": "01332daa-30e1-705d-30fa-24b60011124c"}}
```

# getMessages Route Payload Format (default pageSize will be 10)
```json
{"action": "getMessages","getMessagesData":{"referralId": "01J517K1M9V5R73HAFWD1J7P96","senderId": "21138dba-c021-7083-b79a-5e5a0accb07d"}}
```

# Test the $default route
# If you don't specify "action" variable name in JSON.stringify payload then it will call $default route, 
```json
{"something": "unknownRoute"}
```

# if you provide "action" variable name in JSON.stringify payload like 
`{"action": "something"}` then it will throw RequestValidation error

# For development:
    CHAT API URL: https://chatapi.dev.worko.work/
    CHAT WebSocket URL: wss://chatws.dev.worko.work
# For production:
    CHAT API URL: https://chatapi.worko.ai/
    CHAT WebSocket URL: wss://chatws.worko.ai

# Chat Application High-level flow:-
## User Connects to the Chat:
WebSocket Connection: A user opens the chat application, and a WebSocket connection is established with API Gateway.
Connect Event: API Gateway triggers a "connect" Lambda function that can log the user connection, maybe store connection information in a database like DynamoDB.

## Sending a Message:
Send Message Event: The user sends a message through the WebSocket connection.
API Gateway Routes the Message: API Gateway receives the message and triggers a "sendMessage" Lambda function.
Process Message: The Lambda function processes the message, such as saving it to DynamoDB and determining which users should receive the message.
Broadcast Message: The Lambda function sends the message back through API Gateway to all connected clients or like private message.

## Receiving a Message:
Client-Side: The chat application receives the message in real-time through the open WebSocket connection and displays it to the user.

## User Disconnects from the Chat:
Disconnect Event: When a user closes the chat application, the WebSocket connection is closed.
API Gateway Triggers Lambda: API Gateway triggers a "disconnect" Lambda function to handle the user's disconnection, possibly updating the user's status in DynamoDB.

Client (WebSocket)  <----->  API Gateway (WebSocket API)  <----->  Lambda Functions  <----->  DynamoDB

## API Gateway WebSocket API:
Create a WebSocket API in the AWS Management Console.
Define the routes: $connect, $disconnect, and a custom route like sendMessage.
For each route, configure an integration with AWS Lambda.
