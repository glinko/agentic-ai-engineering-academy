import {describe,it,expect} from 'vitest';
import {translate,loadLanguage} from '../../src/i18n';
import {getContent} from '../../src/content';
describe('bilingual content',()=>{
 it('defaults to English without browser storage',()=>expect(loadLanguage()).toBe('en'));
 it('translates messages and named placeholders',()=>{expect(translate('ru','Language')).toBe('Язык');expect(translate('en','Hint {number} of 3',{number:2})).toBe('Hint 2 of 3');expect(translate('ru','Hint {number} of 3',{number:2})).toBe('Подсказка 2 из 3');});
 it('keeps exercise identity and test semantics equal in both languages',()=>{
  const en=getContent('en'),ru=getContent('ru');expect(en.lessons).toHaveLength(5);
  for(let i=0;i<15;i++){
   const a=en.allExercises[i],b=ru.allExercises[i];expect(a.id).toBe(b.id);expect(a.difficulty).toBe(b.difficulty);
   expect(a.public_tests.map(({name,...test})=>test)).toEqual(b.public_tests.map(({name,...test})=>test));
   expect(a.title).not.toBe(b.title);expect(a.description).not.toBe(b.description);expect(a.starter_code).not.toMatch(/[А-Яа-яЁё]/);
  }
  en.lessons.forEach(l=>{expect(l.theory).not.toMatch(/[А-Яа-яЁё]/);expect(l.examples).toHaveLength(3);l.examples.forEach(e=>expect(e.code).not.toMatch(/[А-Яа-яЁё]/));});
 });
});
