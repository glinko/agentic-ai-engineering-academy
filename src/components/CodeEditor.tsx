import {useEffect,useRef} from 'react';
import {EditorView,basicSetup} from 'codemirror';
import {python} from '@codemirror/lang-python';
import {oneDark} from '@codemirror/theme-one-dark';
export default function CodeEditor({value,onChange,identity,label='Python editor'}:{value:string;onChange:(code:string)=>void;identity:string;label?:string}){
 const host=useRef<HTMLDivElement>(null),view=useRef<EditorView|null>(null),callback=useRef(onChange);
 callback.current=onChange;
 useEffect(()=>{
  if(!host.current)return;
  const editor=new EditorView({parent:host.current,doc:value,extensions:[basicSetup,python(),oneDark,EditorView.lineWrapping,EditorView.contentAttributes.of({'aria-label':label,'spellcheck':'false'}),EditorView.updateListener.of(update=>{if(update.docChanged)callback.current(update.state.doc.toString());})]});
  view.current=editor;
  return ()=>{editor.destroy();view.current=null;};
 // Editor is intentionally recreated when switching exercise identity.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[identity,label]);
 useEffect(()=>{const editor=view.current;if(editor&&editor.state.doc.toString()!==value)editor.dispatch({changes:{from:0,to:editor.state.doc.length,insert:value}});},[value]);
 return <div className="code-editor" ref={host}/>;
}
