const fs=require('fs'); const s=fs.readFileSync(process.argv[2],'utf8');
const i=s.indexOf('const DS_COMPONENTS = ['); const j=s.indexOf('\n  ];', i);
const arr=eval(s.slice(i+'const DS_COMPONENTS = '.length, j+4));
console.log(JSON.stringify(arr.map(c=>({name:c.name,ui:c.ui,tag:c.tag,specs:c.specs,variants:c.variants,used:c.used})),null,1));
