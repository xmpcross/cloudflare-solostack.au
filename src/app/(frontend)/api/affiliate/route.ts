// Management API retired after central affiliate-hub migration.
const moved=()=>Response.json({message:'Affiliate management moved to https://affiliates.fxnstudio.com/admin',url:'https://affiliates.fxnstudio.com/admin'},{status:410})
export const GET=moved
export const POST=moved
