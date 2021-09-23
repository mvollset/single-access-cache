const assert = require('chai').assert;
const SingleAccessCache = require('../module/singleaccesscache');
async function awaitFor(mSecondstowait) {
    let p = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, mSecondstowait);
    });
    return await p;
}

describe('Testing singleton -credentials client', async function () {

    it('Should get a token with value 0', async function () {
        let counter = 0;
        const theCreds = new SingleAccessCache({
            acquire: async function (timeout, delay) {
                if (delay) {

                    await awaitFor(delay);
                }
                return {

                    item: (counter++).toString(),
                    expires: timeout ? timeout : 0
                }
            }
        });
        let p = await theCreds.getItem();
        assert.equal("0", p)
    });
    it('Should get a token with value 1', async function () {
        let counter = 1;
        const theCreds = new SingleAccessCache({
            acquire: async function (timeout, delay) {
                if (delay) {

                    await awaitFor(delay);
                }
                return {

                    item: (counter++).toString(),
                    expires: timeout ? timeout : 0
                }
            }
        });
        let p = await theCreds.getItem();
        assert.equal("1", p)
    });
    it('Should get a which expires in 3 seconds', async function () {
        let counter = 0;
        const theCreds = new SingleAccessCache({
            acquire: async function (timeout, delay) {
                if (delay) {

                    await awaitFor(delay);
                }
                return {

                    item: (counter++).toString(),
                    expires: timeout ? timeout : 0
                }
            }
        });
        this.timeout(5000)
        let now = new Date();
        let p = await theCreds.getItem(now.getTime() + 3000);
        assert.equal("0", p);
        let p2 = await theCreds.getItem();
        //Should be same token
        assert.equal(p, p2);
        //Wait three seconds should get new token;
        await awaitFor(4000);
        p2 = await theCreds.getItem();
        assert.notEqual(p, p2);
    });
    it('Should return in order', async function () {
        this.timeout(5000);
        let counter = 0;
        const theCreds = new SingleAccessCache({
            acquire: async function (timeout, delay) {
                if (delay) {

                    await awaitFor(delay);
                }
                return {

                    item: (counter++).toString(),
                    expires: timeout ? timeout : 0
                }
            }
        });
        let now = new Date();
        let tokens = await Promise.all([
            theCreds.getItem(1, 1000),
            theCreds.getItem(now.getTime() + 3000)
        ]);
        assert.notEqual(tokens[0], tokens[1]);
        assert.isAbove(parseInt(tokens[1]), parseInt(tokens[0]));
    });
    it('Should return in order', async function () {
        this.timeout(5000);
        let counter = 0;
        const theCreds = new SingleAccessCache({
            acquire: async function (timeout, delay) {
                if (delay) {

                    await awaitFor(delay);
                }
                return {

                    item: (counter++).toString(),
                    expires: timeout ? timeout : 0
                }
            }
        });
        let now = new Date();
        let tokens = await Promise.all([
            theCreds.getItem(1, 1000),
            theCreds.getItem(1),
            theCreds.getItem(1, 1000),
            theCreds.getItem(1),
            theCreds.getItem(1, 1000),
            theCreds.getItem(1)

        ]);

        assert.notEqual(tokens[0], tokens[1]);
        assert.isAbove(parseInt(tokens[1]), parseInt(tokens[0]));

    });
    it('Should be possible to clear a token', async function () {
        this.timeout(5000);
        let counter = 0;
        const theCreds = new SingleAccessCache({
            acquire: async function (timeout, delay) {
                if (delay) {

                    await awaitFor(delay);
                }
                return {

                    token: (counter++).toString(),
                    expires: timeout ? timeout : 0
                }
            }
        });
        let now = new Date();
        let token1 = theCreds.getItem(now.getTime() + 3000);
        await theCreds.clearItem();
        let token2 = theCreds.getItem(now.getTime() + 3000);
        assert.notEqual(token1, token2);

    });
    it('Handle empty returns', async function () {
        this.timeout(5000);
        let counter = 0;
        const theCreds = new SingleAccessCache({
            acquire: async function (timeout, delay) {
                if (counter == 0) {
                    counter++;
                    return null;

                }
                return counter;

            }
        });
        let now = new Date();
        let token1 = theCreds.getItem(now.getTime() + 3000);

        let token2 = theCreds.getItem(now.getTime() + 3000);
        assert.isNotNull(token2, "We are able to get a fresh token after an error");

    });
    it('Handle Throws', async function () {
        this.timeout(5000);
        let counter = 0;
        const theCreds = new SingleAccessCache({
            acquire: async function (timeout, delay) {
                if (counter == 0) {
                    counter++;
                    throw new Error("My Mistake");

                }
                return counter;

            }
        });
        let now = new Date();
        try {
            let token1 = theCreds.getItem(now.getTime() + 3000);
            assert.isTrue(false, 'Should never be here')
        }
        catch (err) {
            assert.isTrue(true, 'Should be in catch');
            let token2 = theCreds.getItem(now.getTime() + 3000);
            assert.isNotNull(token2, "We are able to get a fresh token after an error");
        }


    });
});