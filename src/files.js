import { page } from './2ombular';

import CodeMirror from './codemirror';

export let docs = {};
export let main;
const fRegEx = /\/\/\s*file:\s*(\S*)/gm;

const etl_ = {'js': 'javascript', 'css': 'css'}; 
export const etl = e => etl_[e];

export function addDoc(file, src) {
    const [ _, ext ] = file.split('.');
    const doc = CodeMirror.Doc(src.trim(), etl(ext));
    doc.file = file;
    doc.mode = etl[ext];
    docs[file] = doc;
}

export function removeDoc(file) {
    let doc = docs[file];
    if (!doc) return;
    if (doc.cm) doc.cm.c.remove();
    delete docs[file];
}

function load() {
    if (!page.args.data) return;
    Object.values(docs).forEach(d => {
        if (d.cm && d.cm.c) d.cm.c.remove();
    });
    docs = {};
    const data = atob(page.args.data);
    let src = '', file;
    for (const line of data.split('\n')) {
        if (line.slice(0, 9) === '// file: ') {
            if (file) addDoc(file, src);
            src = '';
            file = line.slice(9);
        } else src += line+'\n';
    }
    addDoc(file, src);
}

load();
window.addEventListener('hashchange', e => load(), false);
