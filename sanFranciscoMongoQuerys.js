'use strict';

const lanzarQuery1 = async (evt, callback) => {
    return new Promise((res, rej) => {
        let query1 = db.sacramento.aggregate([{
            // Realizamos una agrupacion por el codigo nacional de crimenes
            // https://www.corragroup.com/NCIC-codes.html
            // 2302	Purse Snatching-No Force
            "$group": {
                _id: "$ucr_ncic_code",
                count: {
                    $sum: 1
                }
            }
        }]).toArray();
        res(query1);
    });
    
}

const lanzarQuery2 = async (evt, callback) => {
    return new Promise((res, rej)=> {
        let query2 = db.sacramento.aggregate([
            {
                // Establecemos una expresion regular de busqeuda sobre el primer valor numerico de la hora
                 // 1/1/1 09:30 -> 1/1/1 [09]:30 -> extrae 09
                $set: {
                    
                    hour: { $regexFind:{
                            input: "$cdatetime",
                            regex: /\d{1,2}(?=:)/
                        }
                    }
                }
            },
            // Agrupamos por cada match sobre la expresion regular y conteamos +1
            {
                $group:{
                    _id : "$hour.match",
                    count: {$sum: 1}
                }
            },
            // Proyectamos, borrando el campo _id, estableciendo el id por la hora, y cambiado count por total_crimes
            {
                $project:{
                    _id:0,
                    "hour":"$_id",
                    "total_crimes":"$count"
                }
            },
            // Ordenamos de mayor a menor
            {
                $sort:{total_crimes:-1}
            }
        ]).toArray();
        res(query2);
    });
}


lanzarQuery1().then((response) => {
    print("Solution Query 1");
    printjson(response);
});

lanzarQuery2().then((response) => {
    print("Solution Query 2");
    printjson(response);
});



// // Prevent mongo shell disconection until Promises are resolved
sleep(9000);

