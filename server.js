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

const hostClan = 'http://localhost:3000/clan?id=';
const hostUser = 'http://localhost:3000/search?playerId='

app.use(express.static('public'));

app.set('view engine', 'ejs');

const API_KEYOLD = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjcxMTY4MmUzLTg0N2YtNGU5My1hMWM5LTE4MmIzYWIyMzMxYyIsImlhdCI6MTY3MjUyNDAzNCwic3ViIjoiZGV2ZWxvcGVyL2Y4ZTk0YzYwLWQwNjItNTQ4YS1lNTJkLTM3ZDRiZTFhMDc5MSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIxODcuMjExLjIwMC43IiwiNDUuNzkuMjE4Ljc5IiwiMTI4LjEyOC4xMjguMTI4Il0sInR5cGUiOiJjbGllbnQifV19.2xR8Qyr0J3CBzoRatEihWribfiD8HZ59kcfRcIJKqfjie-PU8QvZn2rq2DZ2y2bmdBLzDL0ioGfandXms6zgsA';

const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6ImJmNTYwMTNhLWZjZmYtNGFiZi05OGI4LTNjMTNkMDIxMGU5ZiIsImlhdCI6MTY3Mjc4MDYwMiwic3ViIjoiZGV2ZWxvcGVyL2Y4ZTk0YzYwLWQwNjItNTQ4YS1lNTJkLTM3ZDRiZTFhMDc5MSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIxODcuMjExLjE5NC42MiJdLCJ0eXBlIjoiY2xpZW50In1dfQ.k7u0ZANYbusrhkiI9LhxWzSrbmNlUJY3MUmL1oMQ7F7gUxsR3NPvaDcqvdFv7pN0Suw61yd_2XDJPKMNovlrOg';

app.get('/', (req, res) =>{
    res.render('index');
})

app.get('/search', (req, res) => {
  const playerId = req.query.playerId;

  request(`https://api.clashroyale.com/v1/players/%23${playerId}`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`
    }
  }, (error, response, body) => {
    if (error) {
      console.error(error);
    } else {
      let urlHero = [];
      let urlArena = [];
      let urlCurrentDeck = [];
      const datosJugador = JSON.parse(body);
      const currentFavouriteCard = datosJugador.currentFavouriteCard.name;
      const currentDeck = datosJugador.currentDeck;

      for(let arena in arenas){
        if(arenas[arena].name === datosJugador.arena.name){
/*           console.log(arenas[arena].url); */
          urlArena.push(arenas[arena].url);
        }
      }
      
      // Aquí iría tu lógica para procesar los datos del jugador
      for(let seed in seeds){ //Itera el formato JSON el seed será el valor iterado, es decir, cuantas veces se iteró
        if(seeds[seed].name === currentFavouriteCard){
          urlHero =  `https://cdn.statsroyale.com/images/characters/${seeds[seed].key}.jpg`;
              for (let i = 0; i < seeds.length; i++) {
                for (let j = 0; j < currentDeck.length; j++) {
                    if (seeds[i].name === currentDeck[j].name) {
                        urlCurrentDeck.push(`https://cdn.statsroyale.com/images/cards/full/${seeds[i].key}.png`);
                      }
                }
              }
        }
      }

      let dataUrl = {
        imgCards: urlCurrentDeck, 
        imgBanner: urlHero,
        imgArena: urlArena
      }

      /* EXP */
      let maxXp = 0; // Nivel máximo de XP

/*       Comparación de xp para poder saber el la experiencia máxima dependiendo su nivel */
      const userLevel = datosJugador.expLevel; //Nivel del jugador
      for(let e in exp){ //Iteración para coincidir con el mismo nivel
        if(userLevel == exp[e].name){
            maxXp = exp[e].exp_to_next_level; //Cambiando el valor máximo del xp
        }
      }

      const currentXp = datosJugador.expPoints; // XP actual
    
      const widthProgress = ((currentXp / maxXp) * 100).toFixed(2) + '%';

      const dataExp = {
          width: widthProgress,
          user: userLevel,
          max: maxXp
      }

      /* Cofres */      
      request(`https://api.clashroyale.com/v1/players/%23${playerId}/upcomingchests`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      }, (error, response, body) => {
        if (error) {
          console.error(error);
        } else {
          const urlChest = [];
          const upcomingChests = JSON.parse(body);

          for (let i = 0; i < chests.length; i++) {
            for (let j = 0; j < upcomingChests.items.length; j++) {
                if (chests[i].name === upcomingChests.items[j].name) {
/*                     urlChest.push(chests[i].url); */
                    urlChest.push({url: chests[i].url, index: upcomingChests.items[j].index});
                  }
            }
          }

          let filterArray = urlChest.filter(item => typeof item === 'object' && //Filtrar el array para mantener los objetos con propiedad "index"
          item.hasOwnProperty('index'));
          let sortedArray = filterArray.sort((a, b) => a.index - b.index);
          let chestUrlSorted = sortedArray.map(item => item.url);

          // Aquí se envía la respuesta con los datos del jugador y los cofres por venir
          res.render('data.ejs',{
            cofresPorVenir: {chestUrlSorted, upcomingChests},
            url: dataUrl,
            player: datosJugador,
            exp: { dataExp },
            hostClan
          });

/*           res.send({
            cofresPorVenir:  {chestUrlSorted, upcomingChests},
            url: dataUrl,
            player: datosJugador,
            exp: { dataExp } 
          }); */
        }
      });
    }
  });
});

