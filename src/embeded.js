import { z, page } from './2ombular';
import CodeMirror from './codemirror';

if (parent && page.args.name) {
    let cmd = 'resize,'+page.args.name+',';
    (new MutationObserver(
        _ => parent.postMessage(cmd+document.children[0].offsetHeight, '*')
    )).observe(document, {
        attributes: true, childList: true, subtree: true
    });
}

import { docs } from './files';
import { output } from './compile';

const theme = page.args.theme;
const data = page.args.data;
const playgroundLink = location.href.split('#')[0] + '#;data=' + data;

const tabs = [];
Object.values(docs).forEach(d => tabs.push(z.h.w({
    key: d.file,
    on$created(e) {
        if (d.cm) d.cm = null;
        let editor = CodeMirror(e.target, {
            value: d,
            readOnly: true,
            mode: d.mode
        });
        if (theme) editor.setOption('theme', theme);
        editor.setSize('100%', '100%');
    }
})));
const Output = z.h.w({ key: 'output', on$created(e) { setTimeout(_=>output(e.target), 0) }});
tabs.push(Output);
const files = Object.keys(docs).concat(['Output']);
let c = 'Output', o = files.length - 1;

const Tab = (f, i) => z.cp.ph1.pv1.br({
    class: { bg1: f == c },
    onclick(e) { c = f; o = i; page.update(); }
}, f);

const Tabs = z.g.bg0.ph0.ac.ph1.pv1.wrap.jc(_=>files.map(Tab),
    z._a.br.ph1.pv1.spl1({href: playgroundLink, target: '_blank'}, 'Open in playground')
);

export default z.g.col.h.w(Tabs, _=>tabs[o]);
