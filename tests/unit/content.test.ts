import {describe,it,expect} from 'vitest';
import exercises from '../../src/content/exercises.json';
import solutions from '../../src/content/solutions.json';
describe('authored exercise contracts',()=>{
 it('has 15 unique tasks, three per lesson, separate references and boundary tests',()=>{expect(exercises).toHaveLength(15);expect(new Set(exercises.map(e=>e.id)).size).toBe(15);for(const e of exercises){expect(e.public_tests.length).toBeGreaterThanOrEqual(3);expect(solutions[e.id as keyof typeof solutions]).toBeTruthy();expect(e.difficulty==='Checkpoint'?e.hints.length===0:e.hints.length===3).toBe(true);expect(exercises.filter(x=>x.lesson_id===e.lesson_id)).toHaveLength(3);}});
});
