export interface TestCase { name: string; setup?: string; expression: string; expected: unknown }
export interface Exercise { id:string; lesson_id:string; title:string; difficulty:'Beginner'|'Intermediate'|'Checkpoint'; learning_objectives:string[]; theory:string; description:string; starter_code:string; public_tests:TestCase[]; hints:string[]; explanation:string; estimated_minutes:number }
export interface Example {title:string;code:string}
export interface Lesson {id:string;title:string;subtitle:string;minutes:number;theory:string;examples:Example[];mistakes:string[];exercises:Exercise[]}
export interface TestResult {name:string;passed:boolean;actual?:string;expected?:string;error?:string}
export interface ExecutionResult {stdout:string;stderr:string;tests:TestResult[];error?:string;duration_ms:number;kind?:'syntax'|'runtime'|'timeout'|'infrastructure'}
export interface Attempt {at:string;passed:boolean;tests:TestResult[];error?:string;duration_ms:number}
export interface ExerciseProgress {code:string;hints:number;attempts:Attempt[];completed:boolean;elapsed_seconds:number;review_at?:string}
export interface Progress {version:1;exercises:Record<string,ExerciseProgress>;theory_read:string[];last_exercise?:string}
