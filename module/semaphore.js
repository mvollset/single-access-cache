class Semaphore {
    free = 0;
    tasks = [];
    constructor(count) {
        this.free = count;
    }
    _sched() {
        if (this.free > 0 && this.tasks.length > 0) {
            this.free--;
            let next = this.tasks.shift();
            if (next === undefined) {
                throw "Unexpected undefined value in tasks list";
            }

            next();
        }
    }
    async acquire() {
        return new Promise((resolve, reject) => {
            let task = () => {
                let released = false;
                resolve(() => {
                    if (!released) {
                        released = true;
                        this.free++;
                        this._sched();
                    }
                });
            }
            this.tasks.push(task);
            if (process && process.nextTick) {
                process.nextTick(this._sched.bind(this));
            } else {
                setImmediate(this._sched.bind(this));
            }

        })
    }
}
class Mutex extends Semaphore {
    constructor() {
        super(1);
    }
}
module.exports = {
    Semaphore: Semaphore,
    Mutex: Mutex
}
