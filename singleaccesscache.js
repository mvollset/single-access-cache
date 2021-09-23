const { Mutex } = require('await-semaphore');
/**
 * Single access cache
 * Takes an object with an async aquire function. The acquire is used to acquire the token. 
 * @param {*}
 * @param {*.acquire} async function
 * 
 */
class SingleAccessCache {
    constructor(config) {
        this.Mutex = new Mutex();
        this.expires = -1;
        this.token = false;
        this.acquire = config.acquire;
    }
    /**
     * Async function that returns the token.
     * @param  {...any} theArgs 
     * @returns A token
     */
    async getToken(...theArgs) {
        return await this.Mutex.acquire().then(async(release) => {
            if (this.token&&!this.isExpired()) {
                release();
                return this.token;
            }
            try{
                const tokenResult = await this.acquire(...theArgs);
                if(tokenResult){
                    this.token = tokenResult.token;
                    this.expires = new Date(tokenResult.expires);
                }
                else
                    this.token=false;

                release();
                return this.token;
               
            }
            catch(err){
                release();
                throw new Error(err);
            }
        })


    }
    /**
     * Checks if token is expired
     * @returns false if not 
     */
    isExpired() {
        if(!this.expires||this.expires.getTime()<=(new Date()).getTime())
            return true;
        return false;
    }
    /**
     * Clears any token set. 
     * @returns 
     */
    async clearToken(){
        return await this.Mutex.acquire().then(async(release) => {
           this.token=false;
           this.expires =0;
           release();
           return true;
        });
    }
}
module.exports=SingleAccessCache;
