import fs from 'fs';
const text = fs.readFileSync('components/BlindProfileCard.vue', 'utf8');
const lines = text.split('\n');
let template = "";
for (let i=0; i<lines.length; i++) {
  if (lines[i].includes('</template>')) break;
  template += lines[i] + '\n';
}

const selfClosing = ['input', 'img', 'br', 'hr', 'rect', 'path', 'svg', 'NuxtImg', 'slot', 'circle', 'Teleport', 'template'];
const stack = [];
const regex = /<(\/?)([\w-]+)[^>]*(\/?)>/g;
let match;
while ((match = regex.exec(template)) !== null) {
  const isClosing = match[1] === '/';
  const tag = match[2];
  const selfClosed = match[3] === '/';
  
  if (tag === 'template') continue;
  if (tag === 'Teleport') continue; 
  if (selfClosing.includes(tag) || selfClosed) continue;
  
  const lineNumber = template.substr(0, match.index).split('\n').length;
  
  if (isClosing) {
    if (stack.length && stack[stack.length - 1].tag === tag) {
      stack.pop();
    } else {
      console.log(`Mismatch on line ${lineNumber}: found </${tag}> but expected </${stack.length ? stack[stack.length-1].tag : 'NOTHING'}>`);
    }
  } else {
    stack.push({tag, line: lineNumber});
  }
}
if (stack.length) console.log('Unclosed tags left in stack: ', stack);
else console.log('All tags matched.');
