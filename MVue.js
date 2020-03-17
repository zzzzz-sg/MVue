const compileUtil = {
    getVal(expr,vm) {
        return expr.split('.').reduce((data,currentVal) =>{
            return data[currentVal]
        },vm.$data)
    },
    getContentVal(expr,vm) {
        return expr.replace(/\{\{(.+?)\}\}/gm,(...args) => {
            value = this.getVal(args[1],vm)
        })
    },
    text(node,expr,vm){
        let value
        if(expr.indexOf('{{') !== -1) {
            value = expr.replace(/\{\{(.+?)\}\}/gm,(...args) => {
                new Watcher(vm,args[1],() => {
                    this.updater.textUpdater(node,this.getContentVal(expr,vm))
                })
                    console.log(args)

                return this.getVal(args[1],vm)
            })
        }else {
            value = this.getVal(expr,vm)
        }
        this.updater.textUpdater(node,value)
    },
    html(node,expr,vm){
        const value = this.getVal(expr,vm)
        new Watcher(vm,expr,(newVal) => {
            this.updater.htmlUpdater(node,newVal)
        })
        this.updater.htmlUpdater(node,value)
    },
    model(node,expr,vm){
        const value = this.getVal(expr,vm)
        new Watcher(vm,expr,(newVal) => {
            this.updater.modelUpdater(node,newVal)
        })
        this.updater.modelUpdater(node,value)
    },
    on(node,expr,vm,eventName){},
    updater:{
        modelUpdater(node,value){
            node.value = value
        },
        htmlUpdater(node,value){
            node.innerHTML = value
        },
        textUpdater(node,value) {
            node.textContent = value
        }
    }
}
class Compile {
    constructor(el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el)
        this.vm = vm
        //1.获取文档碎片对象，放入内存中会减少页面的回流和重绘
        const fragment = this.nodeToFragment(this.el)
        //2.编译模板
        this.compile(fragment)
        //3.追加子元素到根元素
        this.el.appendChild(fragment)
    }
    compile(fragment) {
        const childNodes = fragment.childNodes;
        [...childNodes].forEach(child =>{
            if(this.isElementNode(child)) {
                //是元素节点
                //编译元素节点
                this.compileElement(child)
                // console.log('元素节点',child)
            }else {
                this.compileText(child)
                // console.log('文本节点',child)
            }
            if(child.childNodes &&child.childNodes.length) {
                this.compile(child)
            }
        })
    }
    compileText(node) {
        const content = node.textContent
        if(/\{\{(.+?)\}\}/.test(content)){
            compileUtil['text'](node,content,this.vm)
        }

    }
    compileElement(node) {
        const attributes = node.attributes;
        [...attributes].forEach(attr => {
            const {name,value} = attr
            if(this.isDirective(name)) {
                const[,directive] = name.split('-') //text html model on:click
                const [dirName,eventName] = directive.split(':') //text html model on
                compileUtil[dirName](node,value,this.vm,eventName)
                node.removeAttribute('v-' + directive)
            }
        })
    }
    isDirective(attr) {
        return attr.startsWith('v-')
    }
    nodeToFragment(el) {
        const f = document.createDocumentFragment()
        let firstChild
        while (firstChild = el.firstChild) {
            f.appendChild(firstChild)
        }
        return f
    }
    isElementNode(node) {
        return node.nodeType === 1
    }
}
class MVue {
    constructor(options) {
        this.$el = options.el
        this.$data = options.data
        this.$options = options
        if (this.$el) {
            new Observer(this.$data)
            new Compile(this.$el, this)
        }
    }

}