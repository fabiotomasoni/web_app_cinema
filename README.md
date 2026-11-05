# CinemaHub BG

PWA in italiano per UCI Orio e Starplex Romano. HTML/CSS/JavaScript senza dipendenze; raccolta dati Python 3.12 con sola libreria standard. Nessuna chiave API.

## Pubblicazione gratuita

Repository pubblica, GitHub Pages e Actions. In GitHub → Settings → Pages → Source scegliere **GitHub Actions**. Eseguire il workflow “Aggiorna programmazione” dalla scheda Actions. Il sito sarà https://fabiotomasoni.github.io/web_app_cinema/ . Non serve un dominio a pagamento.

Il workflow raccoglie e pubblica ogni tre ore, al minuto 17 UTC; gli orari pianificati possono subire ritardi GitHub. Nessun Mac acceso. Le esecuzioni standard su repository pubbliche sono gratuite: https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits . GitHub può sospendere workflow pianificati dopo 60 giorni senza attività: verificare Actions in caso di interruzione.

## Installazione

- iPhone: aprire il sito in Safari → Condividi → Aggiungi alla schermata Home.
- Mac con macOS Sonoma o successivo: Safari → File → Aggiungi al Dock.
- Altri Mac: usare un preferito Safari.

## Funzioni

Vista film con confronto dei cinema e vista cronologica; giorno, ricerca e cinema; tema scuro/chiaro; preferenze locali di vista, cinema e tema; locandine, durata, genere e versioni quando fornite. Gli orari passati sono attenuati. I collegamenti aprono la biglietteria ufficiale del cinema: occorre selezionare lo spettacolo lì.

Service worker con copia offline delle risorse e dei dati già consultati. Le immagini remote non sono garantite offline. La pagina ricarica i JSON ogni cinque minuti. Dati più vecchi di sei ore vengono segnalati. Un errore di raccolta conserva la precedente programmazione del cinema interessato. Nessun risultato vuoto viene interpretato come un errore se il servizio risponde correttamente con lista vuota.

## Fonti verificate il 5 novembre 2026

Gli ID Webtic sono confermati: 5363 = UCI Cinemas Orio al Serio Bergamo; 5641 = Starplex Romano. Il sito ufficiale https://www.romanodilombardia.starplex.it/romanodilombardia/programmazione collega esplicitamente il secondo ID. Le pagine https://webtic.it/local/5363/proxySecure/locals e https://webtic.it/local/5641/proxySecure/locals confermano le strutture.

Endpoint effettivamente usato dal frontend pubblico https://www.webtic.it/app/ (bundle chunk-ZZQLJZJB.js al momento della verifica): POST https://restapi.webtic.it/Webtic/CallOldWebtic con OldWebticRequest.meta.QueryParams contenente wtid=getFullScheduling, localid e trackid=33. Test reale: 843 spettacoli UCI, 86 Starplex. Il servizio non richiede autenticazione nelle richieste testate. È un endpoint non documentato, senza garanzia di stabilità o continuità gratuita.

robots.txt di restapi.webtic.it non conteneva esclusioni alla verifica; quello di webtic.it indicava la sitemap. Il raccoglitore verifica robots prima di accedere e si ferma in caso di divieto o errore di verifica. Due chiamate di programmazione ogni tre ore, senza aggirare restrizioni. Non sono state individuate condizioni pubbliche che garantiscano una licenza di redistribuzione o un limite quantitativo per questa API: accessibilità tecnica e robots non equivalgono a una licenza. Le informazioni di privacy/acquisto Webtic non documentano un'API pubblica. Locandine e informazioni restano dei rispettivi titolari.

Alternativa in caso di indisponibilità: ultimi dati validi con avviso e consultazione dei siti ufficiali; Starplex pubblica anche orari nelle pagine programmazione-sk?idfilm=… (verificato). Non è implementato uno scraper alternativo automatico: entrambi i cinema dipendono attualmente da Webtic.

## Sviluppo e verifica

Avvio locale: `python3 -m http.server 8000 --directory docs`, quindi http://localhost:8000 . Raccolta manuale: `python3 scripts/update.py`. Test: `python3 -m unittest discover -s tests`.

Verificati recupero reale dei due cinema, deduplicazione, identificativo cinema, errore della fonte, programmazione vuota e offset italiano estate/inverno. Le date vengono conservate con offset Europe/Rome. L'ora ripetuta del cambio autunnale è interpretata come prima occorrenza se la fonte non fornisce un offset.

Da verificare su dispositivi reali: layout e interazioni Safari, installazione iPhone/Mac e comportamento offline. Le disponibilità dei posti e i prezzi sono confermati solo dalla biglietteria.
