import {test,expect} from '@playwright/test';

test('Tab indents Python, Shift+Tab outdents, and Escape then Tab exits the editor',async({page})=>{
 await page.goto('/');
 await page.getByRole('button',{name:'Start your first lesson'}).click();
 await page.getByRole('button',{name:'Got it, let’s practice'}).click();
 const editor=page.getByRole('textbox',{name:'Python editor'});
 await editor.fill('print("hello")');
 await editor.press('ControlOrMeta+Home');
 await editor.press('Tab');
 await expect(editor).toBeFocused();
 await expect(editor.locator('.cm-line')).toHaveText([/^ {4}print\("hello"\)$/]);
 await editor.press('Shift+Tab');
 await expect(editor).toBeFocused();
 await expect(editor.locator('.cm-line')).toHaveText([/^print\("hello"\)$/]);

 await editor.fill('x = 1\nprint(x)');
 await editor.press('ControlOrMeta+a');
 await editor.press('Tab');
 await expect(editor.locator('.cm-line')).toHaveText([/^ {4}x = 1$/,/^ {4}print\(x\)$/]);
 await editor.press('Shift+Tab');
 await expect(editor.locator('.cm-line')).toHaveText([/^x = 1$/,/^print\(x\)$/]);
 await editor.press('ArrowRight');
 await editor.press('Escape');
 await editor.press('Tab');
 await expect(page.getByRole('button',{name:'Run',exact:true})).toBeFocused();

 await page.reload();
 await page.getByRole('button',{name:'My learning'}).click();
 await expect(page.getByRole('textbox',{name:'Python editor'}).locator('.cm-line')).toHaveText([/^x = 1$/,/^print\(x\)$/]);
});
