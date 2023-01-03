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

      let datosJugadorProcesados = {
        currentFavouriteCard: currentFavouriteCard,
        currentDeck: currentDeck
      }

      console.log(datosJugador);
      
      request(`https://api.clashroyale.com/v1/players/%23${playerId}/upcomingchests`, {
        headers: {
          Authorization: `Bearer ${API_KEY}`
        }
      }, (error, response, body) => {
        if (error) {
          console.error(error);
        } else {
          const upcomingChests = JSON.parse(body);
          
          // Aquí iría tu lógica para procesar los cofres por venir

          let cofresProcesados = {
            upcomingChests: upcomingChests
          }

          // Aquí se envía la respuesta con los datos del jugador y los cofres por venir
          res.send({
            datosJugador: datosJugadorProcesados,
            cofresPorVenir: cofresProcesados
          });
        }
      });
    }
  });
});


/* app.get('/search', (req, res) => {
    const playerId = req.query.playerId;

    request(`https://api.clashroyale.com/v1/players/%23${playerId}`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`
      }
    }, (error, response, body) => {
      if (error) {
        console.error(error);
      } else {
            let url = null;
            const datosJugador = JSON.parse(body);
            const currentFavouriteCard = datosJugador.currentFavouriteCard.name;
            const currentDeck = datosJugador.currentDeck;
            console.log(currentFavouriteCard);
            for(let seed in seeds){ //Itera el formato JSON el seed será el valor iterado, es decir, cuantas veces se iteró
                if(seeds[seed].name === currentFavouriteCard){
                    url =  `https://cdn.statsroyale.com/images/cards/full/${seeds[seed].key}.png`; //Eso me permite saber en qué posición cumple la condición.
                    url =  `https://cdn.statsroyale.com/images/characters/${seeds[seed].key}.jpg`;
                    console.log(seeds[seed].key);
                    console.log(url);

                    let entradas = [];
                    
                    for (let i = 0; i < seeds.length; i++) {
                      for (let j = 0; j < currentDeck.length; j++) {
                        if (seeds[i].name === currentDeck[j].name) {
                          entradas.push(`Bienvenido ${seeds[i].name}, tienes ${seeds[i].key} años`); //Comentada
                             entradas.push(`https://cdn.statsroyale.com/images/cards/full/${seeds[i].key}.png`);
                        }
                      }
                    }

                    console.log(entradas); 
                    res.render('data.ejs', { player: JSON.parse(body), url, entradas });
                }
            }
        }
    });
}) */