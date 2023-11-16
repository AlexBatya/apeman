import path from 'path';
import fs from 'fs';
import color from 'colors';

import axios from 'axios';
import { rimraf } from 'rimraf';

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

    async createFolder(){ 
        return new Promise(async (res: any) => {
            await zl.archiveFolder(this.dirLink, this.fileZip)
            res()
        })
    }
    async createFile(){ 
        return new Promise(async (res: any) => {
            await zl.archiveFile(this.dirLink, this.fileZip)
            res()
        })
    }

};

export function createPattern(name: string){
    return new Promise(async (res: any) => {
        const dir = './'

        const zip = new Zipping();


        if(fs.lstatSync(path.basename(dir + name)).isFile()){
            zip.dirLink = path.basename(dir + name) 
            zip.fileZip = dir + name + '.zip';
            await zip.createFile();
        }
        else{
            zip.dirLink = path.basename(dir + name, path.extname(dir + name)) 
            zip.fileZip = dir + name + '.zip';
            await zip.createFolder();
        }


        const readStream = fs.createReadStream(zip.fileZip);
        const chunks: any[] = [];
        readStream.on('data', chunk => chunks.push(chunk))
        readStream.on('end', async () => {
            const data: data = {
                name: path.basename(dir + name, path.extname(dir + name)),
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


        await zip.createFolder();


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

const deleteFolderRecursive = function (directoryPath: string) {
    return new Promise((res: any) => {
        if(directoryPath != '/'){
            if (fs.existsSync(directoryPath)) {
                fs.readdirSync(directoryPath).forEach((file, index) => {
                    const curPath = path.join(directoryPath, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                    // recurse
                    deleteFolderRecursive(curPath);
                    } else {
                    // delete file
                    fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(directoryPath);
                res()
            }
        }
    })
};

function moveFile(dir: string, name: string, customName: string){
    return new Promise(async (res: any) => {
        const reqular = /(.*)\.[^.]+$/;

        const link: any = path.join(dir, reg(customName, reqular));  
        const files: any = fs.readdirSync(link).map(elem => {
            if(fs.lstatSync(path.join(dir, reg(customName, reqular), elem))){
                return {
                    key: true,
                    file: elem
                }
            }
        }) 
        if(files.length == 1){
            const readStream = fs.createReadStream(path.join(dir, reg(customName, reqular), files[0].file))
            const writeStream = fs.createWriteStream(path.join(dir, customName))
            readStream.on('data', (chunk) => {
                writeStream.write(chunk)
            })
            readStream.on('end', () => {
                res()
            })
        }
        else{
            res()
        }
    })
}

function reg(str: string, regular: any){
    const filterr: any = new RegExp(regular)
    const array: any[] = str.split(filterr)
    const arrayOne: any = array.filter(elem => elem != "");
    const ret: string = arrayOne[0];
    return ret
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

            const reqular = /(.*)\.[^.]+$/;
            await zl.extract(path.join(dir, 'downloadArchiv.zip'), reg(customName, reqular))

            await moveFile(dir, name, customName)

            
            deleteFolderRecursive(path.join(dir, reg(customName, reqular)))
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