const { count } = require('console');
const { response } = require('express');
const express = require('express');
const request = require('request');

const getImageColors = require('get-image-colors');

const app = express();
const seeds = require('./data/seeds');
const chests = require('./data/chests');
const arenas = require('./data/arenas');
const exp = require('./data/exp');

const hostClanOld = 'http://localhost:3000/clan?id=';
const hostUserOld = 'http://localhost:3000/search?playerId=';

//Para localhost:
const hostUser = 'http://localhost:3000/search?searchType=player&query='
const hostClan = 'http://localhost:3000/search?searchType=clanById&query=';
const home = 'http://localhost:3000/';

//Para dirección IP
/* const hostUser = ''
const hostClan = 'search?searchType=clanById&query=';
const home = ''; */

app.use(express.static('public'));

app.set('view engine', 'ejs');

const API_KEYOLD = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjcxMTY4MmUzLTg0N2YtNGU5My1hMWM5LTE4MmIzYWIyMzMxYyIsImlhdCI6MTY3MjUyNDAzNCwic3ViIjoiZGV2ZWxvcGVyL2Y4ZTk0YzYwLWQwNjItNTQ4YS1lNTJkLTM3ZDRiZTFhMDc5MSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIxODcuMjExLjIwMC43IiwiNDUuNzkuMjE4Ljc5IiwiMTI4LjEyOC4xMjguMTI4Il0sInR5cGUiOiJjbGllbnQifV19.2xR8Qyr0J3CBzoRatEihWribfiD8HZ59kcfRcIJKqfjie-PU8QvZn2rq2DZ2y2bmdBLzDL0ioGfandXms6zgsA';

const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImViMTE2NjNjLWRlOWUtNGQzZC05MjQyLWU5M2I1MThlM2M4ZiIsImlhdCI6MTcyMDkwMzQxNiwic3ViIjoiZGV2ZWxvcGVyL2Y4ZTk0YzYwLWQwNjItNTQ4YS1lNTJkLTM3ZDRiZTFhMDc5MSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIxODcuMjExLjIwNi4xNjgiXSwidHlwZSI6ImNsaWVudCJ9XX0.FxB_lTnWgohA2CjVITrtglkLtexzQ_a0Wb7MqjZ7r_F3QbUn-40BuYMoc7X0O-vqJM2o8pT_MpqtNDBFEBW6TA';

function getTimeDate(ml,s,min,hrs,day,week,month,year,data){
  //Para saber dependiendo los milisegundos tenemos esta lógica, pues si los milisegundos son menores a ... podemos saber si el tiempo ausente es de segundos o hasta meses.
  switch (true) {  //Creamos una condicional con switch
    case ml < 1000: //Dependiendo de los milisegundos vamos a clasificar el tiempo
      data.push(`Hace ${Math.floor(ml)} milisegundos`); //Hacemos un push a una variable vacía para recopilar la información. Recordar que el switch está dentro de una iteración por cada usuario.
      /* console.log(`Hace ${Math.floor(milisegundo)} milisegundos`); */
      break;
    case ml < 60000:
      data.push(`Hace ${Math.floor(s)} segundos`);
      /* console.log(`Hace ${Math.floor(segundo)} segundos`); */
      break;
    case ml < 3600000:
      data.push(`Hace ${Math.floor(min)} minutos`);
      /* console.log(`Hace ${Math.floor(minuto)} minutos`); */
      break;
    case ml < 86400000:
      data.push(`Hace ${Math.floor(hrs)} horas`);
      /* console.log(`Hace ${Math.floor(hora)} horas`); */
      break;
    case ml < 604800000:
      data.push(`Hace ${Math.floor(day)} días`);
      /* console.log(`Hace ${Math.floor(day)} días`); */
      break;
    case ml < 2592000000:
      data.push(`Hace ${Math.floor(week)} semanas`);
      /* console.log(`Hace ${Math.floor(week)} semanas`); */
      break;
    case ml < 31104000000:
      data.push(`Hace ${Math.floor(month)} meses`);
      /* console.log(`Hace ${Math.floor(month)} meses`); */
      break;
    default:
      data.push(`Hace ${Math.floor(year)} años`);
      /* console.log(`Hace ${Math.floor(year)} años`); */
  }        
}

