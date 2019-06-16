import CodeMirror from 'codemirror';

import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/nord.css';
import 'codemirror/mode/javascript/javascript.js';
import 'codemirror/mode/css/css.js';

import 'codemirror/addon/display/rulers.js';
import 'codemirror/addon/selection/active-line.js';
import 'codemirror/addon/edit/matchbrackets.js';

Object.assign(CodeMirror.defaults, {
    lineNumbers: true,
    styleActiveLine: true,
    matchBrackets: true,
    indentUnit: 4,
    smartIndent: false
});

export default CodeMirror;
