import {test,expect} from '@playwright/test';
test('real Python: correct/wrong, syntax/runtime, timeout, rerun, reset, reload and gating',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/Your next step/})).toBeVisible();
 await expect(page.getByRole('button',{name:/02 Strings/})).toBeDisabled();
 await page.getByRole('button',{name:"Start your first lesson"}).click();
 await page.getByRole('button',{name:'Run example 1'}).click();
 await expect(page.locator('.example-output').first()).toContainText('Research 5 True',{timeout:60000});
 await page.getByRole('button',{name:"Got it, let’s practice"}).click();
 const editor=page.getByRole('textbox',{name:"Python editor"});
 const fill=async(code:string)=>{await editor.click();await page.keyboard.press('ControlOrMeta+a');await page.keyboard.insertText(code);};
 await page.getByRole('button',{name:'Check',exact:true}).click();
 await expect(page.locator('.test-summary')).toContainText('Passed 0 of 3');
 await fill('if True print(1)');await page.getByRole('button',{name:'Check',exact:true}).click();await expect(page.locator('.error-box')).toContainText("Check your syntax");
 await fill('raise ValueError("oops")');await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('.error-box')).toContainText('ValueError: oops');
 await fill('while True:\n    pass');await page.getByRole('button',{name:'Check',exact:true}).click();await expect(page.locator('.error-box')).toContainText('Execution time limit exceeded',{timeout:20000});
 const solution='agent_name = "Research"\nmax_steps = 5\nis_active = True\nprint(agent_name)';
 await fill(solution);await page.getByRole('button',{name:'Check',exact:true}).click();await expect(page.locator('.test-summary')).toContainText('Passed 3 of 3');await expect(page.getByText("Exercise completed",{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Run',exact:true}).click();await expect(page.locator('.stdout')).toContainText('Research');
 await page.reload();await page.getByRole('button',{name:"My learning"}).click();
 // The next incomplete task is selected after reload; the first retains its draft and history.
 await page.locator('.exercise-selector button').first().click();await expect(editor).toContainText('Research');
 await page.getByRole('button',{name:/Attempts/}).click();await expect(page.locator('.attempt-row')).toHaveCount(4);
 await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(editor).toContainText('agent_name = ""');
 await page.getByRole('button',{name:'Hint 1 of 3'}).click();await expect(page.locator('.hint')).toHaveCount(1);
 await page.screenshot({path:'test-results/exercise.png',fullPage:true});
});
test('dashboard and mobile navigation',async({page})=>{
 await page.goto('/');await page.screenshot({path:'test-results/dashboard.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await expect(page.locator('body')).toHaveJSProperty('scrollWidth',390);await page.screenshot({path:'test-results/mobile.png',fullPage:true});
 await page.getByRole('button',{name:"Open menu"}).click();await page.getByRole('button',{name:"Learning path"}).click();await expect(page.getByRole('heading',{name:"Your path to AI Engineering"})).toBeVisible();
});
