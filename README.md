```sh
npm init -y
```

```sh
npm install express dotenv 
```

```sh
npm i --save-dev typescript @types/express @types/node
```

```sh
npx tsc --init
```

# manually transpile the code
```sh
npx tsc
```

# manually run transpiled code
```sh
node ./dist/app.js
```

# add below line in package.json scripts object
```sh
"dev":"npx tsc && node dist/app.js",
```

```sh
npm run dev
```

# install the Dynamoose library and AWS SDK
```sh
npm install dynamoose aws-sdk
```

```sh
npm install --save-dev @types/aws-sdk
```

```sh
npm install @aws-sdk/client-dynamodb @aws-sdk/lib-dynamodb
```

```sh
npm install joi
```