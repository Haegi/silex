# silex [![Build Status](https://travis-ci.org/Haegi/silex.svg?branch=master)](https://travis-ci.org/Haegi/silex)
Silex(lat. für Kiesel)

## TO-DO
- finish express server
- change node.js to typescript(✓)
- create unit tests   
- (optional) create code convergence
- drop collections currently only manuell
- create http/2 and https server(✓)
- simple logging(✓)

## Informations
### MessageSchema
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