app.get('/clan', (req, res) =>{
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


        console.log(listOk);

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
          /* console.log(milisegundo); */

          //Para saber dependiendo los milisegundos tenemos esta lógica, pues si los milisegundos son menores a ... podemos saber si el tiempo ausente es de segundos o hasta meses.
          switch (true) {  //Creamos una condicional con switch
            case milisegundo < 1000: //Dependiendo de los milisegundos vamos a clasificar el tiempo
              times.push(`Hace ${Math.floor(milisegundo)} milisegundos`); //Hacemos un push a una variable vacía para recopilar la información. Recordar que el switch está dentro de una iteración por cada usuario.
              console.log(`Hace ${Math.floor(milisegundo)} milisegundos`);
              break;
            case milisegundo < 60000:
              times.push(`Hace ${Math.floor(segundo)} segundos`);
              console.log(`Hace ${Math.floor(segundo)} segundos`);
              break;
            case milisegundo < 3600000:
              times.push(`Hace ${Math.floor(minuto)} minutos`);
              console.log(`Hace ${Math.floor(minuto)} minutos`);
              break;
            case milisegundo < 86400000:
              times.push(`Hace ${Math.floor(hora)} horas`);
              console.log(`Hace ${Math.floor(hora)} horas`);
              break;
            case milisegundo < 604800000:
              times.push(`Hace ${Math.floor(day)} días`);
              console.log(`Hace ${Math.floor(day)} días`);
              break;
            case milisegundo < 2592000000:
              times.push(`Hace ${Math.floor(week)} semanas`);
              console.log(`Hace ${Math.floor(week)} semanas`);
              break;
            case milisegundo < 31104000000:
              times.push(`Hace ${Math.floor(month)} meses`);
              console.log(`Hace ${Math.floor(month)} meses`);
              break;
            default:
              times.push(`Hace ${Math.floor(year)} años`);
              console.log(`Hace ${Math.floor(year)} años`);
          }        
        }
        /* console.log(rgb); */
        console.log(times);
      
        res.render('clan.ejs', { clan: {datosClan}, color: rgb, hostUser, times });
/*         res.send({ clan: {datosClan}, color: rgb }); */
      });
    }
  });
  
})
app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});


/* switch (clan.datosClan.memberList[i].role) {
  case 'coLeader':
    Colíder
    break;

  case 'leader':
    Líder
    break;
    
  case 'elder':
    Veterano
    break;
  
  case 'member':
    Miembro
    break;
}

<p> <%= clan.datosClan.memberList[i].role %> </p> */