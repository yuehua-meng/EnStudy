import {useMemo,useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {secureAccountAccess,type Account} from '@/lib/account';
import {PHONE_HINT,normalizePhone,phoneCountries,accountLabel,type PhoneCountry} from '@/lib/phone';
import {NativeSelect} from '@/components/ui/native-select';

type Props={open:boolean;onOpenChange:(open:boolean)=>void;user:Account|null;syncMessage:string;
 onSignIn:(mode:'login'|'register',username:string,password:string,mergeGuest:boolean)=>Promise<void>;
 onSignOut:()=>Promise<void>;onSync:()=>Promise<void>};

export default function AccountDialog({open,onOpenChange,user,syncMessage,onSignIn,onSignOut,onSync}:Props){
 const [mode,setMode]=useState<'login'|'register'>(()=>typeof window!=='undefined'&&new URLSearchParams(window.location.search).get('account')==='register'?'register':'login');
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [mergeGuest,setMergeGuest]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const [legacyLogin,setLegacyLogin]=useState(false);
 const [country,setCountry]=useState<PhoneCountry>('CN');
 const countries=useMemo(phoneCountries,[]);
 const legacy=mode==='login'&&legacyLogin;
 const normalized=legacy?null:normalizePhone(username,country);
 const secure=typeof window!=='undefined'&&secureAccountAccess();
 const secureUrl=typeof window!=='undefined'?new URL(window.location.href):null;
 if(secureUrl){secureUrl.protocol='https:';if(secureUrl.port==='80')secureUrl.port='';secureUrl.searchParams.set('account',mode);}
 async function run(action:()=>Promise<void>){setBusy(true);setError('');try{await action();setPassword('');setConfirm('');}catch(e){setError(e instanceof Error?e.message:'操作失败，请稍后再试');}finally{setBusy(false);}}
 return <Dialog open={open} onOpenChange={next=>{if(!busy){setPassword('');setConfirm('');setError('');onOpenChange(next);}}}>
  <DialogContent className="account-dialog"><DialogHeader><DialogTitle>{user?'我的账户':mode==='login'?'登录 EnStudy':'创建账户'}</DialogTitle><DialogDescription>游客也能学习。登录后，收藏、复习记录和探索进度可在电脑与手机间同步。</DialogDescription></DialogHeader>
   {user?<><p className="account-name">{accountLabel(user.username)}</p><p role="status">{syncMessage}</p><p className="small-label">退出后恢复本机游客记录，账户的本地缓存会保留，供下次登录继续同步。</p><div className="backup-actions"><Button disabled={busy} onClick={()=>void run(onSync)}>立即同步</Button><Button variant="outline" disabled={busy} onClick={()=>void run(onSignOut)}>退出登录</Button></div></>:
   <form className="account-form" onSubmit={event=>{event.preventDefault();if(!legacy&&!normalized){setError(PHONE_HINT);return;}if(mode==='register'&&password!==confirm){setError('两次输入的密码不一致');return;}void run(async()=>{await onSignIn(mode,legacy?username.trim():normalized!,password,mergeGuest);onOpenChange(false);});}}>
    {!secure&&<div className="account-secure-entry"><p>注册和登录请进入本站的 HTTPS 安全页面，IP 地址保持不变。</p><Button type="button" onClick={()=>{if(secureUrl)window.location.assign(secureUrl.href);}}>进入安全页面{mode==='register'?'注册':'登录'}</Button><p className="small-label">原 HTTP 页面仍可学习。有本机学习记录时，请先在“学习设置与备份”导出，再到安全页面导入；登录时勾选合并游客记录即可同步。</p></div>}
    {secure&&<>{!legacy&&<label>国家／地区<NativeSelect aria-label="手机号国家或地区" value={country} disabled={busy} onChange={event=>{setCountry(event.target.value as PhoneCountry);setError('');}}>{countries.map(item=><option key={item.country} value={item.country}>{item.label}</option>)}</NativeSelect></label>}
    <label>{legacy?'旧用户名':'手机号'}<input key={legacy?'legacy':'phone'} type={legacy?'text':'tel'} inputMode={legacy?'text':'tel'} autoComplete="username" value={username} onChange={e=>{setUsername(e.target.value);setError('');}} pattern={legacy?'[a-zA-Z0-9_]{3,32}':undefined} minLength={legacy?3:undefined} maxLength={legacy?32:64} required disabled={busy} placeholder={legacy?'已有账户的旧用户名':'本地号码或 +国际区号，例如 +1 202 555 0123'} title={legacy?'已有的旧用户名':PHONE_HINT} aria-describedby="phone-account-help" autoCapitalize="none" spellCheck={false}/></label>
    <p id="phone-account-help" className="small-label">{legacy?'仅供已有用户名账户登录，新注册请使用手机号。':'支持多国号码，兼容空格、横线和括号；带 + 区号时自动按国际号码识别。仅校验格式，不发送短信、不验证号码归属。'}</p>
    {normalized&&<p className="small-label" aria-live="polite">账号格式：{accountLabel(normalized)}</p>}
    <label>密码<input type="password" autoComplete={mode==='register'?'new-password':'current-password'} minLength={mode==='register'?10:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required disabled={busy||!secure}/></label>
    {mode==='register'&&<><label>确认密码<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required disabled={busy||!secure}/></label><p className="small-label">请使用 10–128 位密码或长口令，建议保存到密码管理器。暂不支持忘记密码找回，请妥善保存。</p></>}
    <label className="account-merge"><input type="checkbox" checked={mergeGuest} onChange={e=>setMergeGuest(e.target.checked)} disabled={busy}/><span>将此浏览器的游客学习记录合并到该账户</span></label>
    <p className="small-label">手机号作为登录账号，与密码和学习记录一起保存在本站服务中。密码使用哈希保存。</p>
    <Button type="submit" disabled={busy}>{busy?'正在处理…':mode==='register'?'注册并登录':'登录'}</Button></>}
    <Button type="button" variant="ghost" disabled={busy} onClick={()=>{setMode(mode==='login'?'register':'login');setLegacyLogin(false);setUsername('');setError('');setPassword('');setConfirm('');}}>{mode==='login'?'没有账户？免费注册':'已有账户？去登录'}</Button>
    {secure&&mode==='login'&&<Button type="button" variant="link" disabled={busy} onClick={()=>{setLegacyLogin(!legacy);setUsername('');setPassword('');setError('');}}>{legacy?'使用手机号登录':'已有旧用户名？使用旧账号登录'}</Button>}
   </form>}
   {error&&<p className="notice error" role="alert">{error}</p>}
  </DialogContent>
 </Dialog>;
}
