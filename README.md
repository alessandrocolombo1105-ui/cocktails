# Cocktails 🍹

Web app in Angular per esplorare le ricette di [TheCocktailDB](https://www.thecocktaildb.com):
cerca un drink per nome, sfoglialo per categoria, bicchiere, ingrediente o lettera iniziale e
apri la scheda completa con ingredienti, dosi e preparazione.

**Demo:** https://cocktails-swart.vercel.app

## Funzionalità

| Sezione          | Rotta                                 | Endpoint API                                  |
| ---------------- | ------------------------------------- | --------------------------------------------- |
| Home             | `/`                                   | `random.php`, `filter.php?c=…` (caroselli)    |
| Ricerca per nome | `/search?q=mojito`                    | `search.php?s={nome}`                         |
| Categorie        | `/categories`, `/categories/:name`    | `list.php?c=list`, `filter.php?c={categoria}` |
| Bicchieri        | `/glasses`, `/glasses/:name`          | `list.php?g=list`, `filter.php?g={bicchiere}` |
| Ingredienti      | `/ingredients`, `/ingredients/:name`  | `list.php?i=list`, `filter.php?i={ingrediente}` |
| A-Z              | `/alphabet/:letter`                   | `search.php?f={lettera}`                      |
| Scheda dettaglio | `/drink/:id`                          | `lookup.php?i={id}`                           |

- **Scheda dettaglio**: nome, immagine originale, categoria, bicchiere, tipo (alcolico/analcolico),
  ingredienti con le relative dosi (`strIngredient1..15` / `strMeasure1..15`) e preparazione
  divisa in passi. Se disponibili, le istruzioni sono mostrate in italiano.
- **Stati dell'interfaccia**: ogni chiamata gestisce esplicitamente _loading_ (spinner o
  scheletro), _error_ (messaggio chiaro + pulsante "Riprova") ed _empty_ ("Nessun risultato
  trovato", es. lettere U e X o ricerche senza corrispondenze).
- **URL condivisibili**: ricerca, filtri e lettere sono salvati nell'URL, quindi funzionano
  ricarica della pagina, link condivisi e tasto "indietro".
- **Immagini ottimizzate**: nelle liste si usa la variante `/medium` (350px) delle thumbnail,
  caricata in modo lazy; la scheda dettaglio usa l'immagine originale.

## Tecnologie

- [Angular 22](https://angular.dev) con componenti standalone, signals e `OnPush`
- RxJS per le chiamate HTTP (`HttpClient` + `switchMap` per annullare le richieste superate)
- SCSS, nessuna libreria UI esterna
- [Vitest](https://vitest.dev) per i test unitari

## Avvio rapido

Requisiti: Node.js 22.22+ o 24.15+ (richiesto da Angular 22) e npm.

```bash
npm install
npm start
```

Apri http://localhost:4200. L'app si ricarica automaticamente a ogni modifica.

| Comando         | Descrizione                                   |
| --------------- | --------------------------------------------- |
| `npm start`     | Server di sviluppo su `localhost:4200`        |
| `npm test`      | Esegue i test unitari                         |
| `npm run build` | Build di produzione in `dist/cocktails/`      |

## Struttura del progetto

```
src/app/
├── core/
│   ├── config/api.config.ts         URL base dell'API (InjectionToken)
│   ├── services/cocktail-api.service.ts  tutte le chiamate + normalizzazione risposte
│   └── navigation.ts                sezioni mostrate nel menu e in home
├── models/                          tipi della risposta API e del drink normalizzato
├── shared/
│   ├── components/                  card, griglia, carosello, barra A-Z,
│   │                                stati loading / error / empty
│   └── utils/                       stato delle richieste, URL immagini
├── features/
│   ├── home/                        hero con cocktail casuale + caroselli
│   ├── search/                      ricerca per nome
│   ├── browse/                      pagina generica "lista → cocktail filtrati"
│   │                                (categorie, bicchieri, ingredienti)
│   ├── alphabet/                    esplorazione A-Z
│   ├── drink-detail/                scheda completa del cocktail
│   └── not-found/                   pagina 404
└── layout/                          header e footer
```

Alcune scelte:

- **Un solo service per l'API.** `CocktailApiService` converte le risposte in un formato
  comodo per la UI: `drinks: null` e `"no data found"` diventano un array vuoto, gli
  ingredienti diventano una lista `{ name, measure }`.
- **Stato delle richieste uniforme.** L'operatore `toRequestState()` trasforma ogni chiamata in
  `loading` → `success` / `error`; il componente `app-drink-results` mostra lo stato giusto.
- **Una pagina, tre sezioni.** Categorie, bicchieri e ingredienti condividono il componente
  `Browse`, configurato tramite `data` della rotta (`browse-config.ts`).

## Limiti della chiave API gratuita

L'app usa la chiave pubblica di test `1`, che ha alcune restrizioni:

- `filter.php?i={ingrediente}` restituisce **un solo cocktail** per ingrediente (nella pagina
  viene mostrata una nota);
- `search.php` restituisce al massimo **25 risultati** per ricerca o lettera.

Categorie e bicchieri restituiscono invece l'elenco completo.

## Grafica

Tema scuro "cocktail bar" con font Playfair Display e Inter. Le foto dell'API hanno sfondi
reali: per ottenere l'effetto "bicchiere fluttuante" vengono ritagliate in un cerchio sfumato
con un'ombra sottostante. Gli ingredienti usano invece i PNG trasparenti forniti dall'API.

## Deploy

Il progetto è pubblicato su [Vercel](https://vercel.com), che rileva Angular automaticamente
(build `npm run build`, output `dist/cocktails/browser`).

---

Dati e immagini © [TheCocktailDB](https://www.thecocktaildb.com).
