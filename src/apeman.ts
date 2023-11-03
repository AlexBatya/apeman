import path from 'path';
import fs from 'fs';
import color from 'colors';
import {deletePattern, createPattern, downloadPatter, updatePattern, checkAllPatter, checkPatter} from './axios';

(async () => {
    if(process.argv.includes('--download') || process.argv.includes('-d')){
        const req: any = await downloadPatter(process.argv[2], process.argv[3]);
        console.log(req);
    }
    if(process.argv.includes('--upload') || process.argv.includes('-u')){
        const req: any = await createPattern(process.argv[2]);
        console.log(req);
    }
    if(process.argv.includes('--remove') || process.argv.includes('-r')){
        const req: any = await deletePattern(process.argv[2]);
        console.log(req)
    }
    if(process.argv.includes('--update') || process.argv.includes('-e')){
        const req: any = await updatePattern(process.argv[2]);
        console.log(req);
    }
    if(process.argv.includes('--check') || process.argv.includes('-c')){
        const req: any = await checkPatter(process.argv[2]);
        console.log(req);
    }
    if(process.argv.includes('--checkAll') || process.argv.includes('-a')){
        const req: any = await checkAllPatter();
        for(let elem of req){
            console.log(elem);
        }
        console.log("Колличество пакетов в базе: " + req.length)
    }
    if(process.argv.includes('--help') || process.argv.includes('-h')){
        console.log(`Использование apeman [-a] [-r] [-d] [-r] [-c] [-e] [-u]/n
                     [<папка> -u, -d, -r]\n\n
Парраметры: \n
  -h --help          Инструкция\n
  -u --upload        Загрузить новый паттерн: apeman <папка> -u\n
  -d --download      Скачать паттерн: apeman <папка> -d\n
  -e --update        Обновить паттерн на сервере: apeman <папка> -e\n
  -r --remove        Удалить паттерн: apeman <папка> -r\n
  -c --check         Проверить есть ли такой паттерн: apeman <папка> -c\n
  -a --checkAll      Посмотреть все паттерны на сервере: apeman -a\n
Примеры: /n
  apeman <pattern из библиотеки> <кастомное название> -d
  `)
    }
})();