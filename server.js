const { count } = require('console');
const { response } = require('express');
const express = require('express');
const request = require('request');

const app = express();
const seeds = require('./seeds');
const chests = require('./chests');

app.use(express.static('public'));

app.set('view engine', 'ejs');

const API_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjcxMTY4MmUzLTg0N2YtNGU5My1hMWM5LTE4MmIzYWIyMzMxYyIsImlhdCI6MTY3MjUyNDAzNCwic3ViIjoiZGV2ZWxvcGVyL2Y4ZTk0YzYwLWQwNjItNTQ4YS1lNTJkLTM3ZDRiZTFhMDc5MSIsInNjb3BlcyI6WyJyb3lhbGUiXSwibGltaXRzIjpbeyJ0aWVyIjoiZGV2ZWxvcGVyL3NpbHZlciIsInR5cGUiOiJ0aHJvdHRsaW5nIn0seyJjaWRycyI6WyIxODcuMjExLjIwMC43IiwiNDUuNzkuMjE4Ljc5IiwiMTI4LjEyOC4xMjguMTI4Il0sInR5cGUiOiJjbGllbnQifV19.2xR8Qyr0J3CBzoRatEihWribfiD8HZ59kcfRcIJKqfjie-PU8QvZn2rq2DZ2y2bmdBLzDL0ioGfandXms6zgsA';

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
      const datosJugador = JSON.parse(body);
      const currentFavouriteCard = datosJugador.currentFavouriteCard.name;
      const currentDeck = datosJugador.currentDeck;
      
      // Aquí iría tu lógica para procesar los datos del jugador
      for(let seed in seeds){ //Itera el formato JSON el seed será el valor iterado, es decir, cuantas veces se iteró
        if(seeds[seed].name === currentFavouriteCard){
          url =  `https://cdn.statsroyale.com/images/characters/${seeds[seed].key}.jpg`;
              for (let i = 0; i < seeds.length; i++) {
                for (let j = 0; j < currentDeck.length; j++) {
                    if (seeds[i].name === currentDeck[j].name) {
                        entradas.push(`https://cdn.statsroyale.com/images/cards/full/${seeds[i].key}.png`);
                      }
                }
              }
        }
      }

      let dataUrl = {
        imgCards: entradas, 
        imgBanner: url
      }
      
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
            player: datosJugador
          });

/*           res.send({
            cofresPorVenir:  {chestUrlSorted, upcomingChests},
            url: dataUrl,
            player: datosJugador
          }); */
        }
      });
    }
  });
});

app.listen(3000, () => {
  console.log('Servidor iniciado en el puerto 3000');
});
