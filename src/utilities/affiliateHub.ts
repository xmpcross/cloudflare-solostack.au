// Site-scoped, atomic read cache maintained by affiliates.fxnstudio.com.
import {readFile} from 'node:fs/promises'
export async function affiliateHubCoupons():Promise<any[]>{
 const snapshot=JSON.parse(await readFile('/kspellman/sites/affiliates.fxnstudio.com/data/distribution/solostack.au.json','utf8'));
 if(snapshot.site!=='solostack.au'||!Array.isArray(snapshot.docs))throw new Error('Invalid affiliate hub snapshot');
 const now=Date.now();return snapshot.docs.filter((c:any)=>(!c.endsAt||Date.parse(c.endsAt)>now)&&(!c.startsAt||Date.parse(c.startsAt)<=now));
}
