import {useEffect,useRef} from 'react';
import type {Language} from '../i18n';
import {translate} from '../i18n';

export default function RestoreProgress({count,language,onRestore,onCancel}:{count:number;language:Language;onRestore:()=>void;onCancel:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const tr=(text:string,values:Record<string,string|number>={})=>translate(language,text,values);
 useEffect(()=>{dialog.current?.showModal();return()=>dialog.current?.close();},[]);
 return <dialog className="restore-progress" ref={dialog} onCancel={onCancel} aria-labelledby="restore-progress-title">
  <h2 id="restore-progress-title">{tr('Restore previous learning')}</h2>
  <p>{tr('Mark the first {count} lessons as previously completed and continue with lesson {next}. Your saved code and attempts will be kept.',{count,next:count+1})}</p>
  <p className="muted small">{tr('This restores self-reported progress in this browser only. It does not create passed test results.')}</p>
  <div className="restore-actions"><button className="secondary" onClick={onCancel}>{tr('Cancel')}</button><button className="primary" onClick={onRestore}>{tr('Restore and continue')}</button></div>
 </dialog>;
}
