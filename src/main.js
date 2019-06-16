import { z, page, each, Val } from './2ombular';
import { throttled } from './utils';

import { Icon, Tab, Tabs } from './view';

import { docs, addDoc, removeDoc } from './files';
import { export_, output } from './compile';

import CodeMirror from './codemirror';

const editors = [];

let compile_ = throttled(500, _ => output(o));

class Editor {
    constructor(doc) {
        this.doc = doc;
        this.onchange = _ => compile_();
    }
    create(e) {
        this.el = e.target
        this.editor = CodeMirror(this.el, {
            value: this.doc,
            autofocus: true,
            mode: this.doc.mode,
            rulers: [{ column: 60 }]
        });
        this.editor.c = this;
        this.editor.setSize('100%', '100%');
        this.editor.on('change', this.onchange);
        this.editor.focus();
    }
    remove() {
        this.doc.cm = undefined;
        editors.splice(editors.indexOf(this), 1);
        this.tab.remove();
    }
    render() {
        return z.v.g.col.w.h(
            z.g.pv1.ph0.ac(
                z.cp.fs2({ onclick: e => this.remove() }, Icon('x')), z.v.spl0(this.doc.file)),
            z.s1.ovh.mw({ on$created: e => setTimeout(_ => this.create(e), 0) })
        );
    }
}

let n = false, nf = Val('');
function cancelNF() {
    nf('');
    n = false;
    page.update();
}
const NewFile = z._input.sp1({
    value: nf,
    on$created(e) { e.target.focus(); },
    onblur: cancelNF,
    onkeydown(e) {
        nf(e.target.value);
        if (e.keyCode == 13) {
            addDoc(nf(), '');
            compile_();
            cancelNF();
        } else if (e.keyCode == 27) cancelNF();
    }
});

let fnev = Val(''), fne;
function cancelFNE() {
    fne = null;
    page.update();
}
const File = f => fne == f
? z._input.sp1({
    value: fnev,
    on$created(e) { e.target.focus(); },
    onblur: cancelFNE,
    onkeydown(e) {
        fnev(e.target.value);
        if (e.keyCode == 13) {
            let val = fnev().trim();
            if (val) {
                docs[fne].file = val;
                docs[val] = docs[fne];
                delete docs[fne];
                compile_();
            }
            cancelFNE();
        } else if (e.keyCode == 27) cancelFNE();
    }
})
: z.sp1.g(
    z._a.cp({
        onclick(e) {
            const doc = docs[f];
            let editor = editors.find(e => e.doc == doc);
            if (editor) {
                editor.editor.focus();
            } else {
                editor = new Editor(doc);
                editors.push(editor);
                Tabs.insert(1, new Tab(editor));
                page.update();
            }
        }
    }, f),
    z.g.reverse.s1.spl2(
        z.spl1.cp({
            onclick() { removeDoc(f); compile_(); page.update(); }
        }, Icon('trash')),
        z.cp({
            onclick() { fne = f; fnev(f); page.update(); }
        }, Icon('edit'))
    )
);

const Sources = z.v.ph0.pv1(
    z.b.fs0('Project'),
    _ => Object.keys(docs).map(File),
    _ => n ? NewFile : '',
    z.ws.sp1.cp({
        onclick(e) {
            n = true;
            page.update();
        }
    }, Icon('plus'), ' Add Script'),
    z.ws.sp1.cp({
        onclick(e) {
            let editor = editors.find(e => e.doc.file == 'export');
            if (!editor) {
                const doc = CodeMirror.Doc('', '');
                doc.file = 'export';
                editor = new Editor(doc);
                editors.push(editor);
                Tabs.insert(1, new Tab(editor));
            }
            editor.doc.setValue(export_());
            page.update();
        }
    }, Icon('package'), ' Export Project'),
    z.ws.sp1.cp({
        onclick(e) {
            let editor = editors.find(e => e.doc.file == 'load');
            if (!editor) {
                const doc = CodeMirror.Doc('', '');
                doc.file = 'load';
                editor = new Editor(doc);
                editors.push(editor);
                editor.onchange = _=> {
                    window.location.hash = page.link(null, {
                        data:btoa(doc.getValue())
                    });
                    setTimeout(compile_, 0);
                }
                Tabs.insert(1, new Tab(editor));
                page.update();
            } else editor.focus();
        }
    }, Icon('upload'), ' Load Project'),
);

let o;
const Output = z.v.out.h.w({ key: 'output',
    on$created(e) { o = e.target; compile_(); }
});

Tabs.push(new Tab(Sources));
Tabs.push(new Tab(Output, 'last'));

export default z.g.fx.w.h(Tabs);
