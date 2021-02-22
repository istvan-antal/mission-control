function assert<T>(condition: T, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
}

export default assert;
