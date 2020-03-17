class Watcher {
    constructor(vm,expr,cb) {
        this.vm = vm
        this.expr = expr
        this.cb = cb
        this.oldVal = this.getOldVal()
    }
    getOldVal() {
        Dep.target = this
        const oldVal = compileUtil.getVal(this.expr,this.vm)
        Dep.target = null
        return oldVal
    }
    update() {
        const newVal = compileUtil.getVal(this.expr,this.vm)
        if(newVal !== this.oldVal) {
            this.cb(newVal)
        }
    }
}
class Dep {
    constructor() {
        this.subs = []
    }
    addSub(watcher) {
        this.subs.push(watcher)
    }
    notify() {
        this.subs.forEach(v => {
            v.update()
        })
    }
}
class Observer {
    constructor(data) {
        this.observe(data)
    }
    observe(data) {
        if(data && typeof(data) === 'object') {
            Object.keys(data).forEach(key => {
                this.defineReactive(data,key,data[key])
            })
        }
    }
    defineReactive(obj,key,value) {
        this.observe(value)
        const dep = new Dep()
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:false,
            get:() =>{
                Dep.target && dep.addSub(Dep.target)
                //订阅数据变化时，往Dep中添加观察者
                return value
            },
            set:(newVal)=>{
                this.observe(newVal)
                if(newVal !== value) {
                    value = newVal
                }
                dep.notify()
            }
        })
    }

}