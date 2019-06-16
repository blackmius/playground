import { z, page, each } from './2ombular';

import './codemirror';
import './style.css';
import './icomoon/style.css';

import Embeded from './embeded';
import Main from './main';

document.title = 'Zombular playground';

const Body = page.args.embeded ? Embeded : Main;
page.setBody(Body);
