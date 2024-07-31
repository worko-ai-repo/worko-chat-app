-> logged in to aws console as IAM user [DONE]
-> Install aws cli in your local pc [DONE]
-> Install CLI WS Client(websocat):-It is a Command Line Interface (CLI) to interact with a websocket server.[PENDING]

-> AWS Configure in My local system:-[PENDING]
```sh
aws configure
```

->will globally install the Serverless framework
```sh
npm install -g serverless
```

```sh
serverless --version
```

```sh
npm install --save-dev serverless
```

->TypeScript plugin to work with TypeScript in your Serverless project.
```sh
npm install --save-dev serverless-plugin-typescript --legacy-peer-deps
```

```sh
npm install aws-lambda
```

```sh
npm install @types/aws-lambda
```

```sh
npm install --save-dev serverless-offline --legacy-peer-deps
```

```sh
npm install -g wscat
```

```sh
 npm install ws --legacy-peer-deps
```

```sh
npm install --save-dev @types/ws --legacy-peer-deps
```

```sh
 npm install @aws-sdk/client-apigatewaymanagementapi --legacy-peer-deps
```

# Entry-Level Websocket API Gateway with Serverless Framework
https://www.serverlessguru.com/blog/entry-level-websocket-api-gateway

# serverless chat with typescript backend
https://github.com/ttarnowski/serverless-chat

# Online WebSocket Tester
https://piehost.com/websocket-tester

# API Gateway WebSocket APIs with the Serverless Framework Reference:-
https://blog.neverendingqs.com/2019/07/01/serverless-websocket-example.html

Optional:-
Command to create a new TypeScript serverless project:
```sh
serverless create --template aws-nodejs-typescript --path name-of-your-project
```

->If you want to deploy in to aws
```sh
serverless deploy
```


## Chat Application

# User Connects to the Chat:
WebSocket Connection: A user opens the chat application, and a WebSocket connection is established with API Gateway.
Connect Event: API Gateway triggers a "connect" Lambda function that can log the user connection, maybe store connection information in a database like DynamoDB.

# Sending a Message:
Send Message Event: The user sends a message through the WebSocket connection.
API Gateway Routes the Message: API Gateway receives the message and triggers a "sendMessage" Lambda function.
Process Message: The Lambda function processes the message, such as saving it to DynamoDB and determining which users should receive the message.
Broadcast Message: The Lambda function sends the message back through API Gateway to all connected clients or like private message.

# Receiving a Message:
Client-Side: The chat application receives the message in real-time through the open WebSocket connection and displays it to the user.

# User Disconnects from the Chat:
Disconnect Event: When a user closes the chat application, the WebSocket connection is closed.
API Gateway Triggers Lambda: API Gateway triggers a "disconnect" Lambda function to handle the user's disconnection, possibly updating the user's status in DynamoDB.

Client (WebSocket)  <----->  API Gateway (WebSocket API)  <----->  Lambda Functions  <----->  DynamoDB

# API Gateway WebSocket API:
Create a WebSocket API in the AWS Management Console.
Define the routes: $connect, $disconnect, and a custom route like sendMessage.
For each route, configure an integration with AWS Lambda.

# AWS Lambda Functions:
Create three Lambda functions: connectHandler, disconnectHandler, and sendMessageHandler.
Attach the appropriate IAM roles to allow these functions to read/write to DynamoDB.
DynamoDB Table:

Create a DynamoDB table named worko-chat with a primary key connectionId.

# How to build a chat using Lambda + WebSocket + API Gateway? (nodejs) -->The code will written in aws itself(just a referrence but not our approach)
https://youtu.be/BcWD-M2PJ-8?si=OmxG9bfTXVJ51Zwr

