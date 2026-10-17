import ru from './locales/ru.json';
export type Language = 'en' | 'ru';
export function loadLanguage():Language {try{return localStorage.getItem('academy.language')==='ru'?'ru':'en';}catch{return 'en';}}
export function translate(language:Language,text:string,values:Record<string,string|number>={}):string {
 const translated=language==='ru'?(ru as Record<string,string>)[text]??text:text;
 return translated.replace(/\{(\w+)\}/g,(match,key)=>String(values[key]??match));
}
