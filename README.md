# silex [![Build Status](https://travis-ci.org/Haegi/silex.svg?branch=master)](https://travis-ci.org/Haegi/silex)
#### Silex(lat. für Kiesel)
---
# This is the Express MongoDB Controller Part.   
For fixes and features please check the changelog.
## Structure 
- [Technology](#Technology)
- [TO-DO](#TO-DO)
- [MessageSchema](#MessageSchema)
- [HTTP/2 Rest Endpoint](#HTTP/2-Rest-Endpoint)
- [HTTP/2 Streaming](#HTTP/2-Streaming-TO-UI)
## Technology
- Typescript
- Express
- MongoDB
- HTTP/2

## TO-DO
- finish express server(✓)
- change node.js to typescript(✓)
- create unit tests   
- (optional) create code convergence
- drop collections currently only manuell
- create http/2 and https server(✓)
- simple logging(✓)
- update HTTP/2 Streaming

## MessageSchema
```
{
    topic: string,
    deviceID: string,
    messageType: string,
    timestamp: number,
    content: {
        (default: values,
        ...)
    }
}
```

Sort:   
{ key: 1 } // ascending   
{ key: -1 } // descending

## HTTP/2 Rest Endpoint
https://localhost:8080   
Default collecions is "IoT"
GET   
/messaging/:collection/find

```
{
    (search: {},)
    (sort: {},)
    (limit: number)
}
```

POST   
/messaging/:collection/insert
```
{
"topic": string,
"deviceID": string,
"messageType": string,
"timestamp": number,
"content": {
  ("value": "2")
   } 
}
```

DELETE   
/messaging/:collection/delete
```
{
	"type": "one" or "many",
	"query": {}
}
```
## HTTP/2 Streaming TO UI
This controller streams the insert to https://localhost:999, which is a HTTP/2 connection.