app.get('/', (req, res) =>{
    res.render('index');
})

/* 187.211.200.7
45.79.218.79
128.128.128.128 */

app.get("/search", function(req, res) {
  // req.query = { searchType: 'clan', query: 'Perro' }
  const searchType = req.query.searchType; //El método a utilizar, sea buscar por clan id, clan o id de usuario
  const query = req.query.query; //El dato que se escribió en el buscador
  /* console.log(searchType) */

  if (searchType === "player") {
    const playerId = req.query.query;
    request(`https://api.clashroyale.com/v1/players/%23${playerId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    }, (error, response, body) => {
      if (response.statusCode !== 200) {
        console.error(`Error: ${response.statusCode}`);

        const regex = /^[028989PYLQGRCUV]+$/;
        if (regex.test(playerId)) {
          const h1 = '¡No encontramos el perfil!';

          const p = 'Este perfil no existe actualmente en nuestro sistema.';
          res.render('error.ejs', {h1, p, home});
          // El string cumple con el patrón
        } else {
          const h1 = 'ID proporcionado inválido';
          const p ='Has incluido caracteres no válidos en tu ID';
          res.render('error.ejs', {h1, p, home});

          // El string no cumple con el patrón
        }
      } else {
        let urlHero = [];
        let urlArena = [];
        let urlCurrentDeck = [];
        const datosJugador = JSON.parse(body); /* Todo el cuerpo (datos) del jugador buscado */
        const currentFavouriteCard = datosJugador.currentFavouriteCard.name; /* Nombre de la carta favorita recurrente del jugador */
        const currentDeck = datosJugador.currentDeck; /* Todas las cartas del mazo recurrente del jugador */
        const clanId = datosJugador.clan.tag.slice(1); /* Obtiene el tag del jugador sin el # */
  
        /* console.log(clanId); */
  
        for(let arena in arenas){ /* En la base de datos de arena va a iterar cada uno */
          if(arenas[arena].name === datosJugador.arena.name){ /* Si el nombre de la primer arena coincide con el nombre de la arena del jugador entonces... */
  /*           console.log(arenas[arena].url); */
            urlArena.push(arenas[arena].url);/* Agregamos la url específica al array. que coincidió para luego ser utilizada */
          }
        }
        
        for(let seed in seeds){ //Itera el formato JSON el seed será el valor iterado, es decir, cuantas veces se iteró
          if(seeds[seed].name === currentFavouriteCard){ //En la base de datos de la seeds, busca el name y comparalo con el nombre de la carta favorita recurrente del jugador
            urlHero =  `https://cdn.statsroyale.com/images/characters/${seeds[seed].key}.jpg`; /* Al coincidir, obtendremos la key para agregarla a la url */
                for (let i = 0; i < seeds.length; i++) {
                  for (let j = 0; j < currentDeck.length; j++) {
                      if (seeds[i].name === currentDeck[j].name) { //Itera todas la veces el nombre de todas las cartas del juego y si el nombre conincide con el de la carta del mazo (Itera todas las cartas del mazo del jugador que son 8)entonces...
                        //Primero va ir iterando el mazo (currenDeck[j].name) y luego va ir iterando las cartas totales del juego (Seeds[i].name)
                          urlCurrentDeck.push(`https://cdn.statsroyale.com/images/cards/full/${seeds[i].key}.png`);// Agrega las 8 url de las imágenes de las cartas del mazo
                        }
                  }
                }
          }
        }
  
        let dataUrl = { //Agrega la información a una variable valor objeto para después ser utilizada en las plantillas ejs.
          imgCards: urlCurrentDeck, 
          imgBanner: urlHero,
          imgArena: urlArena
        }
  
        /* EXP ----------------------------------------------------------------------------------------------------------------------------------- */
        let maxXp = 0; // Nivel máximo de XP
  
  /*       Comparación de xp para poder saber el la experiencia máxima dependiendo su nivel */
        const userLevel = datosJugador.expLevel; //Nivel del jugador
        for(let e in exp){ //Iteración para coincidir con el mismo nivel
          if(userLevel == exp[e].name){
              maxXp = exp[e].exp_to_next_level; //Cambiando el valor máximo del xp
          }
        }
  
        const currentXp = datosJugador.expPoints; // XP actual
      
        const widthProgress = ((currentXp / maxXp) * 100).toFixed(2) + '%'; //El progreso de la xp en porcentaje
  
        const dataExp = {
            width: widthProgress, //Progreso de la xp en porcentaje
            user: userLevel, //Nivel del jugador
            max: maxXp //Nivel Máximo
        }
  
        /* Cofres -------------------------------------------------------------------------------------------------------------------------------------------- */      
        request(`https://api.clashroyale.com/v1/players/%23${playerId}/upcomingchests`, { //Obtener los cofres siguientes
          headers: {
            Authorization: `Bearer ${API_KEY}`
          }
        }, (error, response, body) => {
          if (error) {
            console.error(error);
          } else {
            const urlChest = []; //Una lista de los url y el valor de los index de los cofres por venir (Esto después de hacerle el push)
            const upcomingChests = JSON.parse(body);
  
            for (let i = 0; i < chests.length; i++) { /* Itera todos los cofres del juego (Obtenidos en partidas ganadas)*/
              for (let j = 0; j < upcomingChests.items.length; j++) { //Itera todos los cofres por venir que muestra el body de la petición
                  if (chests[i].name === upcomingChests.items[j].name) {// Si coinciden los nombres...
  /*                     urlChest.push(chests[i].url); */
                      urlChest.push({url: chests[i].url, index: upcomingChests.items[j].index}); /* Inyecta la información a la variable urlChest para almacenarla */
                    }
              }
            }

  
            //Reordenar todo la información de los cofres, la url y el id
            let filterArray = urlChest.filter(item => typeof item === 'object' && //Filtrar el array para mantener los objetos con propiedad "index"
            item.hasOwnProperty('index'));
            let sortedArray = filterArray.sort((a, b) => a.index - b.index);//Ordena de menor a mayor las propiedades del index
            let chestUrlSorted = sortedArray.map(item => item.url); //Solo muestra las url ya en ese orden
  
            request(`https://api.clashroyale.com/v1/clans/%23${clanId}`,{ //Clan id lastSeen-------------------------------------------------------------
              headers: {
                Authorization: `Bearer ${API_KEY}`
              }
            }, (error, response, body) => {
              if (error) {
                console.error(error);
              } else {
                  const datosClan = JSON.parse(body);
                  const idClan = datosClan.memberList;
                  const lastTime = [];
  
                  for(let id in idClan){
                    if(idClan[id].tag === datosJugador.tag){
                      let str = idClan[id].lastSeen; //El valor será cada un (Última conexión) por cada uno
                      const arr = []; //Todo esto es para modivicar el valor de la última conexión para que sea válido
                      const pattern = [4, 2, 5, 2, 2, 5];
              
                      let i = 0;
                      for (const size of pattern) {
                        arr.push(str.slice(i, i + size));
                        i += size;
                      }
                      str = (`${arr[0]}-${arr[1]}-${arr[2]}:${arr[3]}:${arr[4]}${arr[5]}`);
                      /* console.log(str); */
  
                      //Ojo, que volvimos a repetir código. Pero no encontré otra manera de simplificar el código, ya será en otra ocasión
                      let lastSeen = new Date(str);
                      let currentTime = new Date();
            
                      let milisegundo = (currentTime.getTime() - lastSeen.getTime());
                      let segundo = (currentTime.getTime() - lastSeen.getTime()) / 1000;
                      let minuto = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60);
                      let hora = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60); 
                      let day = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24); 
                      let week = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 7); 
                      let month = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 30.4167); 
                      let year = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 7 * 52); 
                      getTimeDate(milisegundo, segundo, minuto, hora, day, week, month, year, lastTime);
                    }
                  }
                  /* console.log(lastTime[0]); */
                  // Aquí se envía la respuesta con los datos del jugador y los cofres por venir
                  res.render('player.ejs',{
                    cofresPorVenir: {chestUrlSorted, upcomingChests},
                    url: dataUrl,
                    player: datosJugador,
                    exp: { dataExp },
                    hostClan, 
                    lastTime
                  });
              }
            });
          }
        });
      }
    });
  } else if (searchType === "clan") {
    const clanName = req.query.query;
    request(`https://api.clashroyale.com/v1/clans?name=${clanName}`,{
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    }, (error, response, body) => {
      if (error){
        console.error(error);
      } else{
        const searchClan = JSON.parse(body);
        /* console.log(searchClan); */
        res.render('searchClan.ejs', {query, searchClan, hostClan});
      }
    })
  } else if (searchType === "clanById") {
    const clanId = req.query.query;
    request(`https://api.clashroyale.com/v1/clans/%23${clanId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    }, (error, response, body) => {
      if (response.statusCode !== 200) {
        console.error(`Error: ${response.statusCode}`);

        const regex = /^[028989PYLQGRCUV]+$/;
        if (regex.test(clanId)) {
          const h1 = '¡No encontramos el perfil!';

          const p = 'Este perfil no existe actualmente en nuestro sistema.';
          res.render('error.ejs', {h1, p, home});
          // El string cumple con el patrón
        } else {
          const h1 = 'ID proporcionado inválido';
          const p ='Has incluido caracteres no válidos en tu ID';
          res.render('error.ejs', {h1, p, home});

          // El string no cumple con el patrón
        }
      } else {
        const datosClan = JSON.parse(body);
        const idClanBadges = datosClan.badgeId;
       /*  console.log(idClanBadges); */
        let rgb;
        
        getImageColors(`https://cdn.statsroyale.com/images/badges/${idClanBadges}.png`).then(colors => {
          primaryColor = colors[0];
          const r = primaryColor._rgb[0];
          const g = primaryColor._rgb[1];
          const b = primaryColor._rgb[2];
        
          rgb = {
            red: r, 
            green: g,
            blue: b
          }
  
  
          const memberList = datosClan.memberList;
          const listMod = []; //Lista de la última conexión de los jugadores. Sin validacion en el formato
          const listOk = []; //Lista de la última conexión de los jugadores pero la que tiene validación
          let times = []; //Lista original con el tiempo en vivo sobre la última conexión de los jugadores
  
          for(let user in memberList){ //Iteración de la última conexión de todos los jugadores
            listMod.push(memberList[user].lastSeen); //Agregamos a la lista la última conexión de todos los jugadores (Sin validacion en el formato)
          }
  
          for(let list in listMod){ //Iteramos esa lista nueva que creamos
            const str = listMod[list] //El valor será cada un (Última conexión) por cada uno
            const arr = []; //Todo esto es para modivicar el valor de la última conexión para que sea válido
            const pattern = [4, 2, 5, 2, 2, 5];
    
            let i = 0;
            for (const size of pattern) {
              arr.push(str.slice(i, i + size));
              i += size;
            }
            /* console.log(`${arr[0]}-${arr[1]}-${arr[2]}:${arr[3]}:${arr[4]}${arr[5]}`); */
            listOk.push(`${arr[0]}-${arr[1]}-${arr[2]}:${arr[3]}:${arr[4]}${arr[5]}`); // Finalmente lo hacemos válido y hacemos push para agregarlo al array. Con esto todos tienen un valor único de cada usuario de su última conexión
          }
  
          for(let list in listOk){ //Esta iteración, es para iterar cada uno de los usuarios con el date valido
            let lastSeen = new Date(listOk[list]); //Aquí lo transformamos, recuerda, a cada uno de ellos
            let currentTime = new Date(); //Obtenemos la fecha y la hora exacta actualmente para poder comparar el tiempo de la última conexión
  
            //Sacamos la diferencia entre el tiempo en milisegundos, la cual podemos comparar con el tiempo actual y así sacar una diferencia
            //Entre milisegundos, segundos, minutos, horas, días, semanas, meses o hasta años
            let milisegundo = (currentTime.getTime() - lastSeen.getTime()); // diferencia en milisegundos
            let segundo = (currentTime.getTime() - lastSeen.getTime()) / 1000; // diferencia en segundos
            let minuto = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60); //Diferencia en minutos
            let hora = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60); //Diferencia en horas
            let day = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24); //Diferencia en días
            let week = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 7); //Diferencia en semanas
            let month = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 30.4167); //Diferencia en meses
            let year = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 7 * 52); //Diferencia en años
            getTimeDate(milisegundo, segundo, minuto, hora, day, week, month, year, times);
          }
          res.render('clan.ejs', { clan: {datosClan}, color: rgb, hostUser, times });
  /*         res.send({ clan: {datosClan}, color: rgb }); */
        });
      }
    });
  } else {
      res.send("Tipo de búsqueda no válido");
  }
});

