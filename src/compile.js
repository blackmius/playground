import { docs, etl } from './files';

const imports = `<script type="module">
const p = /(from|import)\\s+['"]\\.\\/(.+)['"]/g;
const wait = {};
function load(o) {
    let skip = false;
    const t = o.textContent.replace(p, (u,a,z) => {
        let s = document.querySelector('script[type="module"][id="'+z+'"]');
        if (s) return a+'"'+s.src+'"';
        else {
            if (!wait[z]) wait[z] = [];
            wait[z].push(o);
            skip = true;
            return u;
        }
    });
    if (skip) return;
    let a = document.createElement('script');
    if (o.id) a.id = o.id;
    a.type = 'module';
    a.textContent = t;
    a.src = URL.createObjectURL(new Blob([t], {type: 'application/javascript'}));
    o.replaceWith(a);
    if (wait[a.id]) wait[a.id].forEach(load);
}
for (const o of document.querySelectorAll('script[type=inline-module]')) load(o);</script>`;

const postmessage = `<script>window.postMessage('resize');
(new MutationObserver(_ => window.postMessage('resize')))
.observe(document, { attributes: true, childList: true, subtree: true });
</script>`;

const meta = `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">`;

export const export_ = _ => Object.keys(docs).map(
    f => `// file: ${f}\n${docs[f].getValue()}`).join('\n');

export function output(el) {
    if (!el) return;
    
    const styles = [];
    const scripts = [];
    Object.keys(docs).forEach(name => {
        const [ _, ext ] = name.split('.');
        const lang = etl(ext);
        const src = docs[name].getValue();
        if (lang === 'javascript') {
            scripts.push(`<script type="inline-module" id="${name}">${src}</script>`);
        } else if (lang === 'css') {
            styles.push(`<style>${src}</style>`);
        }
    });
    
    const src = `${meta}${imports}${styles.join('')}<body>${scripts.join('')}${postmessage}</body>`;

    const iframe = document.createElement("iframe");
    while (el.firstChild) el.removeChild(el.firstChild);
    el.appendChild(iframe);
    
    iframe.contentDocument.open();
    iframe.contentDocument.write(src);
    iframe.contentDocument.close();
    
    iframe.contentWindow.addEventListener("message", _ => {
        iframe.height = iframe.contentWindow.document.children[0].offsetHeight;
    }, false); 
}
