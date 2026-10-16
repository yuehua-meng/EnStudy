import parsePhoneNumber,{getCountries,getCountryCallingCode,type CountryCode} from 'libphonenumber-js/min';

// Use possible lengths, not strict carrier-prefix or phone-type checks.
// Format validation does not establish ownership; that needs SMS verification.
export const PHONE_HINT='请检查国家／地区和手机号，也可直接输入 +国际区号开头的号码';
export type PhoneCountry=CountryCode;
export function normalizePhone(value:string,country:PhoneCountry='CN'):string|null{
 const input=value.normalize('NFKC').trim().replace(/^00/,'+');
 if(input.length>64||!/^\+?[0-9 ().-]+$/.test(input))return null;
 const phone=parsePhoneNumber(input,{defaultCountry:country,extract:false});
 return phone?.isPossible()&&!phone.ext&&!phone.isNonGeographic()&&/^\+[1-9][0-9]{1,14}$/.test(phone.number)?phone.number:null;
}
export function phoneCountries(){
 const names=typeof Intl.DisplayNames==='function'?new Intl.DisplayNames(['zh-CN'],{type:'region'}):null;
 const common:CountryCode[]=['CN','HK','TW','US','CA','GB','AU','SG','JP','KR'];
 const all=getCountries().sort((a,b)=>(names?.of(a)||a).localeCompare(names?.of(b)||b,'zh-CN'));
 return [...common,...all.filter(country=>!common.includes(country))].map(country=>({country,label:`${names?.of(country)||country} +${getCountryCallingCode(country)}`}));
}
export function accountLabel(value:string){
 const number=normalizePhone(value);
 if(!number)return value;
 const phone=parsePhoneNumber(number)!;
 const national=phone.nationalNumber;
 return `+${phone.countryCallingCode} ${national.slice(0,Math.min(3,national.length-4))}****${national.slice(-4)}`;
}
