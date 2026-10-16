import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import {secureAccountAccess,type Account} from '@/lib/account';

type Props={open:boolean;onOpenChange:(open:boolean)=>void;user:Account|null;syncMessage:string;
 onSignIn:(mode:'login'|'register',username:string,password:string,mergeGuest:boolean)=>Promise<void>;
 onSignOut:()=>Promise<void>;onSync:()=>Promise<void>};

export default function AccountDialog({open,onOpenChange,user,syncMessage,onSignIn,onSignOut,onSync}:Props){
 const [mode,setMode]=useState<'login'|'register'>('login');
 const [username,setUsername]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [mergeGuest,setMergeGuest]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const secure=typeof window!=='undefined'&&secureAccountAccess();
 async function run(action:()=>Promise<void>){setBusy(true);setError('');try{await action();setPassword('');setConfirm('');}catch(e){setError(e instanceof Error?e.message:'操作失败，请稍后再试');}finally{setBusy(false);}}
 return <Dialog open={open} onOpenChange={next=>{if(!busy){setPassword('');setConfirm('');setError('');onOpenChange(next);}}}>
  <DialogContent className="account-dialog"><DialogHeader><DialogTitle>{user?'我的账户':mode==='login'?'登录 EnStudy':'创建账户'}</DialogTitle><DialogDescription>游客也能学习。登录后，收藏、复习记录和探索进度可在电脑与手机间同步。</DialogDescription></DialogHeader>
   {user?<><p className="account-name">{user.username}</p><p role="status">{syncMessage}</p><p className="small-label">退出后恢复本机游客记录，账户的本地缓存会保留，供下次登录继续同步。</p><div className="backup-actions"><Button disabled={busy} onClick={()=>void run(onSync)}>立即同步</Button><Button variant="outline" disabled={busy} onClick={()=>void run(onSignOut)}>退出登录</Button></div></>:
   <form className="account-form" onSubmit={event=>{event.preventDefault();if(mode==='register'&&password!==confirm){setError('两次输入的密码不一致');return;}void run(async()=>{await onSignIn(mode,username.trim(),password,mergeGuest);onOpenChange(false);});}}>
    {!secure&&<p className="notice error">本站尚未启用 HTTPS，暂不能安全登录。你可以继续使用游客模式。</p>}
    <label>用户名<input autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} pattern="[a-zA-Z0-9_]{3,32}" minLength={3} maxLength={32} required disabled={busy||!secure} placeholder="3–32 位字母、数字或下划线" autoCapitalize="none" spellCheck={false}/></label>
    <label>密码<input type="password" autoComplete={mode==='register'?'new-password':'current-password'} minLength={mode==='register'?10:1} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} required disabled={busy||!secure}/></label>
    {mode==='register'&&<><label>确认密码<input type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required disabled={busy||!secure}/></label><p className="small-label">请使用 10–128 位密码或长口令，建议保存到密码管理器。暂不支持忘记密码找回，请妥善保存。</p></>}
    <label className="account-merge"><input type="checkbox" checked={mergeGuest} onChange={e=>setMergeGuest(e.target.checked)} disabled={busy}/><span>将此浏览器的游客学习记录合并到该账户</span></label>
    <p className="small-label">用户名不区分大小写。无需提供手机号或邮箱；云端仅保存账户和学习记录。</p>
    <Button type="submit" disabled={busy||!secure}>{busy?'正在处理…':mode==='register'?'注册并登录':'登录'}</Button>
    <Button type="button" variant="ghost" disabled={busy} onClick={()=>{setMode(mode==='login'?'register':'login');setError('');setPassword('');setConfirm('');}}>{mode==='login'?'没有账户？免费注册':'已有账户？去登录'}</Button>
   </form>}
   {error&&<p className="notice error" role="alert">{error}</p>}
  </DialogContent>
 </Dialog>;
}
