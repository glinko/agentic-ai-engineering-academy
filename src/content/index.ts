import * as en from './en';
import * as ru from './ru';
import type {Language} from '../i18n';
export function getContent(language:Language){return language==='ru'?ru:en;}
export const {lessons,allExercises,roadmap}=en;
