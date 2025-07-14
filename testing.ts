function get_var(name:string) {
    return globalThis[name as keyof typeof globalThis];
}
const age = 22;
const name = 'age';
console.log(get_var(name));