import path from 'path';
import fs from 'fs';
import color from 'colors';

import axios from 'axios';

const zl = require('zip-lib');

const urlAll = 'http://localhost:3000';
const token = 'asfsadfsh239412934sdkafasdcxvxkjlAKsdfcxaldfjd'

interface data {
    name: string,
    object?: any
}

const axiosConfigPOST = (elem: any, url: string) => {
    return {
        method: 'POST',
        url: urlAll + url, 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token 
        },
        data: JSON.stringify(elem)
    }
};

const axiosConfigGET = (url: string) => {
    return {
        method: 'GET',
        url: urlAll + url, 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token 
        },
    }
};

const axiosConfigDELETE = (elem: any, url: any) => {
    return {
        method: 'DELETE',
        url: urlAll + url, 
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token 
        },
        data: JSON.stringify(elem)
    }
};

class Zipping{
    dirLink: any = null; 
    fileZip: any = null;

    async create(){ 
        return new Promise(async (res: any) => {
            await zl.archiveFolder(this.dirLink, this.fileZip)
            res()
        })
    }

};

export function createPattern(name: string){
    return new Promise(async (res: any) => {
        const dir = './'

        const zip = new Zipping();
        zip.dirLink = path.basename(dir + name, path.extname(dir + name)) 
        zip.fileZip = dir + name + '.zip';


        await zip.create();


        const readStream = fs.createReadStream(zip.fileZip);
        const chunks: any[] = [];
        readStream.on('data', chunk => chunks.push(chunk))
        readStream.on('end', async () => {
            const data: data = {
                name: name,
                object: Buffer.concat(chunks)
            } 

            const reqData = await axios(axiosConfigPOST(data, '/api/patterns/add'))
            fs.unlinkSync(zip.fileZip)
            res(reqData.data);
        })
    })
    
}

export function updatePattern(name: string){
    return new Promise(async (res: any) => {
        const dir = './'

        const zip = new Zipping();
        zip.dirLink = dir + name 
        zip.fileZip = dir + name + '.zip';


        await zip.create();


        const readStream = fs.createReadStream(zip.fileZip);
        const chunks: any[] = [];
        readStream.on('data', chunk => chunks.push(chunk))
        readStream.on('end', async () => {
            const data: data = {
                name: name,
                object: Buffer.concat(chunks)
            } 

            const reqData = await axios(axiosConfigPOST(data, '/api/patterns/update'))
            fs.unlinkSync(zip.fileZip)
            res(reqData.data);
        })
    })
    
}

export async function deletePattern(name: string){
    return new Promise( async (res: any) => {
        const data: data = {
            name: name
        }
        const reqData = await axios(axiosConfigDELETE(data, '/api/patterns/delete'))
        res(reqData.data)
    })
    
}

export async function downloadPatter(name: string, customName: string){
    return new Promise(async (res: any) => { 
        const dir = process.cwd(); 

        const data = {
            name: name
        }


        const reqData = await axios(axiosConfigPOST(data, '/api/patterns/download'))

        if(reqData.data.status == 200){
            await new Promise((res: any) => {
                const writeStream = fs.createWriteStream(path.join(dir, 'downloadArchiv.zip'));
                writeStream.write(Buffer.from(reqData.data.archiv))
                res()
            })

            await zl.extract(path.join(dir, 'downloadArchiv.zip'), path.resolve(dir, customName))
            fs.unlinkSync(path.join(dir, 'downloadArchiv.zip'))
            res(reqData.data.answer)
        }
        else{
            res(reqData.data)
        }

        
    })
        
}

export async function checkPatter(name: string){
    return new Promise(async (res: any) => {

        const data: data = {
            name: name
        }

        const reqData = await axios(axiosConfigPOST(data, '/api/patterns/check'))
        res(reqData.data)
    })
}
export async function checkAllPatter(){
    return new Promise(async (res: any) => {

        const reqData = await axios(axiosConfigGET('/api/patterns/checkAll'))
        res(reqData.data)
    })
}