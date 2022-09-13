
export let activeEffetc = undefined;
class ReactiveEffect {
    active = true; // 判断当前effect实例是否激活状态，激活状态则进行依赖收集否则不进行依赖收集
    parent = null; // 表示当前effect实例的父effect实例
    deps = []; // 存储当前effect被那些那些属性依赖收集，方便进行依赖删除
    constructor(public fn){}

    run(){
        if(!this.active) return this.fn(); // 不激活直接执行函数不进行依赖搜集；
        // 激活则进行依赖收集
        try{
            // 因为effect函数可以嵌套使用，在生成effect实例并进行依赖收集，需要保留上一级effect实例，以便当前effect实例依赖收集完成后，上一级effect实例可以重新进行依赖收集
            this.parent = activeEffetc; 
            activeEffetc = this;
            return this.fn();
        }finally{
            activeEffetc = this.parent;
            this.parent = null;
        }
    }
}


// effect 副作用函数
// 接收一个回调作为参数
// 当回调函数所依赖的响应式数据发生变化，会重新执行函数
// 首次会执行一次函数，访问响应式数据，进行依赖收集
// 在实际使用中effect是可以嵌套使用的
export function effect(fn){
    const _effect = new ReactiveEffect(fn);

    _effect.run();
}


// 依赖收集函数，表示某个对象上的某个属性被多个effect实例所依赖
/**
 * target 依赖收集的目标对象
 * key 依赖属性
 * type 表示get 或者 set 暂时无用
 */
// 数据结构 weakMap{target: Map{key: Set[]}} 一个对象的一个属性对应多个effetc
const targetMap = new WeakMap();
export function track(target,type,key){
    // 只有在effect回调函数内的响应式数据才会被依赖收集
    if(!activeEffetc) return;
    // 判断是否有目标对象对应的map
    let depsMap = targetMap.get(target);
    if(!depsMap){
        targetMap.set(target,(depsMap = new Map()));
    }
    //判断对应属性是否已经进行了依赖收集，没有则进行初始化 
    let dep = depsMap.get(key);
    if(!dep) {
        depsMap.set(key,(dep = new Set()));
    }
    // 如果set内不存在相应的effect，则添加到set内
    if(!dep.has(activeEffetc)){
        dep.add(activeEffetc)
        activeEffetc.deps.push(dep)
    }
}
// 触发相应属性上的依赖
// 当修改某个响应式对象上的某个属性时，对应的所有effect会被重新执行
/**
 * 
 * @param target 响应式对象
 * @param type 类型 暂时无用
 * @param key 被修改数据的属性
 * @param value 修改值
 * @param oldValue 修改前的旧值 
 */
export function trigger(target,type,key,value,oldValue){
    // 判断当前被修改的属性是否有依赖
    const depsMap = targetMap.get(target);
    if(!depsMap) return;

    const effects = depsMap.get(key);
    // 如果相应属性上存在effect，则重新执行effect
    effects && effects.forEach(effect => {
        // 因为可能在当前effect相关联的回调函数中存在某个响应式数据发生修改，修改的属性与当前的effect相同，则会陷入死循环
        // 加上effect !== activeEffetc 判断条件则相关联的回调只会执行一次
        /**
         * effect(() => {
         *      state.age = Math.random(); 这句会导致死循环
                const app = document.getElementById("app");

                app.innerHTML = `name: ${state.name}; age: ${state.age}`;
            });

            setTimeout(() => {
                state.age = 20;
            }, 1500);
         */
        if(effect !== activeEffetc) effect.run();
    })
}