import type {Exercise} from '../types';
// Implementations use a server adapter; credentials never belong in browser code.
export interface TutorProvider {
 explain_error(error:string,exerciseId:string):Promise<string>;
 give_hint(exerciseId:string,level:number):Promise<string>;
 explain_concept(concept:string):Promise<string>;
 generate_similar_exercise(exerciseId:string):Promise<Exercise>;
 review_solution(exerciseId:string,code:string):Promise<string>;
}
export interface ValidatedExercise {exercise:Exercise;reference_solution:string;validation:{passed:boolean;test_count:number;validated_at:string}}
export function canPublish(candidate:ValidatedExercise){return candidate.validation.passed&&candidate.validation.test_count===candidate.exercise.public_tests.length&&candidate.validation.test_count>0;}
