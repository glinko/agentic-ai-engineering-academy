import {readFile,writeFile} from 'node:fs/promises';
for(const language of ['en','ru']){
 const exercises=JSON.parse(await readFile(language==='en'?'src/content/en/exercises.json':'src/content/exercises.json','utf8'));
 const metadata=JSON.stringify({version:1,language,weeks:26,stages:12,available_lessons:5,exercises:exercises.map(({id,lesson_id,title,difficulty,learning_objectives,estimated_minutes})=>({id,lesson_id,title,difficulty,learning_objectives,estimated_minutes}))},null,2)+'\n';
 await writeFile(`backend/curriculum.${language}.json`,metadata);
 if(language==='en')await writeFile('backend/curriculum.json',metadata);
}
