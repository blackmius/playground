import { z, page } from './2ombular';

export const Icon = name => z._i['icon-'+name]();

const tabs = [];
let id = 0;
export class Tab {
    constructor(el, last) {
        this.id = ++id;
        this.last = last;
        if (el.render) {
            el.tab = this;
            this.el = _ => el.render();
        } else {
            this.el = el;
        }
    }
    remove() {
       tabs.splice(tabs.indexOf(this), 1);
       page.update();
    }
    render() {
        return z.v({key: this.id, class: { w: this.last }}, this.el);
    }
}
export const Tabs = _ => tabs.map(t => t.render());
Tabs.insert = (index, tab) => tabs.splice(index, 0, tab);
Tabs.push = tab => tabs.push(tab);
