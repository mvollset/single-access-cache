const assert = require('chai').assert;
const {Semaphore} = require('../module/semaphore');
const {Mutex} = require('../module/semaphore');
async function awaitFor(mSecondstowait) {
    let p = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(true)
        }, mSecondstowait);
    });
    return await p;
}
describe('util', async function() {
    describe('semaphore', async function() {
        it('limits concurrency', async function() {
            var s = new Semaphore(2);
            var running = 0;
            var ran = 0;
            var task = async () => {
                var release = await s.acquire();
                assert(running <= 1);
                running++;
                await awaitFor(10);
                assert(running <= 2);
                running--;
                ran++;
                release();
            };
            await Promise.all([1,2,3,4,5].map(i => task()));
            assert.equal(ran, 5);
        });
    });
    describe('mutex', function() {
        it('tasks do not overlap', function(done) {
            var m = new Mutex();
            var task1running = false;
            var task2running = false;
            var task1ran = false;
            var task2ran = false;
            Promise.all([
                m.acquire()
                .then(release => {
                    task1running = true;
                    task1ran = true;
                    return awaitFor(10)
                    .then(() => {
                        assert(!task2running);
                        task1running = false;
                        release();
                    });
                }),
                m.acquire().
                then(release => {
                    assert(!task1running);
                    task2running = true;
                    task2ran = true;
                    return awaitFor(10)
                    .then(() => {
                        task2running = false;
                        release();
                    });
                })
            ])
            .then(() => {
                assert(!task1running);
                assert(!task2running);
                assert(task1ran);
                assert(task2ran);
                done();
            })
            .catch(done);
        });
        it('double lock deadlocks', function(done) {
            var m = new Mutex();
            m.acquire()
            .then(r => m.acquire())
            .then(r => assert(false))
            .catch(()=>{
                done()
            });
            awaitFor(10)
            .then(r=>done());
        });
        it('double release ok', function(done) {
            var release;
            var m = new Mutex();
            m.acquire().
                then(r => release = r).
                then(() => release()).
                then(() => release());
            m.acquire().
                then(r => done());
        });
    });
});