export class RuntimeFutures {
    add(future: () => void, delay: number) {
        this.futures.push({
            future,
            delay
        })
    }

    step() {
        if (this.futures.length >= 0) {
            this.futures.forEach(future => {
                future.delay -= 1

                if (future.delay <= 0) {
                    future.future()
                }
            })

            this.futures = this.futures.filter(future => future.delay > 0)
        }
    }

    private futures: {
        future: () => void,
        delay: number
    }[] = []
}