

procuder is an application that send events/messafes kafka 

order-service = procuder

order-service -> order.placed topic

topic - order.placed
event data - order details
message key - userId

```ts
await procuder.send({
    topic `topic`,
    message: [
        {
            "key" : "user_42",
            value : JSON.strinfy({})
        }
    ]
})
```

same key -> same partition

order_placed for user 42 - partition 1
order_updated for user 42 - partition 1
order_cancelled for user 42 - partition 1

order service - topic oder.placed, key, value: actualy event data

user_42 - to a certaion partition 1

places another order - sends to same partition 1


