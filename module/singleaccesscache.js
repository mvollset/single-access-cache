const { Mutex } = require('./semaphore');
/**
 * Single access cache
 * Takes an object with an async aquire function. The acquire is a function to get the cache item. The acquire
 * function must return an object with a item and an expires integer in ms since epoch
 * @param {*}
 * @param {*.acquire} async function
 * 
 */
class SingleAccessCache {
    constructor(config) {
        this.Mutex = new Mutex();
        this.expires = -1;
        this.item = false;
        this.acquire = config.acquire;
    }
    /**
     * Async function that returns the item.
     * @param  {...any} theArgs 
     * @returns A item
     */
    async getItem(...theArgs) {
        return await this.Mutex.acquire().then(async (release) => {
            if (this.item && !this.isExpired()) {
                release();
                return this.item;
            }
            try {
                const itemResult = await this.acquire(...theArgs);
                if (itemResult) {
                    this.item = itemResult.item;
                    this.expires = new Date(itemResult.expires ? itemResult.expires : 0);
                }
                else
                    this.item = false;

                release();
                return this.item;

            }
            catch (err) {
                release();
                throw new Error(err);
            }
        })
    }
    /**
     * Checks if item is expired
     * @returns false if not 
     */
    isExpired() {
        if (!this.expires || this.expires.getTime() <= (new Date()).getTime())
            return true;
        return false;
    }
    /**
     * Clears any item set. 
     * @returns 
     */
    async clearItem() {
        return await this.Mutex.acquire().then(async (release) => {
            this.item = false;
            this.expires = 0;
            release();
            return true;
        });
    }
}
module.exports = SingleAccessCache;
