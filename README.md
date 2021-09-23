# single-access-cache
Cache that ensures single access to the cache. Usefull when dealing with oAuth tokens and similar things.
# API
```js
const SingleAccessCache = require('single-access-cache');


const myCache = new SingleAccessCache({
  acquire:async function(){
     //Get item to cache in some way
     return {
         item:"Cacheworthy",//Anything
         expires:(new Date()).getTime() + 60*60*10000 //Expiry time in ms since epoch
     }
  }
});
let item = await myCache.getItem();
console.log(item);
// prints Cacheworthy
//If the item expires before the expire time, you can clear it using clearItem

await myCache.clearItem()
```
