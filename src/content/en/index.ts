import variables from './variables.md?raw';
import strings from './strings.md?raw';
import conditions from './conditions.md?raw';
import loops from './loops.md?raw';
import collections from './collections.md?raw';
import exercises from './exercises.json';
import {lessons as russianLessons} from '../ru';
import type {Lesson,Exercise} from '../../types';
const theory=[variables,strings,conditions,loops,collections];
const titles=['Variables and data types','Strings and operations','Conditions and logic','Loops','Lists and dictionaries'];
const subtitles=['Describe the world through data','Turn raw text into useful information','Teach your program to make decisions','Automate repetitive work','Build your first Research Assistant module'];
const mistakes=[
 ['Putting quotes around a number changes its type to str.','True starts with a capital T.','Use input variables instead of a fixed answer.'],
 ['String methods return a new string.','Without the f prefix, variables are not interpolated.','strip() does not remove internal spaces.'],
 ['= assigns a value; == compares values.','if, elif, and else need a colon.','Check equality at range boundaries.'],
 ['Initialize accumulators before the loop.','Indentation determines which statements repeat.','break exits the loop; continue skips one iteration.'],
 ['append() returns None.','Assigning a list does not create a copy.','Reading a missing dictionary key with [] raises KeyError.']
];
const exampleTitles=[['Agent configuration','Request budget','Data from an API'],['Clean a command','A log message','Instruction length'],['Check the budget','API response','Permissions'],['Token total','Latency counter','Iteration limit'],['Independent queue','Incomplete data','Filter messages']];
const outputs:Record<string,string>={'Запросов:':'Requests:','Остаток:':'Remaining:','Можно запускать':'Ready to run','Недостаточно средств':'Insufficient funds','Шаг':'Step'};
export const lessons:Lesson[]=russianLessons.map((lesson,i)=>({...lesson,title:titles[i],subtitle:subtitles[i],theory:theory[i],mistakes:mistakes[i],examples:lesson.examples.map((ex,j)=>({...ex,title:exampleTitles[i][j],code:ex.code.replace(/Запросов:|Остаток:|Можно запускать|Недостаточно средств|Шаг/g,text=>outputs[text])})),exercises:(exercises as Exercise[]).filter(e=>e.lesson_id===lesson.id)}));
export const allExercises=lessons.flatMap(l=>l.exercises);
export const roadmap=[
 ['Python + Async','1–4','Syntax → API → asynchronous service'],['LLM Fundamentals','5–6','A multi-provider LLM client'],['Tool Calling','7–8','An agent with multiple tools'],['Memory + State','9–10','Long-term memory and RAG'],['Single Agent','11–12','A research agent'],['Multi-Agent','13–14','A team of specialized agents'],['Human-in-the-Loop','15–16','Approval and resumption'],['Evaluation + QA','17–18','Evaluation datasets and regression tests'],['Observability','19–20','Tracing, latency, and cost'],['Security','21–22','Protecting tools and data'],['Deployment','23–24','Containers, CI/CD, and rollback'],['Portfolio','25–26','Documentation and project demonstration']
];