app.get('/clan', (req, res) =>{ //Este código no hace falta
  const clanId = req.query.id;
  request(`https://api.clashroyale.com/v1/clans/%23${clanId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  }, (error, response, body) => {
    if (error) {
      console.error(error);
    } else {
      const datosClan = JSON.parse(body);
      const idClanBadges = datosClan.badgeId;
     /*  console.log(idClanBadges); */
      let rgb;
      
      getImageColors(`https://cdn.statsroyale.com/images/badges/${idClanBadges}.png`).then(colors => {
        primaryColor = colors[0];
        const r = primaryColor._rgb[0];
        const g = primaryColor._rgb[1];
        const b = primaryColor._rgb[2];
      
        rgb = {
          red: r, 
          green: g,
          blue: b
        }


        const lastSeenClan = datosClan.memberList;
        const listMod = []; //Lista de la última conexión de los jugadores. Sin validacion en el formato
        const listOk = []; //Lista de la última conexión de los jugadores pero la que tiene validación
        let times = []; //Lista original con el tiempo en vivo sobre la última conexión de los jugadores

        for(let last in lastSeenClan){ //Iteración de la última conexión de todos los jugadores
          listMod.push(lastSeenClan[last].lastSeen); //Agregamos a la lista la última conexión de todos los jugadores (Sin validacion en el formato)
        }

        for(let list in listMod){ //Iteramos esa lista nueva que creamos
          const str = listMod[list] //El valor será cada un (Última conexión) por cada uno
          const arr = []; //Todo esto es para modivicar el valor de la última conexión para que sea válido
          const pattern = [4, 2, 5, 2, 2, 5];
  
          let i = 0;
          for (const size of pattern) {
            arr.push(str.slice(i, i + size));
            i += size;
          }
          /* console.log(`${arr[0]}-${arr[1]}-${arr[2]}:${arr[3]}:${arr[4]}${arr[5]}`); */
          listOk.push(`${arr[0]}-${arr[1]}-${arr[2]}:${arr[3]}:${arr[4]}${arr[5]}`); // Finalmente lo hacemos válido y hacemos push para agregarlo al array. Con esto todos tienen un valor único de cada usuario de su última conexión
        }

        for(let list in listOk){ //Esta iteración, es para iterar cada uno de los usuarios con el date valido
          let lastSeen = new Date(listOk[list]); //Aquí lo transformamos, recuerda, a cada uno de ellos
          let currentTime = new Date(); //Obtenemos la fecha y la hora exacta actualmente para poder comparar el tiempo de la última conexión

          //Sacamos la diferencia entre el tiempo en milisegundos, la cual podemos comparar con el tiempo actual y así sacar una diferencia
          //Entre milisegundos, segundos, minutos, horas, días, semanas, meses o hasta años
          let milisegundo = (currentTime.getTime() - lastSeen.getTime()); // diferencia en milisegundos
          let segundo = (currentTime.getTime() - lastSeen.getTime()) / 1000; // diferencia en segundos
          let minuto = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60); //Diferencia en minutos
          let hora = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60); //Diferencia en horas
          let day = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24); //Diferencia en días
          let week = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 7); //Diferencia en semanas
          let month = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 30.4167); //Diferencia en meses
          let year = (currentTime.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24 * 7 * 52); //Diferencia en años
          getTimeDate(milisegundo, segundo, minuto, hora, day, week, month, year, times);
        }
        res.render('clan.ejs', { clan: {datosClan}, color: rgb, hostUser, times });
/*         res.send({ clan: {datosClan}, color: rgb }); */
      });
    }
  });
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});