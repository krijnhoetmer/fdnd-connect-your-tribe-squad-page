// Importeer het npm pakket express uit de node_modules map
import express from 'express'

// Importeer de zelfgemaakte functie fetchJson uit de ./helpers map
import fetchJson from './helpers/fetch-json.js'

// Haal alle squads uit de WHOIS API op
const squadData = await fetchJson('https://fdnd.directus.app/items/squad')

// Maak een nieuwe express app aan
const app = express()

// Stel ejs in als template engine
app.set('view engine', 'ejs')

// Stel de map met ejs templates in
app.set('views', './views')

// Gebruik de map 'public' voor statische resources, zoals stylesheets, afbeeldingen en client-side JavaScript
app.use(express.static('public'))

// Zorg dat werken met request data makkelijker wordt
app.use(express.urlencoded({extended: true}))

// Zet een array klaar, waarin we alle globale berichten voor ons message board op gaan slaan
const messages = []

// Maak een GET route voor de index
app.get('/', function(request, response) {
  // Haal alle personen uit de WHOIS API op
  fetchJson('https://fdnd.directus.app/items/person').then((apiData) => {
    // apiData bevat gegevens van alle personen uit alle squads
    // Je zou dat hier kunnen filteren, sorteren, of zelfs aanpassen, voordat je het doorgeeft aan de view

    // Render index.ejs uit de views map en geef de opgehaalde data mee als variabele, genaamd persons
    // Geef ook de messages mee als variabele
    response.render('index', {
      persons: apiData.data,
      squads: squadData.data,
      messages: messages
    })
  })
})

// Maak een POST route voor de index
app.post('/', function(request, response) {
  // Voeg het nieuwe bericht toe aan de messages array
  messages.push(request.body.bericht)

  // Redirect hierna naar de homepage
  response.redirect(303, '/')
})


// Maak een GET route voor een detailpagina met een request parameter id
app.get('/detail/:id', function(request, response) {
  // Gebruik de request parameter id en haal de juiste persoon uit de WHOIS API op
  fetchJson('https://fdnd.directus.app/items/person/' + request.params.id).then((apiData) => {

    // Het custom field is een String, dus die moeten we eerst omzetten (= parsen)
    // naar een Object, zodat we er mee kunnen werken
    try {
      apiData.data.custom = JSON.parse(apiData.data.custom)
    } catch (e) {}

    // Render detail.ejs uit de views map en geef de opgehaalde data mee als variable, genaamd person
    response.render('detail', {person: apiData.data, squads: squadData.data})
  })
})

// Als we vanuit de browser een POST doen op de detailpagina van een persoon
app.post('/detail/:id', function(request, response) {

  // Stap 1: Haal de huidige data op, zodat we altijd up-to-date zijn, en niks weggooien van anderen

  // Haal eerst de huidige gegevens voor deze persoon op, uit de WHOIS API
  fetchJson('https://fdnd.directus.app/items/person/' + request.params.id).then((apiResponse) => {

    // Het custom field is een String, dus die moeten we eerst
    // omzetten (= parsen) naar een Object, zodat we er mee kunnen werken
    try {
      apiResponse.data.custom = JSON.parse(apiResponse.data.custom)
    } catch (e) {
      apiResponse.data.custom = {}
    }

    // Stap 2: Gebruik de data uit het formulier
    // Deze stap zal voor iedereen net even anders zijn, afhankelijk van de functionaliteit

    // Controleer eerst welke actie is uitgevoerd, aan de hand van de submit button
    // Dit kan ook op andere manieren, of in een andere POST route
    if (request.body.actie == 'verstuur') {

      // Als het custom object nog geen messages Array als eigenschap heeft, voeg deze dan toe
      if (!apiResponse.data.custom.messages) {
        apiResponse.data.custom.messages = []
      }

      // Voeg een nieuwe message toe voor deze persoon, aan de hand van het bericht uit het formulier
      apiResponse.data.custom.messages.push(request.body.message)

    } else if (request.body.actie == 'vind-ik-leuk') {

      apiResponse.data.custom.like = true

    } else if (request.body.actie == 'vind-ik-niet-leuk') {

      apiResponse.data.custom.like = false

    }


    // Stap 3: Sla de data op in de API

    // Voeg de nieuwe lijst messages toe in de WHOIS API,
    // via een PATCH request
    fetch('https://fdnd.directus.app/items/person/' + request.params.id, {
      method: 'PATCH',
      body: JSON.stringify({
        custom: apiResponse.data.custom
      }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8'
      }
    }).then((patchResponse) => {
      // Redirect naar de persoon pagina
      if (request.body.enhanced) {
        response.render('partials/like-button', {person: apiResponse.data})
      } else {
        response.redirect(303, '/detail/' + request.params.id)
      }
    })
  })
})

// Stel het poortnummer in waar express op moet gaan luisteren
app.set('port', process.env.PORT || 8000)

// Start express op, haal daarbij het zojuist ingestelde poortnummer op
app.listen(app.get('port'), function() {
  // Toon een bericht in de console en geef het poortnummer door
  console.log(`Application started on http://localhost:${app.get('port')}`)
})
