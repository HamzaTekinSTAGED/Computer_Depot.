import {  NextResponse } from 'next/server';
import { createConnection } from "../../../../lib/db";

export async function GET() {
    try{
      const db = await createConnection();
      const sql = "SELECT * from instructor" ;
      const [instructor] = await db.query(sql);
      
      return NextResponse.json(instructor,{status:200});
    }catch(error){
      console.log("DATABASE ERROR",error)
      return NextResponse.json({error:"Interval server error"},{status:500});
    }
  }