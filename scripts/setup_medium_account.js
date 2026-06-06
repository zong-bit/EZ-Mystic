import { launch } from '/tmp/node_modules/cloakbrowser/dist/index.js';
import { randomInt } from 'crypto';
import { writeFileSync, readFileSync } from 'fs';

// 随机延迟
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min = 2000, max = 5000) {
    const ms = randomInt(min, max + 1);
    console.log(`   ⏳ 等待 ${ms/1000}s...`);
    return delay(ms);
}

async function checkMailToken() {
    // 获取 mail.tm 的认证 token
    const resp = await fetch('https://api.mail.tm/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            address: 'test@mail.tm',
            password: 'TestPassword123!'
        })
    });
    
    if (resp.status === 200) {
        const data = await resp.json();
        return data.token;
    }
    return null;
}

async function checkMailInbox(token) {
    if (!token) return [];
    
    const resp = await fetch('https://api.mail.tm/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (resp.status === 200) {
        const data = await resp.json();
        return data['hydra:member'] || [];
    }
    return [];
}

async function main() {
    console.log('🚀 开始自动化 Medium 账户注册流程');
    console.log('='.repeat(60));

    const browser = await launch({
        headless: true,
        args: ['--no-sandbox', '--disable-gpu', '--proxy-server=http://127.0.0.1:7897']
    });

    const page = await browser.newPage();

    try {
        // ─── Step 1: 访问 Medium 注册页 ───
        console.log('\n📧 Step 1: 访问 Medium 注册页');
        await page.goto('https://medium.com/m/signin', {
            waitUntil: 'networkidle',
            timeout: 30000
        });
        await randomDelay(2000, 4000);

        // ─── Step 2: 点击 "Sign in with email" ───
        console.log('📧 Step 2: 点击 "Sign in with email"');
        const emailBtn = await page.$('text=Sign in with email');
        if (!emailBtn) {
            throw new Error('未找到 "Sign in with email" 按钮');
        }
        await emailBtn.click();
        await randomDelay(2000, 4000);

        // ─── Step 3: 填写邮箱 ───
        console.log('📧 Step 3: 填写邮箱');
        
        // 输入邮箱
        const emailInput = await page.$('input[type="email"]');
        if (emailInput) {
            await emailInput.click();
            await emailInput.type('test@mail.tm');
            console.log('   ✅ 邮箱已填写: test@mail.tm');
        } else {
            throw new Error('未找到邮箱输入框');
        }
        await randomDelay(1000, 2000);

        // ─── Step 4: 点击 Continue ───
        console.log('📧 Step 4: 点击 Continue');
        const continueBtn = await page.$('text=Continue');
        if (continueBtn) {
            await continueBtn.click();
            console.log('   ✅ Continue 按钮已点击');
        } else {
            // 尝试回车
            await page.keyboard.press('Enter');
            console.log('   ⌨️ 已按回车键');
        }
        await randomDelay(5000, 10000);

        // ─── Step 5: 截图检查状态 ───
        console.log('📧 Step 5: 截图检查状态');
        await page.screenshot({ path: '/tmp/medium_step1.png', fullPage: true });
        console.log('   ✅ 已截图到 /tmp/medium_step1.png');

        // 检查页面内容
        const title = await page.title();
        console.log(`   📄 页面标题: ${title}`);

        // 检查是否有验证错误
        const errorText = await page.evaluate(() => {
            const errorEl = document.querySelector('[class*="error"], [class*="alert"], [class*="invalid"]');
            return errorEl ? errorEl.innerText : null;
        });
        if (errorText) {
            console.log(`   ❌ 错误: ${errorText}`);
        } else {
            console.log('   ✅ 无明显错误');
        }

        // 检查是否进入验证页面
        const currentUrl = page.url();
        console.log(`   🔗 当前 URL: ${currentUrl}`);

        // 如果 URL 包含 /verify 或 /confirm，说明需要验证
        if (currentUrl.includes('verify') || currentUrl.includes('confirm')) {
            console.log('   📧 需要验证邮箱');
            // 等待邮件到来
            console.log('   ⏳ 等待验证邮件 (最多 60 秒)...');
            
            const mailToken = await checkMailToken();
            if (mailToken) {
                for (let i = 0; i < 6; i++) {
                    await delay(10000);
                    console.log(`   🔍 检查邮件 ${i+1}/6...`);
                    
                    const messages = await checkMailInbox(mailToken);
                    if (messages.length > 0) {
                        console.log('   ✅ 收到邮件!');
                        const latest = messages[0];
                        console.log(`   📧 主题: ${latest.subject}`);
                        console.log(`   📧 发件人: ${latest.from?.address || 'N/A'}`);
                        
                        // 获取邮件内容
                        const messageResp = await fetch(`https://api.mail.tm/messages/${latest.id}`, {
                            headers: { 'Authorization': `Bearer ${mailToken}` }
                        });
                        if (messageResp.status === 200) {
                            const messageData = await messageResp.json();
                            console.log(`   📄 邮件内容预览: ${messageData.text?.substring(0, 200) || 'N/A'}`);
                            
                            // 提取验证链接
                            if (messageData.text) {
                                const linkMatch = messageData.text.match(/https:\/\/[^\s]+/);
                                if (linkMatch) {
                                    console.log(`   🔗 验证链接: ${linkMatch[0]}`);
                                    // 导航到验证链接
                                    console.log('   🌐 导航到验证链接...');
                                    await page.goto(linkMatch[0], { waitUntil: 'networkidle', timeout: 30000 });
                                    await randomDelay(3000, 6000);
                                    
                                    // 截图验证结果
                                    await page.screenshot({ path: '/tmp/medium_verified.png', fullPage: true });
                                    console.log('   ✅ 已截图到 /tmp/medium_verified.png');
                                    
                                    // 检查是否注册成功
                                    const verifiedUrl = page.url();
                                    console.log(`   🔗 验证后 URL: ${verifiedUrl}`);
                                    
                                    // 如果验证成功，继续获取 token
                                    if (!verifiedUrl.includes('error') && !verifiedUrl.includes('invalid')) {
                                        console.log('   ✅ 邮箱验证成功!');
                                        // 导航到 settings 页面获取 token
                                        console.log('   🔑 导航到 Medium settings 页面...');
                                        await page.goto('https://medium.com/me/settings', { waitUntil: 'networkidle', timeout: 30000 });
                                        await randomDelay(3000, 6000);
                                        
                                        // 截图 settings 页面
                                        await page.screenshot({ path: '/tmp/medium_settings.png', fullPage: true });
                                        console.log('   ✅ 已截图到 /tmp/medium_settings.png');
                                        
                                        // 查找 Integration tokens 部分
                                        const settingsText = await page.evaluate(() => document.body.innerText);
                                        console.log('   📄 Settings 页面文本 (前 500 字符):');
                                        console.log(settingsText.substring(0, 500));
                                        
                                        // 查找 Generate token 按钮
                                        const generateBtn = await page.$('text=Generate new secret, text=Generate token, button[class*="generate"]');
                                        if (generateBtn) {
                                            console.log('   🔑 找到 Generate token 按钮，点击...');
                                            await generateBtn.click();
                                            await randomDelay(3000, 6000);
                                            
                                            // 截图 token 页面
                                            await page.screenshot({ path: '/tmp/medium_token.png', fullPage: true });
                                            console.log('   ✅ 已截图到 /tmp/medium_token.png');
                                            
                                            // 获取 token
                                            const tokenText = await page.evaluate(() => {
                                                const tokenEl = document.querySelector('[class*="token"], [class*="secret"], code, pre');
                                                return tokenEl ? tokenEl.innerText : null;
                                            });
                                            
                                            if (tokenText) {
                                                console.log(`   🔑 Token: ${tokenText.substring(0, 50)}...`);
                                                // 保存 token
                                                writeFileSync('/home/zxw/.openclaw/workspace/ez-mystic/scripts/medium_token.txt', tokenText.trim());
                                                console.log('   💾 Token 已保存到 medium_token.txt');
                                            } else {
                                                console.log('   ⚠️ 未找到 token 文本');
                                            }
                                        } else {
                                            console.log('   ⚠️ 未找到 Generate token 按钮');
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            } else {
                console.log('   ❌ 无法获取 mail.tm token');
            }
        } else {
            console.log('   ✅ 已注册成功或进入下一步');
        }

        // 保存状态
        const state = {
            email: 'test@mail.tm',
            password: 'TestPassword123!',
            currentUrl: currentUrl,
            title: title,
            timestamp: new Date().toISOString()
        };
        writeFileSync('/home/zxw/.openclaw/workspace/ez-mystic/scripts/medium_credentials.json', JSON.stringify(state, null, 2));
        console.log('   💾 状态已保存到 medium_credentials.json');

    } catch (error) {
        console.error('❌ 错误:', error.message);
        // 保存错误状态
        const errorState = {
            email: 'test@mail.tm',
            password: 'TestPassword123!',
            error: error.message,
            timestamp: new Date().toISOString()
        };
        writeFileSync('/home/zxw/.openclaw/workspace/ez-mystic/scripts/medium_credentials.json', JSON.stringify(errorState, null, 2));
    } finally {
        await browser.close();
        console.log('\n✅ 浏览器已关闭');
    }
}

main().catch(console.error);
