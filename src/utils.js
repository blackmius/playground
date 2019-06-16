export function throttled(delay, fn) {
    let handle;
    function perform() {
        if (handle !== undefined) clearTimeout(handle);
        handle = undefined;
        return fn();
    }
    return function(force) {
        if (force) return perform();
        clearTimeout(handle);
        handle = setTimeout(perform, delay);
    }
}
