```sh
npm install
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
    "referralId": "01J517K1M9V5R73HAFWD1J7P96",
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
{"action": "sendMessage","messageData":{"text": "on call","referralId": "01J517K1M9V5R73HAFWD1J7P96","senderId": "21138dba-c021-7083-b79a-5e5a0accb07d"}}
```

# getMessages Route Payload Format (default pageSize will be 10)
```json
{"action": "getMessages","referralId": "01J517K1M9V5R73HAFWD1J7P96","senderId": "21138dba-c021-7083-b79a-5e5a0accb07d"}
```

# Test the $default route
# If you don't specify "action" variable name in JSON.stringify payload then it will call $default route, 
```json
{"something": "unknownRoute"}
```

# if you provide "action" variable name in JSON.stringify payload like 
`{"action": "something"}` then it will throw RequestValidation error
